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
    competition: { type: Schema.Types.ObjectId, ref: 'Competition' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },

    entryFeePaid: { type: Number, min: 0 },
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
    orderId: { type: String },
    holdExpiresAt: { type: Date },
    confirmedAt: { type: Date },
    releasedAt: { type: Date },
    paymentId: { type: String }, // Razorpay payment/order id in production
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
    },
    referralCodeUsed: { type: String, default: null },

    status: {
      type: String,
      enum: ['active', 'pending_payment', 'confirmed', 'expired', 'cancelled', 'refunded'],
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
RegistrationSchema.index(
  { competitionId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending_payment', 'confirmed'] } } },
);
RegistrationSchema.index({ status: 1, holdExpiresAt: 1 });

RegistrationSchema.pre('validate', function syncRegistrationFields(next) {
  if (!this.competition && this.competitionId) this.competition = this.competitionId;
  if (!this.user && this.userId) this.user = this.userId;
  if (!this.competitionId && this.competition) this.competitionId = this.competition;
  if (!this.userId && this.user) this.userId = this.user;
  if (this.amount == null && this.entryFeePaid != null) this.amount = this.entryFeePaid;
  if (this.entryFeePaid == null && this.amount != null) this.entryFeePaid = this.amount;
  next();
});

const Registration = mongoose.model('Registration', RegistrationSchema);
Registration.ACTIVE_STATUSES = ['pending_payment', 'confirmed'];
module.exports = Registration;
