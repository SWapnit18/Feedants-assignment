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
    profession: { type: String },
    experience: { type: String },
    experienceLabel: { type: String }, // e.g. "12+ Years of Experience"
    profileImage: { type: String },
    photoUrl: { type: String },
    introductionVideo: { type: String },
    introVideoUrl: { type: String },
  },
  { _id: false }
);

const JudgingParameterSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const CompetitionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'Classical Dance' },
    tags: [{ type: String }], // e.g. ["Dance", "Multi-Win"]
    hasCertificateForWinners: { type: Boolean, default: false },

    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },

    // --- Capacity -----------------------------------------------------
    // totalSpots / maxParticipants is fixed at creation time. spotsBooked is the ONLY field
    // that changes on every registration and is mutated exclusively
    // through atomic findOneAndUpdate operations.
    totalSpots: { type: Number, required: true, min: 1 },
    maxParticipants: { type: Number },
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
    description: { type: String },
    judgingParametersText: { type: String, default: '' },
    judgingParameters: [JudgingParameterSchema],
    rules: { type: String },
    eligibility: { type: String },
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
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CompetitionSchema.index({ registrationClosesAt: 1 });
CompetitionSchema.index({ isPublished: 1, isCancelled: 1 });

CompetitionSchema.virtual('spotsLeft').get(function spotsLeft() {
  return Math.max((this.totalSpots || this.maxParticipants || 0) - (this.spotsBooked || 0), 0);
});

CompetitionSchema.virtual('availableSpots').get(function availableSpots() {
  return Math.max((this.totalSpots || this.maxParticipants || 0) - (this.spotsBooked || 0), 0);
});

CompetitionSchema.virtual('registrationStart').get(function() {
  return this.registrationOpensAt;
});

CompetitionSchema.virtual('registrationEnd').get(function() {
  return this.registrationClosesAt;
});

CompetitionSchema.virtual('submissionStart').get(function() {
  return this.submissionStartsAt;
});

CompetitionSchema.virtual('submissionEnd').get(function() {
  return this.submissionEndsAt;
});

CompetitionSchema.pre('save', function(next) {
  if (this.totalSpots && !this.maxParticipants) {
    this.maxParticipants = this.totalSpots;
  } else if (this.maxParticipants && !this.totalSpots) {
    this.totalSpots = this.maxParticipants;
  }
  next();
});

CompetitionSchema.set('toJSON', { virtuals: true });
CompetitionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Competition', CompetitionSchema);
