const assert = require('assert');
const { getCompetitionState, getUserAction, STATES } = require('./src/utils/competitionState');

console.log('--- Running Competition Logic & State Machine Tests ---');

const now = new Date('2026-08-08T12:00:00.000Z');
const day = 24 * 60 * 60 * 1000;

// Base competition
const mockCompetition = {
  totalSpots: 20,
  spotsBooked: 1,
  registrationOpensAt: new Date(now.getTime() - 4 * day),
  registrationClosesAt: new Date(now.getTime() + 2 * day),
  submissionStartsAt: new Date(now.getTime() - 2 * day),
  submissionEndsAt: new Date(now.getTime() + 22 * day),
  resultDate: new Date(now.getTime() + 24 * day),
  isCancelled: false,
};

// Test 1: State derivation when registration is open
const state1 = getCompetitionState(mockCompetition, now);
assert.strictEqual(state1, STATES.REGISTRATION_OPEN, 'Should be REGISTRATION_OPEN');
console.log('✓ Test 1 Passed: State is REGISTRATION_OPEN during active window');

// Test 2: User action when not registered
const actionNotRegistered = getUserAction({
  state: state1,
  registration: null,
  submission: null,
});
assert.strictEqual(actionNotRegistered.action, 'REGISTER');
assert.strictEqual(actionNotRegistered.enabled, true);
console.log('✓ Test 2 Passed: Unregistered user gets Register Now CTA');

// Test 3: User action when registered (matches the reference screenshot)
const actionRegistered = getUserAction({
  state: state1,
  registration: { status: 'active' },
  submission: null,
});
assert.strictEqual(actionRegistered.action, 'SUBMIT');
assert.strictEqual(actionRegistered.label, 'Upload Submission');
assert.strictEqual(actionRegistered.subLabel, 'Registered');
assert.strictEqual(actionRegistered.enabled, true);
console.log('✓ Test 3 Passed: Registered user gets Upload Submission CTA with Registered badge');

// Test 4: When spots are full
const mockFullCompetition = { ...mockCompetition, spotsBooked: 20 };
const stateFull = getCompetitionState(mockFullCompetition, now);
assert.strictEqual(stateFull, STATES.REGISTRATION_FULL);
const actionFull = getUserAction({
  state: stateFull,
  registration: null,
  submission: null,
});
assert.strictEqual(actionFull.enabled, false);
console.log('✓ Test 4 Passed: Full capacity blocks further registrations');

// Test 5: Submissions closed / Judging
const mockJudgingTime = new Date(mockCompetition.submissionEndsAt.getTime() + 1 * day);
const stateJudging = getCompetitionState(mockCompetition, mockJudgingTime);
assert.strictEqual(stateJudging, STATES.JUDGING);
console.log('✓ Test 5 Passed: Post-submission phase transitions to JUDGING');

// Test 6: Results declared
const mockResultsTime = new Date(mockCompetition.resultDate.getTime() + 1 * day);
const stateResults = getCompetitionState(mockCompetition, mockResultsTime);
assert.strictEqual(stateResults, STATES.RESULTS_DECLARED);
const actionResults = getUserAction({
  state: stateResults,
  registration: { status: 'active' },
  submission: { status: 'submitted' },
});
assert.strictEqual(actionResults.action, 'VIEW_RESULTS');
console.log('✓ Test 6 Passed: Results phase allows viewing leaderboard');

// Test 7: Cancelled competition
const mockCancelled = { ...mockCompetition, isCancelled: true };
const stateCancelled = getCompetitionState(mockCancelled, now);
assert.strictEqual(stateCancelled, STATES.CANCELLED);
console.log('✓ Test 7 Passed: Manual cancellation override blocks actions');

console.log('\n========================================');
console.log('ALL 7 BUSINESS LOGIC TESTS PASSED 100%!');
console.log('========================================');
