/**
 * Pure, side-effect-free helpers that derive a competition's CURRENT state
 * from its stored timestamps and counters. Nothing here touches the DB, so
 * it's trivially unit-testable and reusable from the API layer, cron jobs,
 * or a future admin dashboard.
 *
 * We deliberately do NOT persist a "status" field on the Competition
 * document for the time-based transitions (upcoming -> registration open
 * -> closed -> submission open -> judging -> results) because that would
 * require a scheduled job to flip it and could drift from the source-of-
 * truth timestamps. Deriving it on read is cheap and always correct.
 * `isCancelled` is the one flag we DO persist, since cancellation is an
 * external event, not a function of time.
 */

const STATES = Object.freeze({
  CANCELLED: 'CANCELLED',
  UPCOMING: 'UPCOMING',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_FULL: 'REGISTRATION_FULL',
  AWAITING_SUBMISSION_WINDOW: 'AWAITING_SUBMISSION_WINDOW',
  SUBMISSION_OPEN: 'SUBMISSION_OPEN',
  JUDGING: 'JUDGING',
  RESULTS_DECLARED: 'RESULTS_DECLARED',
});

function getCompetitionState(competition, now = new Date()) {
  if (competition.isCancelled) return STATES.CANCELLED;

  const t = now.getTime();
  const regOpen = new Date(competition.registrationOpensAt).getTime();
  const regClose = new Date(competition.registrationClosesAt).getTime();
  const subStart = new Date(competition.submissionStartsAt).getTime();
  const subEnd = new Date(competition.submissionEndsAt).getTime();
  const resultAt = new Date(competition.resultDate).getTime();

  const spotsLeft = Math.max(competition.totalSpots - competition.spotsBooked, 0);

  if (t < regOpen) return STATES.UPCOMING;

  if (t <= regClose) {
    return spotsLeft > 0 ? STATES.REGISTRATION_OPEN : STATES.REGISTRATION_FULL;
  }

  if (t < subStart) return STATES.AWAITING_SUBMISSION_WINDOW;
  if (t <= subEnd) return STATES.SUBMISSION_OPEN;
  if (t < resultAt) return STATES.JUDGING;
  return STATES.RESULTS_DECLARED;
}

/**
 * Given the competition state + the requesting user's personal registration
 * and submission records, compute what the bottom action button should say
 * and whether it's tappable. This is the "user actions based on current
 * competition state" requirement from the brief, centralised in one place
 * instead of scattered across the client.
 */
function getUserAction({ state, registration, submission, competition }) {
  const isRegistered = !!registration && registration.status === 'active';
  const hasSubmission = !!submission;

  switch (state) {
    case STATES.CANCELLED:
      return { label: 'Competition Cancelled', subLabel: '', enabled: false, action: null };

    case STATES.UPCOMING:
      return { label: 'Registration Opens Soon', subLabel: 'Stay Tuned', enabled: false, action: null };

    case STATES.REGISTRATION_OPEN:
      if (isRegistered) {
        return hasSubmission
          ? { label: 'Update Submission', subLabel: 'Registered', enabled: true, action: 'RESUBMIT' }
          : { label: 'Upload Submission', subLabel: 'Registered', enabled: true, action: 'SUBMIT' };
      }
      return { label: 'Register Now', subLabel: 'Entry Fee: ₹99', enabled: true, action: 'REGISTER' };

    case STATES.REGISTRATION_FULL:
      if (isRegistered) {
        return hasSubmission
          ? { label: 'Update Submission', subLabel: 'Registered', enabled: true, action: 'RESUBMIT' }
          : { label: 'Upload Submission', subLabel: 'Registered', enabled: true, action: 'SUBMIT' };
      }
      return { label: 'Registration Full', subLabel: 'All Spots Booked', enabled: false, action: null };

    case STATES.AWAITING_SUBMISSION_WINDOW:
      if (!isRegistered) return { label: 'Registration Closed', subLabel: '', enabled: false, action: null };
      return { label: 'Submissions Open Soon', subLabel: 'Registered', enabled: false, action: null };

    case STATES.SUBMISSION_OPEN:
      if (!isRegistered) return { label: 'Registration Closed', subLabel: '', enabled: false, action: null };
      return hasSubmission
        ? { label: 'Update Submission', subLabel: 'Submission Received', enabled: true, action: 'RESUBMIT' }
        : { label: 'Upload Submission', subLabel: 'Registered', enabled: true, action: 'SUBMIT' };

    case STATES.JUDGING:
      if (!isRegistered) return { label: 'Judging in Progress', subLabel: '', enabled: false, action: null };
      return { label: 'Submitted \u2013 Awaiting Results', subLabel: 'Judging Underway', enabled: false, action: null };

    case STATES.RESULTS_DECLARED:
      return { label: 'View Results', subLabel: 'Winners Announced', enabled: true, action: 'VIEW_RESULTS' };

    default:
      return { label: 'Unavailable', subLabel: '', enabled: false, action: null };
  }
}

module.exports = { STATES, getCompetitionState, getUserAction };
