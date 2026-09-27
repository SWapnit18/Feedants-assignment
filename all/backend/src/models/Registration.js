'use strict';

const { Schema, model } = require('mongoose');

const ACTIVE_STATUSES = /** @type {const} */ (['pending_payment', 'confirmed']);
const STATUSES = ['pending_payment', 'confirmed', 'expired', 'cancelled', 'refunded'];

const registrationSchema = new Schema(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: STATUSES, required: true },
    amount: { type: Number, required: true, min: 0 }, // paise, snapshot of entryFee at registration time
    currency: { type: String, default: 'INR' },
    orderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    holdExpiresAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One *active* registration per user per competition. Expired/cancelled rows
// are kept for audit and don't block re-registering.
registrationSchema.index(
  { competitionId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ACTIVE_STATUSES } }, name: 'uniq_active_registration' },
);
// Sweeper scan.
registrationSchema.index({ status: 1, holdExpiresAt: 1 });
// Lookup by payment order (checkout / webhook).
registrationSchema.index({ orderId: 1 }, { unique: true, partialFilterExpression: { orderId: { $type: 'string' } } });
// Viewer lookups.
registrationSchema.index({ userId: 1, competitionId: 1, createdAt: -1 });

module.exports = model('Registration', registrationSchema);
module.exports.ACTIVE_STATUSES = ACTIVE_STATUSES;
