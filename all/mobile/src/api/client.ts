import { Platform } from 'react-native';
import type { ApiErrorCode, ClientErrorCode, ErrorEnvelope } from './types';

/**
 * Base URL resolution:
 *  - EXPO_PUBLIC_API_URL wins (set it to http://<LAN-IP>:4000/api/v1 for a physical device).
 *  - Android emulator cannot reach the host via localhost, so default to 10.0.2.2 there.
 */
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? `${DEFAULT_HOST}/api/v1`).replace(/\/+$/, '');
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, '');

const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  readonly code: ApiErrorCode | ClientErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiErrorCode | ClientErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** Network failures, timeouts and 5xx are safe to retry with the same Idempotency-Key. */
  get isRetryable(): boolean {
    return this.status === 0 || this.status >= 500 || this.code === 'RATE_LIMITED';
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

// ---------- Auth token (owned by AuthProvider, read by every request) ----------
let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};
export const getAuthToken = () => authToken;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  unauthorizedHandler = fn;
};

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Query;
  body?: unknown;
  idempotencyKey?: string;
  signal?: AbortSignal;
  /** Skip the Authorization header (e.g. dev-login). */
  anonymous?: boolean;
}

export const buildUrl = (path: string, query?: Query) => {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${url}?${qs}` : url;
};

export const authHeaders = (anonymous = false): Record<string, string> =>
  !anonymous && authToken ? { Authorization: `Bearer ${authToken}` } : {};

const isErrorEnvelope = (v: unknown): v is ErrorEnvelope =>
  typeof v === 'object' &&
  v !== null &&
  'error' in v &&
  typeof (v as ErrorEnvelope).error?.code === 'string';

/** Converts any non-2xx response body into a typed ApiError. */
export const toApiError = (status: number, payload: unknown): ApiError => {
  if (isErrorEnvelope(payload)) {
    const { code, message, details } = payload.error;
    if (code === 'UNAUTHENTICATED') unauthorizedHandler?.();
    return new ApiError(code, message, status, details);
  }
  if (status === 401) unauthorizedHandler?.();
  return new ApiError(status >= 500 ? 'INTERNAL' : 'UNKNOWN', `Request failed (${status})`, status, payload);
};

const parseBody = async (res: Response): Promise<unknown> => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, idempotencyKey, signal, anonymous } = opts;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...authHeaders(anonymous),
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (signal?.aborted) throw e; // caller cancelled (react-query) – propagate as-is
    const timedOut = controller.signal.aborted;
    throw new ApiError(
      timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
      timedOut ? 'The request timed out' : `Cannot reach ${API_BASE_URL}`,
      0,
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }

  const payload = await parseBody(res);
  if (!res.ok) throw toApiError(res.status, payload);
  return payload as T;
}

/**
 * Media URLs may be relative (`/uploads/x.mp4`) or point at `localhost` (dev disk storage).
 * Rewrite them against the configured API origin so they also load on devices/emulators.
 */
export const resolveMediaUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  const local = url.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/);
  if (local && !/localhost|127\.0\.0\.1/.test(API_ORIGIN)) return url.replace(local[0], API_ORIGIN);
  return url;
};
