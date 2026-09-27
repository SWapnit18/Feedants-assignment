'use strict';

const crypto = require('node:crypto');
const { Competition, Registration } = require('../models');
const { AppError } = require('../utils/AppError');
const { randomId, isObjectId } = require('../utils/ids');
const { runInTransaction, isDuplicateKeyError } = require('../utils/transaction');
const config = require('../config');
const logger = require('../config/logger');
const { seatAvailableFilter } = require('./registration.service');

/**
 * Razorpay checkout signature: HMAC_SHA256(`${orderId}|${paymentId}`, key_secret) as hex.
 * @see https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#verify-payment-signature
 */
function signPayment(orderId, paymentId, secret = config.payment.keySecret) {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

/** Constant-time signature comparison. */
function verifySignature(orderId, paymentId, signature, secret = config.payment.keySecret) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(signPayment(orderId, paymentId, secret), 'hex');
  const given = Buffer.from(signature, 'hex');
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

/**
 * Simulates the Razorpay checkout sheet (PAYMENT_MODE=mock only): returns
 * the same triple Razorpay's SDK hands the client after a successful payment.
 */
async function mockCheckout(userId, orderId) {
  const reg = await Registration.findOne({ orderId, userId }).lean();
  if (!reg) throw new AppError('NOT_FOUND', 'Order not found');
  const paymentId = `pay_${randomId(14)}`;
  return {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signPayment(orderId, paymentId),
  };
}

const confirmedResponse = (reg) => ({ registration: { id: String(reg._id), status: 'confirmed' } });

/**
 * Verify a payment and confirm the registration.
 *
 * - Already confirmed → 200 (idempotent).
 * - Hold still counted in bookedCount (pending_payment, even if its timer just
 *   lapsed but the sweeper hasn't run) → confirm, seat is already ours.
 * - Hold already released (expired/cancelled) → re-reserve a seat atomically
 *   if one is available, otherwise HOLD_EXPIRED (payment flagged for refund).
 */
async function verifyPayment(userId, registrationId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!isObjectId(registrationId)) throw new AppError('NOT_FOUND', 'Registration not found');
  const reg = await Registration.findOne({ _id: registrationId, userId }).lean();
  if (!reg) throw new AppError('NOT_FOUND', 'Registration not found');
  if (reg.status === 'confirmed') return confirmedResponse(reg);

  if (!reg.orderId || reg.orderId !== razorpay_order_id) {
    throw new AppError('PAYMENT_VERIFICATION_FAILED', 'Order does not match this registration');
  }
  if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    throw new AppError('PAYMENT_VERIFICATION_FAILED', 'Invalid payment signature');
  }

  try {
    return await runInTransaction(async (session) => {
      const now = new Date();
      const cur = await Registration.findById(reg._id).session(session).lean();
      const confirm = { status: 'confirmed', paymentId: razorpay_payment_id, confirmedAt: now, holdExpiresAt: null, releasedAt: null };

      if (cur.status === 'confirmed') return confirmedResponse(cur);

      if (cur.status === 'pending_payment') {
        await Registration.updateOne({ _id: cur._id, status: 'pending_payment' }, { $set: confirm }, { session });
        return confirmedResponse(cur);
      }

      if (cur.status === 'expired' || cur.status === 'cancelled') {
        // Seat was released: try to take one again (window not required: the
        // user started paying while registration was open).
        const seat = await Competition.updateOne(
          seatAvailableFilter(cur.competitionId, now, { requireWindow: false }),
          { $inc: { bookedCount: 1 } },
          { session },
        );
        if (seat.modifiedCount !== 1) throw new AppError('HOLD_EXPIRED', 'Your seat hold expired and the competition is now full');
        await Registration.updateOne({ _id: cur._id, status: cur.status }, { $set: confirm }, { session });
        return confirmedResponse(cur);
      }

      throw new AppError('HOLD_EXPIRED', 'This registration can no longer be confirmed');
    });
  } catch (err) {
    const holdLost = err instanceof AppError && err.code === 'HOLD_EXPIRED';
    const dup = isDuplicateKeyError(err);
    if (holdLost || dup) {
      // Money was captured but we can't honour it: record it for refund.
      await Registration.updateOne(
        { _id: reg._id, status: { $in: ['expired', 'cancelled'] } },
        { $set: { status: 'refunded', paymentId: razorpay_payment_id } },
      );
      logger.warn({ registrationId: String(reg._id), paymentId: razorpay_payment_id }, 'payment received for lost hold: refund required');
      if (dup) throw new AppError('ALREADY_REGISTERED', 'You already have an active registration; this payment will be refunded');
    }
    throw err;
  }
}

module.exports = { signPayment, verifySignature, mockCheckout, verifyPayment };
