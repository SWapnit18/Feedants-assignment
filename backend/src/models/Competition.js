const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A single reward tier, e.g. { position: 1, label: '1st Winner', amount: 550 }
 */
const RewardSchema = new Schema(
  {
    position: { type: Number, required: true },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/**
 * Embedded "previous winner" showcase entries. These are read-only display
 * data pulled from a *past* edition/season of the competition series (see
 * README assumptions) -- they are not derived from live Submission/User
 * documents, since the person who won 3 seasons ago may no longer have an
 * active account.
 */
const PreviousWinnerSchema = new Schema(
  {
    name: { type: String, required: true },
    position: { type: Number, required: true }, // 1, 2, 3...
    photoUrl: { type: String },
    videoUrl: { type: String },
  },
  { _id: false }
);

const JudgeSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String },
    experienceLabel: { type: String }, // e.g. "12+ Years of Experience"
    photoUrl: { type: String },
    introVideoUrl: { type: String },
  },
  { _id: false }
);

const CompetitionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    tags: [{ type: String }], // e.g. ["Dance", "Multi-Win"]
    hasCertificateForWinners: { type: Boolean, default: false },

    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },

    // --- Capacity -----------------------------------------------------
    // totalSpots is fixed at creation time. spotsBooked is the ONLY field
    // that changes on every registration and is mutated exclusively
    // through atomic findOneAndUpdate operations (see
    // registrationController) so it is safe under concurrent writes.
    totalSpots: { type: Number, required: true, min: 1 },
    spotsBooked: { type: Number, default: 0, min: 0 },

    judge: JudgeSchema,

    // --- Lifecycle timestamps (all UTC) --------------------------------
    registrationOpensAt: { type: Date, required: true },
    registrationClosesAt: { type: Date, required: true },
    submissionStartsAt: { type: Date, required: true },
    submissionEndsAt: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    // --- Content tabs ---------------------------------------------------
    aboutText: { type: String, default: '' },
    judgingParameters: { type: String, default: '' },
    rulesAndEligibility: { type: String, default: '' },

    rewards: [RewardSchema],
    previousWinners: [PreviousWinnerSchema],

    disclaimerText: {
      type: String,
      default: 'Only contributions from paid participants will be considered for judging.',
    },
    prizeMoneyInfoVideoUrl: { type: String },

    referral: {
      earnAmountPerSignup: { type: Number, default: 0 },
    },

    isPublished: { type: Boolean, default: true },
    // Soft delete / manual override for edge cases (e.g. organiser cancels
    // a competition mid-flight); when true, all write actions are blocked
    // regardless of the date-derived state.
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CompetitionSchema.index({ registrationClosesAt: 1 });
CompetitionSchema.index({ isPublished: 1, isCancelled: 1 });

CompetitionSchema.virtual('spotsLeft').get(function spotsLeft() {
  return Math.max(this.totalSpots - this.spotsBooked, 0);
});

CompetitionSchema.set('toJSON', { virtuals: true });
CompetitionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Competition', CompetitionSchema);
