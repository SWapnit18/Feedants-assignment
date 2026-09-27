import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Server-synchronised "now". The device clock can be wrong by minutes, so every competition
 * response carries `serverTime`; we keep the measured offset and tick once per second
 * (aligned to the wall-clock second so all countdowns change together).
 */
export function useServerNow(clockOffsetMs: number, active = true): number {
  const [now, setNow] = useState(() => Date.now() + clockOffsetMs);
  const offsetRef = useRef(clockOffsetMs);
  offsetRef.current = clockOffsetMs;

  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = Date.now() + offsetRef.current;
      setNow(current);
      timer = setTimeout(tick, 1000 - (current % 1000) + 5);
    };
    tick();
    // Timers are throttled in background – resync immediately when we come back.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        clearTimeout(timer);
        tick();
      }
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [active, clockOffsetMs]);

  return now;
}

/**
 * Remaining ms until `targetIso` on the server clock. Calls `onElapsed` exactly once per target
 * when the countdown crosses zero (used to invalidate the competition query so lifecycle/CTA refresh).
 */
export function useCountdown(
  targetIso: string | null | undefined,
  clockOffsetMs: number,
  onElapsed?: () => void,
): { remainingMs: number; elapsed: boolean } {
  const target = targetIso ? Date.parse(targetIso) : NaN;
  const valid = !Number.isNaN(target);
  const now = useServerNow(clockOffsetMs, valid);
  const remainingMs = valid ? Math.max(0, target - now) : 0;
  const elapsed = valid && remainingMs === 0;

  const firedFor = useRef<number | null>(null);
  const cb = useRef(onElapsed);
  cb.current = onElapsed;
  useEffect(() => {
    if (elapsed && firedFor.current !== target) {
      firedFor.current = target;
      cb.current?.();
    }
  }, [elapsed, target]);

  return { remainingMs, elapsed };
}
