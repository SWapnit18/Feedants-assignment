'use strict';

const { Competition, Registration } = require('../models');
const { ACTIVE_STATUSES } = require('../models/Registration');
const { AppError } = require('../utils/AppError');
const { randomId, isObjectId } = require('../utils/ids');
const { runInTransaction, isDuplicateKeyError } = require('../utils/transaction');
const config = require('../config');
const logger = require('../config/logger');

/**
 * Filter that only matches a competition whose registration window is open
 * *right now* and which still has a free seat. Used for the atomic seat
 * reservation: the check and the $inc happen in a single document write.
 */
const seatAvailableFilter = (competitionId, now, { requireWindow = true } = {}) => ({
  _id: competitionId,
  status: 'published',
  ...(requireWindow && {
    'dates.registrationOpensAt': { $lte: now },
    'dates.registrationClosesAt': { $gt: now },
  }),
  $expr: { $lt: ['$bookedCount', '$capacity'] },
});

/** Explain why a seat could not be reserved. */
function reservationError(competition, now) {
  if (!competition || competition.status !== 'published') {
    return new AppError('REGISTRATION_CLOSED', 'This competition is not accepting registrations');
  }
  if (now < competition.dates.registrationOpensAt) {
    return new AppError('REGISTRATION_NOT_OPEN', 'Registration has not opened yet', {
      details: { opensAt: competition.dates.registrationOpensAt.toISOString() },
    });
  }
  if (now >= competition.dates.registrationClosesAt) {
    return new AppError('REGISTRATION_CLOSED', 'Registration for this competition has closed');
  }
  return new AppError('COMPETITION_FULL', 'All spots for this competition have been booked', {
    details: { capacity: competition.capacity },
  });
}

/**
 * Release one lapsed hold: mark it expired and give the seat back, atomically.
 * Safe to run concurrently from many sweepers/requests: the conditional
 * status transition makes only one of them win.
 * @returns {Promise<boolean>} whether this call released the hold
 */
async function releaseHold(registrationId, competitionId, now = new Date()) {
  return runInTransaction(async (session) => {
    const res = await Registration.updateOne(
      { _id: registrationId, status: 'pending_payment', holdExpiresAt: { $lte: now } },
      { $set: { status: 'expired', releasedAt: now } },
      { session },
    );
    if (res.modifiedCount !== 1) return false;
    await Competition.updateOne({ _id: competitionId, bookedCount: { $gt: 0 } }, { $inc: { bookedCount: -1 } }, { session });
    return true;
  });
}

/**
 * Release all lapsed holds matching `filter` (e.g. one user's, or all).
 * @param {{ competitionId?: any, userId?: any }} [filter]
 * @param {{ now?: Date, limit?: number }} [opts]
 * @returns {Promise<number>} number of holds released
 */
async function releaseExpiredHolds(filter = {}, { now = new Date(), limit = 500 } = {}) {
  const candidates = await Registration.find(
    { ...filter, status: 'pending_payment', holdExpiresAt: { $lte: now } },
    { _id: 1, competitionId: 1 },
  )
    .sort({ holdExpiresAt: 1 })
    .limit(limit)
    .lean();

  let released = 0;
  for (const c of candidates) {
    try {
      if (await releaseHold(c._id, c.competitionId, now)) released++;
    } catch (err) {
      logger.error({ err, registrationId: String(c._id) }, 'failed to release hold');
    }
  }
  return released;
}

function paymentPayload(registration) {
  if (registration.amount <= 0 || registration.status !== 'pending_payment') return null;
  return {
    provider: config.payment.provider,
    orderId: registration.orderId,
    amount: registration.amount,
    currency: registration.currency || 'INR',
    keyId: config.payment.keyId,
    mock: config.payment.mode === 'mock',
  };
}

function registrationResponse(registration) {
  return {
    registration: {
      id: String(registration._id),
      status: registration.status,
      holdExpiresAt: registration.holdExpiresAt ? new Date(registration.holdExpiresAt).toISOString() : null,
    },
    payment: paymentPayload(registration),
  };
}

