import { useCallback, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import {
  invalidateCompetition,
  queryKeys,
  useCancelHold,
  useCreateSubmission,
  useMockCheckout,
  useRegister,
  useUploadFile,
  useVerifyPayment,
  type CompetitionData,
} from '../api/hooks';
import { isApiError } from '../api/client';
import type { MockCheckoutResponse, PaymentOrder, PrimaryAction } from '../api/types';
import { useIdempotencyKey } from './useIdempotencyKey';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { useToast } from '../components/Toast';
import type { PaymentStage } from '../components/sheets/PaymentSheet';
import type { PickedFile, SubmissionStage } from '../components/sheets/SubmissionSheet';
import type { MediaItem } from '../components/VideoModal';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/** Errors after which the current flow can't continue – close the sheet and resync with the server. */
const TERMINAL_PAYMENT_CODES = new Set(['HOLD_EXPIRED', 'COMPETITION_FULL', 'REGISTRATION_CLOSED', 'NOT_FOUND', 'FORBIDDEN']);
const TERMINAL_SUBMISSION_CODES = new Set(['ALREADY_SUBMITTED', 'SUBMISSION_WINDOW_CLOSED', 'NOT_REGISTERED', 'NOT_FOUND']);

interface PaymentSession {
  registrationId: string;
  holdExpiresAt: string | null;
  payment: PaymentOrder;
  /** Cached checkout result so a verify retry sends the identical body with the same Idempotency-Key. */
  checkout: MockCheckoutResponse | null;
}

/**
 * Orchestrates everything the primary CTA can do. The *type* of action always comes from the API;
 * this hook only executes it, guards against double taps and reconciles with the server afterwards.
 */
export function useCompetitionActions(data: CompetitionData | undefined, onViewMedia: (m: MediaItem) => void) {
  const qc = useQueryClient();
  const auth = useAuth();
  const toast = useToast();
  const { t, errorMessage } = useI18n();
  const competitionId = data?.competition.id;

  const register = useRegister(competitionId);
  const checkout = useMockCheckout();
  const verify = useVerifyPayment();
  const cancelHold = useCancelHold();
  const upload = useUploadFile();
  const createSubmission = useCreateSubmission(competitionId);

  const registerKey = useIdempotencyKey();
  const verifyKey = useIdempotencyKey();
  const submitKey = useIdempotencyKey();
  const inFlight = useRef(false);

  const refresh = useCallback(() => {
    void invalidateCompetition(qc);
    if (competitionId) void qc.invalidateQueries({ queryKey: queryKeys.availability(competitionId) });
  }, [qc, competitionId]);

  // ---------------- Registration + payment ----------------
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [paymentStage, setPaymentStage] = useState<PaymentStage>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const startRegistration = useCallback(async () => {
    try {
      const res = await register.mutateAsync({ idempotencyKey: registerKey.get() });
      registerKey.settle();
      if (!res.payment || res.registration.status === 'confirmed') {
        toast(t('registeredFree'), 'success');
      } else {
        setPaymentError(null);
        setPaymentStage('idle');
        setSession({
          registrationId: res.registration.id,
          holdExpiresAt: res.registration.holdExpiresAt,
          payment: res.payment,
          checkout: null,
        });
      }
    } catch (e) {
      registerKey.settle(e);
      toast(errorMessage(e), 'error');
    } finally {
      refresh(); // seat counts + CTA changed (or we were out of date) – resync either way
    }
  }, [register, registerKey, toast, t, errorMessage, refresh]);

  const pay = useCallback(async () => {
    if (!session || paymentStage !== 'idle') return;
    setPaymentError(null);
    let paid = false; // true once a checkout exists → a failure after this point implies a refund
    try {
      let result = session.checkout;
      if (!result) {
        setPaymentStage('paying');
        result = await checkout.mutateAsync({ orderId: session.payment.orderId });
        const cached = result;
        setSession((s) => (s ? { ...s, checkout: cached } : s));
      }
      paid = true;
      setPaymentStage('verifying');
      await verify.mutateAsync({
        registrationId: session.registrationId,
        body: result,
        idempotencyKey: verifyKey.get(),
      });
      verifyKey.settle();
      setSession(null);
      toast(t('paymentSuccess'), 'success');
      refresh();
    } catch (e) {
      verifyKey.settle(e);
      if (isApiError(e) && TERMINAL_PAYMENT_CODES.has(e.code)) {
        setSession(null);
        // A HOLD_EXPIRED from verify means money was captured but the seat is gone → refund.
        toast(e.code === 'HOLD_EXPIRED' && paid ? t('holdExpiredRefund') : errorMessage(e), 'error');
        refresh();
      } else {
        if (isApiError(e) && e.code === 'PAYMENT_VERIFICATION_FAILED') {
          setSession((s) => (s ? { ...s, checkout: null } : s)); // start a fresh checkout next time
        }
        setPaymentError(errorMessage(e));
      }
    } finally {
      setPaymentStage('idle');
    }
  }, [session, paymentStage, checkout, verify, verifyKey, toast, t, errorMessage, refresh]);

  const releaseSeat = useCallback(async () => {
    if (!session || paymentStage !== 'idle') return;
    setPaymentStage('releasing');
    try {
      await cancelHold.mutateAsync({ registrationId: session.registrationId });
      setSession(null);
      toast(t('seatReleased'), 'info');
    } catch (e) {
      setPaymentError(errorMessage(e));
    } finally {
      setPaymentStage('idle');
      refresh();
    }
  }, [session, paymentStage, cancelHold, toast, t, errorMessage, refresh]);

  const closePayment = useCallback(() => {
    // Keeping the hold: the server now reports `complete_payment`, so the CTA resumes this flow.
    setSession(null);
    setPaymentError(null);
    refresh();
  }, [refresh]);

  const onHoldExpired = useCallback(() => {
    setPaymentError(t('err_HOLD_EXPIRED'));
    refresh();
  }, [t, refresh]);

  // ---------------- Submission ----------------
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [caption, setCaption] = useState('');
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  /** uri → uploaded URL, so retrying createSubmission never re-uploads the same file. */
  const uploaded = useRef<Map<string, string>>(new Map());

  const pickFile = useCallback(async () => {
    setSubmissionError(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted && perm.accessPrivileges !== 'limited') {
        setSubmissionError(t('permissionDenied'));
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos', 'images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      if (res.canceled || !res.assets[0]) return;
      const a = res.assets[0];
      if (a.fileSize && a.fileSize > MAX_UPLOAD_BYTES) {
        setSubmissionError(t('fileTooLarge'));
        return;
      }
      const isVideo = a.type === 'video' || !!a.mimeType?.startsWith('video/');
      const ext = isVideo ? 'mp4' : 'jpg';
      setFile({
        uri: a.uri,
        name: a.fileName ?? `submission-${Date.now()}.${ext}`,
        mimeType: a.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg'),
        size: a.fileSize,
        isVideo,
      });
      submitKey.reset(); // new file → new intent
    } catch (e) {
      setSubmissionError(errorMessage(e));
    }
  }, [t, errorMessage, submitKey]);

  const submit = useCallback(async () => {
    if (!file || submissionStage !== 'idle') return;
    setSubmissionError(null);
    try {
      let mediaUrl = uploaded.current.get(file.uri);
      if (!mediaUrl) {
        setSubmissionStage('uploading');
        const res = await upload.mutateAsync({ uri: file.uri, name: file.name, mimeType: file.mimeType });
        mediaUrl = res.url;
        uploaded.current.set(file.uri, mediaUrl);
      }
      setSubmissionStage('submitting');
      await createSubmission.mutateAsync({
        mediaUrl,
        caption: caption.trim() || undefined,
        idempotencyKey: submitKey.get(),
      });
      submitKey.settle();
      setSubmissionOpen(false);
      setFile(null);
      setCaption('');
      toast(t('submissionSuccess'), 'success');
      refresh();
    } catch (e) {
      submitKey.settle(e);
      if (isApiError(e) && e.status === 413) {
        setSubmissionError(t('fileTooLarge'));
      } else if (isApiError(e) && TERMINAL_SUBMISSION_CODES.has(e.code)) {
        setSubmissionOpen(false);
        toast(errorMessage(e), 'error');
        refresh();
      } else {
        setSubmissionError(errorMessage(e));
      }
    } finally {
      setSubmissionStage('idle');
    }
  }, [file, submissionStage, upload, createSubmission, caption, submitKey, toast, t, errorMessage, refresh]);

  const closeSubmission = useCallback(() => {
    setSubmissionOpen(false);
    setSubmissionError(null);
  }, []);

  // ---------------- CTA dispatcher ----------------
  const onPrimaryAction = useCallback(
    async (action: PrimaryAction) => {
      if (!action.enabled || inFlight.current || !data) return;
      inFlight.current = true;
      try {
        switch (action.type) {
          case 'login':
            await auth.login().catch((e: unknown) => toast(errorMessage(e), 'error'));
            break;
          case 'register':
          case 'complete_payment':
            // For an existing pending hold the API returns that same hold (200) with its order.
            await startRegistration();
            break;
          case 'upload_submission':
            setSubmissionError(null);
            setSubmissionOpen(true);
            break;
          case 'view_submission': {
            const s = data.viewer?.submission;
            if (s) onViewMedia({ url: s.mediaUrl, title: t('yourSubmission'), subtitle: s.caption });
            break;
          }
          case 'view_results':
            toast(t('resultsInfo'), 'info');
            break;
          default:
            break; // disabled informational states
        }
      } finally {
        inFlight.current = false;
      }
    },
    [data, auth, toast, errorMessage, startRegistration, onViewMedia, t],
  );

  const busy = register.isPending || auth.loggingIn;

  return {
    onPrimaryAction,
    ctaBusy: busy,
    payment: {
      visible: !!session,
      payment: session?.payment ?? null,
      holdExpiresAt: session?.holdExpiresAt ?? null,
      stage: paymentStage,
      error: paymentError,
      onPay: pay,
      onRelease: releaseSeat,
      onClose: closePayment,
      onHoldExpired,
    },
    submission: {
      visible: submissionOpen,
      file,
      caption,
      onCaptionChange: setCaption,
      stage: submissionStage,
      progress: upload.progress,
      error: submissionError,
      onPick: pickFile,
      onSubmit: submit,
      onClose: closeSubmission,
    },
  };
}
