const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A single reward tier, e.g. { position: 1, label: '1st Winner', amount: 550 }
 */
const RewardSchema = new Schema(
  {
    position: { type: Number, required: true },
    label: { type: Schema.Types.Mixed, required: true },
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
    positionLabel: { type: Schema.Types.Mixed },
    photoUrl: { type: String },
    thumbnailUrl: { type: String },
    videoUrl: { type: String },
    year: { type: String },
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
    name: { type: Schema.Types.Mixed, required: true },
    description: { type: Schema.Types.Mixed },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const CompetitionSchema = new Schema(
  {
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    title: { type: Schema.Types.Mixed, required: true },
    category: { type: String, default: 'Classical Dance' },
    tags: [{ type: String }], // e.g. ["Dance", "Multi-Win"]
    hasCertificateForWinners: { type: Boolean, default: false },
    certificate: { type: Boolean, default: false },

    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },

    // --- Capacity -----------------------------------------------------
    // totalSpots / maxParticipants is fixed at creation time. spotsBooked is the ONLY field
    // that changes on every registration and is mutated exclusively
    // through atomic findOneAndUpdate operations.
    totalSpots: { type: Number, min: 1 },
    maxParticipants: { type: Number },
    spotsBooked: { type: Number, default: 0, min: 0 },
    capacity: { type: Number, min: 1 },
    bookedCount: { type: Number, default: 0, min: 0 },

    judge: JudgeSchema,

    // --- Lifecycle timestamps (all UTC) --------------------------------
    registrationOpensAt: { type: Date },
    registrationClosesAt: { type: Date },
    submissionStartsAt: { type: Date },
    submissionEndsAt: { type: Date },
    resultDate: { type: Date },
    dates: {
      registrationOpensAt: { type: Date },
      registrationClosesAt: { type: Date },
      submissionStartsAt: { type: Date },
      submissionEndsAt: { type: Date },
      resultAt: { type: Date },
    },

    // --- Content tabs ---------------------------------------------------
    aboutText: { type: String, default: '' },
    description: { type: String },
    about: { type: Schema.Types.Mixed },
    judgingParametersText: { type: String, default: '' },
    judgingParameters: [JudgingParameterSchema],
    rules: { type: Schema.Types.Mixed },
    eligibility: { type: String },
    rulesAndEligibility: { type: String, default: '' },
    refundPolicy: { type: Schema.Types.Mixed },
    disclaimer: { type: Schema.Types.Mixed },
    paymentProvider: { type: String },
    ad: { type: Schema.Types.Mixed },

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
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'published' },
  },
  { timestamps: true }
);

CompetitionSchema.index({ registrationClosesAt: 1 });
CompetitionSchema.index({ isPublished: 1, isCancelled: 1 });
CompetitionSchema.index({ status: 1, 'dates.registrationClosesAt': 1 });

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

CompetitionSchema.pre('validate', function(next) {
  if (!this.slug) {
    const title = typeof this.title === 'string' ? this.title : this.title?.en;
    if (title) this.slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  if (this.totalSpots && !this.maxParticipants) {
    this.maxParticipants = this.totalSpots;
  } else if (this.maxParticipants && !this.totalSpots) {
    this.totalSpots = this.maxParticipants;
  }
  if (!this.capacity) this.capacity = this.totalSpots || this.maxParticipants;
  if (!this.bookedCount && this.spotsBooked) this.bookedCount = this.spotsBooked;
  if (!this.spotsBooked && this.bookedCount) this.spotsBooked = this.bookedCount;
  if (!this.dates) this.dates = {};
  this.dates.registrationOpensAt ||= this.registrationOpensAt;
  this.dates.registrationClosesAt ||= this.registrationClosesAt;
  this.dates.submissionStartsAt ||= this.submissionStartsAt;
  this.dates.submissionEndsAt ||= this.submissionEndsAt;
  this.dates.resultAt ||= this.resultDate;
  if (!this.registrationOpensAt && this.dates.registrationOpensAt) this.registrationOpensAt = this.dates.registrationOpensAt;
  if (!this.registrationClosesAt && this.dates.registrationClosesAt) this.registrationClosesAt = this.dates.registrationClosesAt;
  if (!this.submissionStartsAt && this.dates.submissionStartsAt) this.submissionStartsAt = this.dates.submissionStartsAt;
  if (!this.submissionEndsAt && this.dates.submissionEndsAt) this.submissionEndsAt = this.dates.submissionEndsAt;
  if (!this.resultDate && this.dates.resultAt) this.resultDate = this.dates.resultAt;
  if (this.about == null && this.aboutText) this.about = this.aboutText;
  if (this.disclaimer == null && this.disclaimerText) this.disclaimer = this.disclaimerText;
  if (!this.certificate && this.hasCertificateForWinners) this.certificate = true;
  if (this.status === 'cancelled') this.isCancelled = true;
  if (this.isCancelled) this.status = 'cancelled';
  if (this.isPublished === false && this.status === 'published') this.status = 'draft';
  next();
});

CompetitionSchema.set('toJSON', { virtuals: true });
CompetitionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Competition', CompetitionSchema);
