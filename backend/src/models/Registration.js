const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Tracks a single user's registration in a single competition.
 *
 * CONCURRENCY NOTE: the unique compound index below is the second line of
 * defence (after the atomic $inc guard on Competition.spotsBooked) against
 * double-registration: even if two requests from the same user race past
 * the "already registered?" read-check, MongoDB will reject the second
 * insert with a duplicate-key error (E11000), which the controller catches
 * and turns into a 409 Conflict + compensating spot rollback.
 */
const RegistrationSchema = new Schema(
  {
    competition: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    entryFeePaid: { type: Number, required: true, min: 0 },
    paymentId: { type: String }, // Razorpay payment/order id in production
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
    },
    referralCodeUsed: { type: String, default: null },

    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// A user may only hold one ACTIVE registration per competition. Cancelled
// registrations are kept for audit/history rather than deleted, so the
// unique index is scoped with a partial filter.
RegistrationSchema.index(
  { competition: 1, user: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);
RegistrationSchema.index({ competition: 1, createdAt: -1 });

module.exports = mongoose.model('Registration', RegistrationSchema);
