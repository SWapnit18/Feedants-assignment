import { useCallback, useMemo, useRef } from 'react';
import { randomUUID } from 'expo-crypto';
import { isApiError } from '../api/client';

/**
 * One Idempotency-Key per *user intent*. `get()` lazily creates the key and keeps returning the same
 * one while the intent is in flight or being retried after a transient failure (network / 5xx),
 * so the server can replay the stored response instead of double-booking or double-charging.
 * `settle(error?)` ends the intent unless the error is retryable.
 */
export function useIdempotencyKey() {
  const key = useRef<string | null>(null);

  const get = useCallback(() => {
    if (!key.current) key.current = randomUUID();
    return key.current;
  }, []);

  const reset = useCallback(() => {
    key.current = null;
  }, []);

  const settle = useCallback((error?: unknown) => {
    // keep the key for a retry: transient failures, or the same request still in flight on the server
    if (error && isApiError(error) && (error.isRetryable || error.code === 'IDEMPOTENCY_CONFLICT')) return;
    key.current = null;
  }, []);

  return useMemo(() => ({ get, reset, settle }), [get, reset, settle]);
}
