'use strict';

/**
 * Pure, side-effect-free competition lifecycle rules. Everything here takes
 * `now` explicitly (server clock) so it is deterministic and unit-testable.
 * See docs/API_CONTRACT.md "Phase rule" and "primaryAction decision".
 */

const { formatINR } = require('../utils/money');

/**
 * @typedef {Object} CompetitionDates
 * @property {Date} registrationOpensAt
 * @property {Date} registrationClosesAt
 * @property {Date} submissionStartsAt
 * @property {Date} submissionEndsAt
 * @property {Date} resultAt
 *
 * @typedef {Object} CompetitionLike
 * @property {'draft'|'published'|'cancelled'} status
 * @property {CompetitionDates} dates
 * @property {number} capacity
 * @property {number} bookedCount
 * @property {number} entryFee  paise
 */

const ts = (d) => new Date(d).getTime();

/**
 * @param {Pick<CompetitionLike,'capacity'|'bookedCount'>} c
 */
function computeAvailability(c) {
  const booked = Math.min(Math.max(c.bookedCount || 0, 0), c.capacity);
  const remaining = Math.max(c.capacity - booked, 0);
  return { capacity: c.capacity, booked, remaining, isFull: remaining === 0 };
}

/**
 * @param {Pick<CompetitionLike,'status'|'dates'>} c
 * @param {Date} now
 */
function computeLifecycle(c, now) {
  const n = ts(now);
  const d = c.dates;
  const published = c.status === 'published';
  const cancelled = c.status === 'cancelled';

  const registrationOpen = published && ts(d.registrationOpensAt) <= n && n < ts(d.registrationClosesAt);
  const submissionOpen = published && ts(d.submissionStartsAt) <= n && n < ts(d.submissionEndsAt);
  const resultsOut = published && n >= ts(d.resultAt);

  let phase;
  if (cancelled) phase = 'cancelled';
  else if (resultsOut) phase = 'results_announced';
  else if (n >= ts(d.submissionEndsAt)) phase = 'judging';
  else if (submissionOpen) phase = 'submission_open';
  else if (registrationOpen) phase = 'registration_open';
  else if (n >= ts(d.registrationClosesAt) && n < ts(d.submissionStartsAt)) phase = 'registration_closed';
  else phase = 'upcoming';

  return {
    phase,
    registrationOpen,
    submissionOpen,
    resultsOut,
    nextDeadline: cancelled ? null : computeNextDeadline(d, n),
  };
}

/** Earliest lifecycle event strictly in the future, or null. */
function computeNextDeadline(d, n) {
  const events = [
    { type: 'registration_opens', at: d.registrationOpensAt },
    { type: 'registration_closes', at: d.registrationClosesAt },
    { type: 'submission_starts', at: d.submissionStartsAt },
    { type: 'submission_ends', at: d.submissionEndsAt },
    { type: 'result', at: d.resultAt },
  ]
    .filter((e) => ts(e.at) > n)
    .sort((a, b) => ts(a.at) - ts(b.at));
  return events.length ? { type: events[0].type, at: new Date(events[0].at).toISOString() } : null;
}

const LABELS = {
  en: {
    login: 'Login to Register',
    register: (fee) => `Register Now · ${fee}`,
    free: 'Free',
    complete_payment: (fee) => `Complete Payment · ${fee}`,
    upload_submission: 'Upload Submission',
    view_submission: 'View Submission',
    submission_not_started: 'Submissions Open Soon',
    registration_closed: 'Registration Closed',
    full: 'Competition Full',
    not_open_yet: 'Registration Opens Soon',
    judging: 'Judging in Progress',
    view_results: 'View Results',
    cancelled: 'Competition Cancelled',
    registered: 'Registered',
    submitted: 'Submitted',
  },
  hi: {
    login: 'रजिस्टर करने के लिए लॉगिन करें',
    register: (fee) => `अभी रजिस्टर करें · ${fee}`,
    free: 'निःशुल्क',
    complete_payment: (fee) => `भुगतान पूरा करें · ${fee}`,
    upload_submission: 'प्रविष्टि अपलोड करें',
    view_submission: 'प्रविष्टि देखें',
    submission_not_started: 'प्रविष्टियाँ जल्द शुरू होंगी',
    registration_closed: 'रजिस्ट्रेशन बंद',
    full: 'प्रतियोगिता भर चुकी है',
    not_open_yet: 'रजिस्ट्रेशन जल्द खुलेगा',
    judging: 'मूल्यांकन जारी है',
    view_results: 'परिणाम देखें',
    cancelled: 'प्रतियोगिता रद्द',
    registered: 'रजिस्टर्ड',
    submitted: 'जमा किया गया',
  },
};

const action = (type, enabled, label, subLabel = null) => ({ type, enabled, label, subLabel });

/**
 * Is a pending hold still valid at `now`?
 * @param {{status: string, holdExpiresAt?: Date|string|null} | null | undefined} registration
 */
function isHoldActive(registration, now) {
  return (
    !!registration &&
    registration.status === 'pending_payment' &&
    !!registration.holdExpiresAt &&
    ts(registration.holdExpiresAt) > ts(now)
  );
}

/**
 * Decide the single primary CTA for a viewer.
 * @param {Object} input
 * @param {CompetitionLike} input.competition
 * @param {ReturnType<typeof computeLifecycle>} input.lifecycle
 * @param {ReturnType<typeof computeAvailability>} input.availability
 * @param {{status: string, holdExpiresAt?: Date|null} | null} [input.registration]
 * @param {object | null} [input.submission]
 * @param {boolean} [input.anonymous]
 * @param {Date} input.now
 * @param {'en'|'hi'} [input.lang]
 */
function computePrimaryAction({ competition, lifecycle, availability, registration = null, submission = null, anonymous = false, now, lang = 'en' }) {
  const L = LABELS[lang] || LABELS.en;
  const fee = competition.entryFee > 0 ? formatINR(competition.entryFee) : L.free;

  // 1. cancelled
  if (lifecycle.phase === 'cancelled') return action('cancelled', false, L.cancelled);

  if (!anonymous) {
    // 2. confirmed registration
    if (registration && registration.status === 'confirmed') {
      if (submission) return action('view_submission', true, L.view_submission, L.submitted);
      if (lifecycle.submissionOpen) return action('upload_submission', true, L.upload_submission, L.registered);
      if (ts(now) < ts(competition.dates.submissionStartsAt)) {
        return action('submission_not_started', false, L.submission_not_started, L.registered);
      }
      if (lifecycle.resultsOut) return action('view_results', true, L.view_results, L.registered);
      return action('judging', false, L.judging, L.registered);
    }
    // 3. pending payment with a live hold
    if (isHoldActive(registration, now)) {
      return action('complete_payment', true, L.complete_payment(fee));
    }
  }

  // 4. no (active) registration
  if (lifecycle.registrationOpen && !availability.isFull) {
    return anonymous ? action('login', true, L.login) : action('register', true, L.register(fee));
  }
  if (lifecycle.registrationOpen && availability.isFull) return action('full', false, L.full);
  if (ts(now) < ts(competition.dates.registrationOpensAt)) return action('not_open_yet', false, L.not_open_yet);
  if (lifecycle.resultsOut) return action('view_results', true, L.view_results);
  return action('registration_closed', false, L.registration_closed);
}

module.exports = {
  computeAvailability,
  computeLifecycle,
  computePrimaryAction,
  isHoldActive,
  LABELS,
};
