'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { computeLifecycle, computeAvailability, computePrimaryAction } = require('../src/services/lifecycle');

const DAY = 86_400_000;
const NOW = new Date('2026-09-27T12:00:00.000Z');
const at = (days) => new Date(NOW.getTime() + days * DAY);

/** Build a competition whose windows are offsets (days) from NOW. */
function comp({ ro = -5, rc = 1, ss = -2, se = 20, r = 22, status = 'published', capacity = 20, booked = 1, fee = 9900 } = {}) {
  return {
    status,
    capacity,
    bookedCount: booked,
    entryFee: fee,
    dates: { registrationOpensAt: at(ro), registrationClosesAt: at(rc), submissionStartsAt: at(ss), submissionEndsAt: at(se), resultAt: at(r) },
  };
}

function actionFor(c, { registration = null, submission = null, anonymous = false, now = NOW, lang = 'en' } = {}) {
  return computePrimaryAction({
    competition: c,
    lifecycle: computeLifecycle(c, now),
    availability: computeAvailability(c),
    registration,
    submission,
    anonymous,
    now,
    lang,
  });
}

describe('computeAvailability', () => {
  it('computes remaining and isFull', () => {
    assert.deepEqual(computeAvailability({ capacity: 20, bookedCount: 1 }), { capacity: 20, booked: 1, remaining: 19, isFull: false });
    assert.deepEqual(computeAvailability({ capacity: 20, bookedCount: 20 }), { capacity: 20, booked: 20, remaining: 0, isFull: true });
  });
  it('clamps corrupt counters', () => {
    assert.equal(computeAvailability({ capacity: 5, bookedCount: 9 }).remaining, 0);
    assert.equal(computeAvailability({ capacity: 5, bookedCount: -2 }).booked, 0);
  });
});

describe('computeLifecycle phases', () => {
  const cases = [
    ['cancelled wins over everything', comp({ status: 'cancelled', r: -1, se: -2, ss: -10, rc: -11, ro: -12 }), 'cancelled'],
    ['results_announced at resultAt', comp({ ro: -30, rc: -20, ss: -25, se: -5, r: 0 }), 'results_announced'],
    ['judging after submissionEndsAt', comp({ ro: -30, rc: -20, ss: -25, se: -1, r: 2 }), 'judging'],
    ['submission_open when windows overlap', comp(), 'submission_open'],
    ['registration_open before submissions start', comp({ ss: 2, se: 10, r: 12 }), 'registration_open'],
    ['registration_closed in the gap', comp({ ro: -10, rc: -1, ss: 2, se: 10, r: 12 }), 'registration_closed'],
    ['upcoming before anything opens', comp({ ro: 1, rc: 5, ss: 6, se: 10, r: 12 }), 'upcoming'],
  ];
  for (const [name, c, phase] of cases) {
    it(name, () => assert.equal(computeLifecycle(c, NOW).phase, phase));
  }

  it('window boundaries are [start, end)', () => {
    const c = comp({ ro: 0, rc: 1, ss: 0, se: 1 });
    const lc = computeLifecycle(c, NOW);
    assert.equal(lc.registrationOpen, true);
    assert.equal(lc.submissionOpen, true);
    const atEnd = computeLifecycle(c, at(1));
    assert.equal(atEnd.registrationOpen, false);
    assert.equal(atEnd.submissionOpen, false);
  });

  it('flags and nextDeadline for the design scenario', () => {
    const lc = computeLifecycle(comp(), NOW);
    assert.equal(lc.registrationOpen, true);
    assert.equal(lc.submissionOpen, true);
    assert.equal(lc.resultsOut, false);
    assert.deepEqual(lc.nextDeadline, { type: 'registration_closes', at: at(1).toISOString() });
  });

  it('nextDeadline types progress and end as null', () => {
    assert.equal(computeLifecycle(comp({ ro: 1, rc: 5, ss: 6, se: 10, r: 12 }), NOW).nextDeadline.type, 'registration_opens');
    assert.equal(computeLifecycle(comp({ ro: -10, rc: -1, ss: 2, se: 10, r: 12 }), NOW).nextDeadline.type, 'submission_starts');
    assert.equal(computeLifecycle(comp({ ro: -30, rc: -20, ss: -25, se: 3, r: 5 }), NOW).nextDeadline.type, 'submission_ends');
    assert.equal(computeLifecycle(comp({ ro: -30, rc: -20, ss: -25, se: -1, r: 2 }), NOW).nextDeadline.type, 'result');
    assert.equal(computeLifecycle(comp({ ro: -30, rc: -20, ss: -25, se: -5, r: -1 }), NOW).nextDeadline, null);
    assert.equal(computeLifecycle(comp({ status: 'cancelled' }), NOW).nextDeadline, null);
  });

  it('cancelled competitions are never open', () => {
    const lc = computeLifecycle(comp({ status: 'cancelled' }), NOW);
    assert.equal(lc.registrationOpen, false);
    assert.equal(lc.submissionOpen, false);
  });
});

