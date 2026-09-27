/**
 * We never trust the device clock for a countdown against a shared server
 * deadline (it drifts, and users can change it). Instead we compute the
 * offset between server time (returned with every details response) and
 * local Date.now() once, and apply that offset every tick so the countdown
 * stays accurate even if it's minutes before device time is off.
 */
export function computeServerOffsetMs(serverTimeIso) {
  return new Date(serverTimeIso).getTime() - Date.now();
}

export function formatCountdown(targetIso, serverOffsetMs = 0) {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  const nowAdjusted = Date.now() + serverOffsetMs;
  const diffMs = Math.max(target - nowAdjusted, 0);

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: diffMs <= 0,
    label: `${String(days).padStart(2, '0')}d : ${String(hours).padStart(2, '0')}h : ${String(
      minutes
    ).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`,
  };
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
