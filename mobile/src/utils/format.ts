import type { Lang } from '../api/types';

/** Indian digit grouping: 150000 → "1,50,000". Avoids relying on Intl (inconsistent on Hermes/Android). */
const groupIndian = (n: number): string => {
  const [intPart, frac] = Math.abs(n).toString().split('.');
  const last3 = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
  return `${n < 0 ? '-' : ''}${grouped}${frac ? `.${frac}` : ''}`;
};

/**
 * Integer paise → rupee string. 150000 → "₹1,500", 9950 → "₹99.50".
 * `spaced` adds a space after the symbol like the large figures in the design ("₹ 1,500").
 */
export function formatCurrency(paise: number, opts: { spaced?: boolean } = {}): string {
  const rupees = paise / 100;
  const value = Number.isInteger(rupees) ? groupIndian(rupees) : groupIndian(Number(rupees.toFixed(2)));
  return `₹${opts.spaced ? ' ' : ''}${value}`;
}

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
  hi: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सितं', 'अक्टू', 'नवं', 'दिसं'],
};

/** "10 Aug 26" (device-local time zone). */
export function formatShortDate(iso: string, lang: Lang = 'en'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS[lang][d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

/** "11:50 PM" / "04:00 AM" (zero-padded hour, as in the design). */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h24 = d.getHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

export const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function splitDuration(ms: number): DurationParts {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

/** "01d : 06h : 28m : 32s" */
export function formatCountdown(ms: number): string {
  const { days, hours, minutes, seconds } = splitDuration(ms);
  return `${pad2(days)}d : ${pad2(hours)}h : ${pad2(minutes)}m : ${pad2(seconds)}s`;
}

/** "09:59" */
export function formatMinSec(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

export const isVideoUrl = (url: string, mimeType?: string | null) =>
  mimeType ? mimeType.startsWith('video/') : /\.(mp4|mov|m4v|webm|mkv|3gp)(\?|$)/i.test(url);

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