describe('computePrimaryAction', () => {
  const confirmed = { status: 'confirmed' };
  const pending = (mins) => ({ status: 'pending_payment', holdExpiresAt: new Date(NOW.getTime() + mins * 60_000) });

  it('1. cancelled → cancelled (disabled), even when registered', () => {
    const a = actionFor(comp({ status: 'cancelled' }), { registration: confirmed });
    assert.equal(a.type, 'cancelled');
    assert.equal(a.enabled, false);
  });

  it('2a. confirmed + submission → view_submission', () => {
    const a = actionFor(comp(), { registration: confirmed, submission: { _id: 'x' } });
    assert.deepEqual([a.type, a.enabled, a.subLabel], ['view_submission', true, 'Submitted']);
  });

  it('2b. confirmed + submission open → upload_submission (design CTA)', () => {
    const a = actionFor(comp(), { registration: confirmed });
    assert.deepEqual(a, { type: 'upload_submission', enabled: true, label: 'Upload Submission', subLabel: 'Registered' });
  });

  it('2c. confirmed before submissions start → submission_not_started', () => {
    const a = actionFor(comp({ ss: 2, se: 10, r: 12 }), { registration: confirmed });
    assert.deepEqual([a.type, a.enabled, a.subLabel], ['submission_not_started', false, 'Registered']);
  });

  it('2d. confirmed after results → view_results', () => {
    const a = actionFor(comp({ ro: -30, rc: -20, ss: -25, se: -5, r: -1 }), { registration: confirmed });
    assert.deepEqual([a.type, a.enabled], ['view_results', true]);
  });

  it('2e. confirmed during judging → judging (disabled)', () => {
    const a = actionFor(comp({ ro: -30, rc: -20, ss: -25, se: -1, r: 2 }), { registration: confirmed });
    assert.deepEqual([a.type, a.enabled], ['judging', false]);
  });

  it('3. live pending hold → complete_payment', () => {
    const a = actionFor(comp(), { registration: pending(5) });
    assert.deepEqual([a.type, a.enabled, a.label], ['complete_payment', true, 'Complete Payment · ₹99']);
  });

  it('3b. lapsed pending hold is treated as no registration', () => {
    assert.equal(actionFor(comp(), { registration: pending(-1) }).type, 'register');
  });

  it('4a. no registration, open, seats left → register with price', () => {
    const a = actionFor(comp());
    assert.deepEqual(a, { type: 'register', enabled: true, label: 'Register Now · ₹99', subLabel: null });
  });

  it('4a. free competition label', () => {
    assert.equal(actionFor(comp({ fee: 0 })).label, 'Register Now · Free');
  });

  it('4b. open but full → full (disabled)', () => {
    const a = actionFor(comp({ booked: 20 }));
    assert.deepEqual([a.type, a.enabled], ['full', false]);
  });

  it('4c. before registration opens → not_open_yet', () => {
    assert.equal(actionFor(comp({ ro: 1, rc: 5, ss: 6, se: 10, r: 12 })).type, 'not_open_yet');
  });

  it('4d. after close → registration_closed; after results → view_results', () => {
    const closed = actionFor(comp({ ro: -30, rc: -20, ss: -25, se: -1, r: 2 }));
    assert.deepEqual([closed.type, closed.enabled], ['registration_closed', false]);
    assert.equal(actionFor(comp({ ro: -30, rc: -20, ss: -25, se: -5, r: -1 })).type, 'view_results');
  });

  it('anonymous: login when registration open; otherwise phase-based', () => {
    assert.deepEqual([actionFor(comp(), { anonymous: true }).type, actionFor(comp(), { anonymous: true }).enabled], ['login', true]);
    assert.equal(actionFor(comp({ booked: 20 }), { anonymous: true }).type, 'full');
    assert.equal(actionFor(comp({ ro: 1, rc: 5, ss: 6, se: 10, r: 12 }), { anonymous: true }).type, 'not_open_yet');
    assert.equal(actionFor(comp({ ro: -30, rc: -20, ss: -25, se: -1, r: 2 }), { anonymous: true }).type, 'registration_closed');
    assert.equal(actionFor(comp({ status: 'cancelled' }), { anonymous: true }).type, 'cancelled');
    // anonymous ignores any registration passed in
    assert.equal(actionFor(comp(), { anonymous: true, registration: confirmed }).type, 'login');
  });

  it('localizes labels in Hindi', () => {
    const a = actionFor(comp(), { registration: confirmed, lang: 'hi' });
    assert.equal(a.label, 'प्रविष्टि अपलोड करें');
    assert.equal(a.subLabel, 'रजिस्टर्ड');
  });
});