/** Existing active registration → either replay the pending hold or reject. */
function handleExisting(existing, now) {
  if (existing.status === 'confirmed') {
    throw new AppError('ALREADY_REGISTERED', 'You are already registered for this competition', {
      details: { registrationId: String(existing._id) },
    });
  }
  if (existing.status === 'pending_payment' && existing.holdExpiresAt > now) {
    return { created: false, ...registrationResponse(existing) };
  }
  return null;
}

/**
 * Reserve a seat for `userId`. Paid competitions get a time-boxed hold
 * (pending_payment); free ones are confirmed immediately.
 *
 * Consistency: the seat counter increment (guarded by bookedCount < capacity
 * and the registration window) and the registration insert commit together
 * in one transaction, and a unique partial index guarantees at most one
 * active registration per (competition, user) even under races.
 *
 * @param {string} userId
 * @param {import('mongoose').Types.ObjectId} competitionId
 * @returns {Promise<{ created: boolean, registration: object, payment: object|null }>}
 */
async function registerForCompetition(userId, competitionId) {
  // Clear this user's own lapsed hold first so they can re-register.
  await releaseExpiredHolds({ competitionId, userId });

  const findActive = () =>
    Registration.findOne({ competitionId, userId, status: { $in: ACTIVE_STATUSES } }).lean();

  const existing = await findActive();
  if (existing) {
    const replay = handleExisting(existing, new Date());
    if (replay) return replay;
  }

  try {
    const registration = await runInTransaction(async (session) => {
      const now = new Date();
      const competition = await Competition.findOneAndUpdate(
        seatAvailableFilter(competitionId, now),
        { $inc: { bookedCount: 1 } },
        { session, new: true, projection: { entryFee: 1, currency: 1 } },
      ).lean();

      if (!competition) {
        const current = await Competition.findById(competitionId).session(session).lean();
        throw reservationError(current, now);
      }

      const paid = competition.entryFee > 0;
      const [doc] = await Registration.create(
        [
          {
            competitionId,
            userId,
            status: paid ? 'pending_payment' : 'confirmed',
            amount: competition.entryFee,
            currency: competition.currency || 'INR',
            orderId: paid ? `order_${randomId(14)}` : null,
            holdExpiresAt: paid ? new Date(now.getTime() + config.seatHoldMs) : null,
            confirmedAt: paid ? null : now,
          },
        ],
        { session },
      );
      return doc.toObject();
    });
    return { created: true, ...registrationResponse(registration) };
  } catch (err) {
    if (!isDuplicateKeyError(err)) throw err;
    // Lost a race against a parallel request from the same user: the
    // transaction rolled back our seat increment; report the winner.
    const winner = await findActive();
    const replay = winner && handleExisting(winner, new Date());
    if (replay) return replay;
    throw new AppError('ALREADY_REGISTERED', 'You are already registered for this competition');
  }
}

/**
 * Cancel the caller's own pending hold and return the seat.
 * @param {string} userId
 * @param {string} registrationId
 */
async function cancelRegistration(userId, registrationId) {
  if (!isObjectId(registrationId)) throw new AppError('NOT_FOUND', 'Registration not found');
  return runInTransaction(async (session) => {
    const reg = await Registration.findOne({ _id: registrationId, userId }).session(session).lean();
    if (!reg) throw new AppError('NOT_FOUND', 'Registration not found');
    if (reg.status === 'confirmed') {
      throw new AppError('FORBIDDEN', 'Confirmed registrations cannot be cancelled here', { status: 409 });
    }
    if (reg.status === 'pending_payment') {
      const now = new Date();
      const res = await Registration.updateOne(
        { _id: reg._id, status: 'pending_payment' },
        { $set: { status: 'cancelled', releasedAt: now, holdExpiresAt: null } },
        { session },
      );
      if (res.modifiedCount === 1) {
        await Competition.updateOne(
          { _id: reg.competitionId, bookedCount: { $gt: 0 } },
          { $inc: { bookedCount: -1 } },
          { session },
        );
      }
      return { registration: { id: String(reg._id), status: 'cancelled' } };
    }
    // Already expired / cancelled / refunded: idempotent no-op.
    return { registration: { id: String(reg._id), status: reg.status } };
  });
}

module.exports = {
  registerForCompetition,
  cancelRegistration,
  releaseExpiredHolds,
  releaseHold,
  seatAvailableFilter,
};
