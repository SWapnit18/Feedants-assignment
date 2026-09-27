'use strict';

process.env.NODE_ENV = 'test';
process.env.ENABLE_DEV_LOGIN = 'true';
process.env.PAYMENT_MODE = 'mock';
process.env.RAZORPAY_KEY_SECRET = 'test_secret_for_hmac';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-16-chars';
delete process.env.MONGODB_URI;

const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { ensureIndexes } = require('../src/config/db');
const { createApp } = require('../src/app');
const { signToken } = require('../src/services/auth.service');
const { User, Competition, Registration, Submission, IdempotencyKey, Testimonial, Referral } = require('../src/models');

const DAY = 24 * 60 * 60 * 1000;
let replSet;

async function setup() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  await mongoose.connect(replSet.getUri('feedants_test'));
  await ensureIndexes();
  return createApp();
}

async function teardown() {
  await mongoose.disconnect();
  await replSet?.stop();
}

async function resetDb() {
  await Promise.all([User, Competition, Registration, Submission, IdempotencyKey, Testimonial, Referral].map((m) => m.deleteMany({})));
}

let userSeq = 0;
async function makeUser(name = `User ${++userSeq}`) {
  const user = await User.create({ name, email: `u${userSeq}-${Date.now()}@test.dev`, referralCode: `ref${userSeq}x${Date.now()}` });
  return { user, token: signToken(user), auth: { Authorization: `Bearer ${signToken(user)}` } };
}

/** A published competition; by default registration AND submission windows are open. */
async function makeCompetition(overrides = {}) {
  const now = Date.now();
  const { dates, ...rest } = overrides;
  return Competition.create({
    slug: `comp-${Math.random().toString(36).slice(2, 10)}`,
    title: { en: 'Test Comp', hi: 'परीक्षण' },
    category: 'Dance',
    tags: ['Dance'],
    prizePool: 150000,
    entryFee: 9900,
    capacity: 20,
    bookedCount: 0,
    about: { en: 'About', hi: 'परिचय' },
    status: 'published',
    rewards: [
      { position: 2, label: { en: '2nd Winner' }, amount: 30000 },
      { position: 1, label: { en: '1st Winner' }, amount: 55000 },
    ],
    dates: {
      registrationOpensAt: new Date(now - 5 * DAY),
      registrationClosesAt: new Date(now + 1 * DAY),
      submissionStartsAt: new Date(now - 2 * DAY),
      submissionEndsAt: new Date(now + 20 * DAY),
      resultAt: new Date(now + 22 * DAY),
      ...dates,
    },
    ...rest,
  });
}

/** Invariant check: bookedCount equals the number of active registrations. */
async function assertInvariant(assert, competitionId) {
  const [c, active] = await Promise.all([
    Competition.findById(competitionId).lean(),
    Registration.countDocuments({ competitionId, status: { $in: ['pending_payment', 'confirmed'] } }),
  ]);
  assert.equal(c.bookedCount, active, 'bookedCount must equal active registrations');
  assert.ok(c.bookedCount >= 0 && c.bookedCount <= c.capacity, 'bookedCount within [0, capacity]');
  return c;
}

module.exports = { setup, teardown, resetDb, makeUser, makeCompetition, assertInvariant, DAY };
