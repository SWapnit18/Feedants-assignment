import { authHeaders, buildUrl, request, toApiError, ApiError } from './client';
import type {
  AvailabilityResponse,
  CancelHoldResponse,
  CompetitionDetailsResponse,
  CreateSubmissionBody,
  CreateSubmissionResponse,
  DemoUsersResponse,
  DevLoginResponse,
  Lang,
  MeResponse,
  MockCheckoutResponse,
  MySubmissionResponse,
  ReferralResponse,
  RegisterResponse,
  TestimonialsResponse,
  UploadResponse,
  VerifyPaymentBody,
  VerifyPaymentResponse,
} from './types';

/** Thin, typed functions – one per endpoint in docs/API_CONTRACT.md. */
export const api = {
  devLogin: (email: string) =>
    request<DevLoginResponse>('/auth/dev-login', { method: 'POST', body: { email }, anonymous: true }),

  demoUsers: () => request<DemoUsersResponse>('/auth/users'),

  me: () => request<MeResponse>('/me'),

  competition: (idOrSlug: string, lang: Lang, signal?: AbortSignal) =>
    request<CompetitionDetailsResponse>(`/competitions/${encodeURIComponent(idOrSlug)}`, {
      query: { lang },
      signal,
    }),

  availability: (id: string, signal?: AbortSignal) =>
    request<AvailabilityResponse>(`/competitions/${encodeURIComponent(id)}/availability`, { signal }),

  testimonials: (id: string, lang: Lang, limit = 10) =>
    request<TestimonialsResponse>(`/competitions/${encodeURIComponent(id)}/testimonials`, {
      query: { limit, lang },
    }),

  register: (competitionId: string, idempotencyKey: string) =>
    request<RegisterResponse>(`/competitions/${encodeURIComponent(competitionId)}/registrations`, {
      method: 'POST',
      body: {},
      idempotencyKey,
    }),

  mockCheckout: (orderId: string) =>
    request<MockCheckoutResponse>('/payments/mock/checkout', { method: 'POST', body: { orderId } }),

  verifyPayment: (registrationId: string, body: VerifyPaymentBody, idempotencyKey: string) =>
    request<VerifyPaymentResponse>(`/registrations/${encodeURIComponent(registrationId)}/verify-payment`, {
      method: 'POST',
      body,
      idempotencyKey,
    }),

  cancelHold: (registrationId: string) =>
    request<CancelHoldResponse>(`/registrations/${encodeURIComponent(registrationId)}`, { method: 'DELETE' }),

  createSubmission: (competitionId: string, body: CreateSubmissionBody, idempotencyKey: string) =>
    request<CreateSubmissionResponse>(`/competitions/${encodeURIComponent(competitionId)}/submissions`, {
      method: 'POST',
      body,
      idempotencyKey,
    }),

  mySubmission: (competitionId: string) =>
    request<MySubmissionResponse>(`/competitions/${encodeURIComponent(competitionId)}/submissions/me`),

  referral: () => request<ReferralResponse>('/me/referral'),
};

export interface UploadInput {
  uri: string;
  name: string;
  mimeType: string;
}

/**
 * Multipart upload (field `file`). Uses XMLHttpRequest because fetch has no upload-progress events in RN.
 */
export function uploadFile(
  file: UploadInput,
  onProgress?: (fraction: number) => void,
): { promise: Promise<UploadResponse>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<UploadResponse>((resolve, reject) => {
    xhr.open('POST', buildUrl('/uploads'));
    xhr.setRequestHeader('Accept', 'application/json');
    Object.entries(authHeaders()).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.timeout = 5 * 60_000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      let payload: unknown = null;
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        payload = xhr.responseText;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve(payload as UploadResponse);
      } else {
        reject(toApiError(xhr.status, payload));
      }
    };
    xhr.onerror = () => reject(new ApiError('NETWORK_ERROR', 'Upload failed – network error', 0));
    xhr.ontimeout = () => reject(new ApiError('TIMEOUT', 'Upload timed out', 0));
    xhr.onabort = () => reject(new ApiError('UNKNOWN', 'Upload cancelled', 0));

    const form = new FormData();
    // React Native's FormData accepts a { uri, name, type } descriptor for files.
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
    xhr.send(form);
  });
  return { promise, abort: () => xhr.abort() };
}
