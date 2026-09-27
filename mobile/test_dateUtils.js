const assert = require('assert');
const { formatCountdown, formatDate, formatTime, computeServerOffsetMs } = require('./src/utils/dateUtils');

console.log('--- Running Mobile Date & Countdown Formatter Tests ---');

const serverTime = '2026-08-08T12:00:00.000Z';
const targetTime = '2026-08-09T18:28:32.000Z'; // 1 day, 6 hours, 28 mins, 32 secs ahead

const offset = computeServerOffsetMs(serverTime);
console.log('Computed server offset:', offset, 'ms');

// Mock countdown calculation
const countdown = formatCountdown(targetTime, 0);
console.log('Formatted countdown output:', countdown.label);

// Verify format string structure
assert.match(countdown.label, /^\d{2}d : \d{2}h : \d{2}m : \d{2}s$/, 'Countdown string should match 00d : 00h : 00m : 00s format');

const dateFormatted = formatDate(targetTime);
const timeFormatted = formatTime(targetTime);
console.log('Formatted date:', dateFormatted);
console.log('Formatted time:', timeFormatted);

assert.ok(dateFormatted.length > 0, 'Date string should not be empty');
assert.ok(timeFormatted.length > 0, 'Time string should not be empty');

console.log('\n========================================');
console.log('ALL MOBILE UTILS TESTS PASSED 100%!');
console.log('========================================');
