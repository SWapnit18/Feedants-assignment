import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api, uploadFile, type UploadInput } from './endpoints';
import type { ApiError } from './client';
import type {
  AvailabilityResponse,
  CompetitionDetailsResponse,
  Lang,
  VerifyPaymentBody,
} from './types';
import { useAuth } from '../auth/AuthProvider';

export const AVAILABILITY_POLL_MS = 10_000;

/** Competition details + the measured offset between server clock and device clock. */
export interface CompetitionData extends CompetitionDetailsResponse {
  /** serverNow ≈ Date.now() + clockOffsetMs */
  clockOffsetMs: number;
}

export const queryKeys = {
  competitionRoot: ['competition'] as const,
  competition: (slug: string, lang: Lang, userId: string | null) =>
    ['competition', slug, lang, userId ?? 'anon'] as const,
  availability: (id: string) => ['availability', id] as const,
  testimonials: (id: string, lang: Lang) => ['testimonials', id, lang] as const,
  referral: (userId: string | null) => ['referral', userId ?? 'anon'] as const,
  demoUsers: ['demoUsers'] as const,
};

/** Offset estimate using the request midpoint to cancel out half of the round-trip latency. */
const measureOffset = (serverTime: string, sentAt: number, receivedAt: number) => {
  const server = Date.parse(serverTime);
  if (Number.isNaN(server)) return 0;
  return server - (sentAt + receivedAt) / 2;
};

export function useCompetition(slug: string, lang: Lang) {
  const { user, ready } = useAuth();
  return useQuery<CompetitionData, ApiError>({
    queryKey: queryKeys.competition(slug, lang, user?.id ?? null),
    enabled: ready,
    queryFn: async ({ signal }) => {
      const sentAt = Date.now();
      const res = await api.competition(slug, lang, signal);
      return { ...res, clockOffsetMs: measureOffset(res.serverTime, sentAt, Date.now()) };
    },
    placeholderData: (prev) => (prev && prev.competition.slug === slug ? prev : undefined),
  });
}

export const invalidateCompetition = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: queryKeys.competitionRoot });

/**
 * Cheap availability polling (every 10s). react-query pauses interval refetches while the app is
 * backgrounded because focusManager is wired to AppState (see QueryProvider). Fresh seat counts are
 * merged into the details cache; a lifecycle phase change triggers a full refetch so the CTA updates.
 */
export function useAvailability(competitionId: string | undefined, slug: string, lang: Lang) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const query = useQuery<AvailabilityResponse & { clockOffsetMs: number }, ApiError>({
    queryKey: queryKeys.availability(competitionId ?? ''),
    enabled: !!competitionId,
    refetchInterval: AVAILABILITY_POLL_MS,
    refetchIntervalInBackground: false,
    staleTime: 2_000,
    queryFn: async ({ signal }) => {
      const sentAt = Date.now();
      const res = await api.availability(competitionId as string, signal);
      return { ...res, clockOffsetMs: measureOffset(res.serverTime, sentAt, Date.now()) };
    },
  });

  const lastSynced = useRef<number>(0);
  useEffect(() => {
    const fresh = query.data;
    if (!fresh || query.dataUpdatedAt === lastSynced.current) return;
    lastSynced.current = query.dataUpdatedAt;
    const key = queryKeys.competition(slug, lang, user?.id ?? null);
    const current = qc.getQueryData<CompetitionData>(key);
    if (!current || current.competition.id !== competitionId) return;
    // Ignore responses older than what we already have.
    if (Date.parse(fresh.serverTime) < Date.parse(current.serverTime)) return;

    const lifecycleChanged =
      current.lifecycle.phase !== fresh.lifecycle.phase ||
      current.availability.isFull !== fresh.availability.isFull ||
      current.lifecycle.nextDeadline?.at !== fresh.lifecycle.nextDeadline?.at;

    qc.setQueryData<CompetitionData>(key, {
      ...current,
      serverTime: fresh.serverTime,
      clockOffsetMs: fresh.clockOffsetMs,
      availability: fresh.availability,
      lifecycle: fresh.lifecycle,
    });
    if (lifecycleChanged) void qc.invalidateQueries({ queryKey: key });
  }, [query.data, query.dataUpdatedAt, qc, slug, lang, user?.id, competitionId]);

  return query;
}

export function useTestimonials(competitionId: string | undefined, lang: Lang, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.testimonials(competitionId ?? '', lang),
    enabled: enabled && !!competitionId,
    queryFn: () => api.testimonials(competitionId as string, lang),
    staleTime: 5 * 60_000,
  });
}

export function useReferral() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.referral(user?.id ?? null),
    enabled: !!user,
    queryFn: api.referral,
    staleTime: 60_000,
  });
}

export function useDemoUsers(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.demoUsers,
    enabled,
    queryFn: api.demoUsers,
    staleTime: 5 * 60_000,
  });
}

// ---------------- Mutations ----------------
// Every mutating call receives an Idempotency-Key chosen by the caller (one per user intent,
// reused across retries – see useIdempotencyKey).

export function useRegister(competitionId: string | undefined) {
  return useMutation({
    mutationFn: ({ idempotencyKey }: { idempotencyKey: string }) =>
      api.register(competitionId as string, idempotencyKey),
  });
}

export function useMockCheckout() {
  return useMutation({ mutationFn: ({ orderId }: { orderId: string }) => api.mockCheckout(orderId) });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (v: { registrationId: string; body: VerifyPaymentBody; idempotencyKey: string }) =>
      api.verifyPayment(v.registrationId, v.body, v.idempotencyKey),
  });
}

export function useCancelHold() {
  return useMutation({ mutationFn: ({ registrationId }: { registrationId: string }) => api.cancelHold(registrationId) });
}

export function useCreateSubmission(competitionId: string | undefined) {
  return useMutation({
    mutationFn: (v: { mediaUrl: string; caption?: string; idempotencyKey: string }) =>
      api.createSubmission(
        competitionId as string,
        { mediaUrl: v.mediaUrl, ...(v.caption ? { caption: v.caption } : {}) },
        v.idempotencyKey,
      ),
  });
}

/** Upload mutation exposing live progress (0..1). */
export function useUploadFile() {
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<(() => void) | null>(null);
  const mutation = useMutation({
    mutationFn: async (file: UploadInput) => {
      setProgress(0);
      const { promise, abort } = uploadFile(file, setProgress);
      abortRef.current = abort;
      try {
        return await promise;
      } finally {
        abortRef.current = null;
      }
    },
  });
  return { ...mutation, progress, abort: () => abortRef.current?.() };
}
