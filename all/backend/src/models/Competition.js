'use strict';

const { Schema, model } = require('mongoose');
const { localized } = require('./localized');

const judgeSchema = new Schema(
  {
    name: { type: String, required: true },
    title: localized(),
    experienceYears: { type: Number, min: 0, default: 0 },
    avatarUrl: String,
    introVideoUrl: String,
  },
  { _id: false },
);

const winnerSchema = new Schema({
  name: { type: String, required: true },
  position: { type: Number, required: true, min: 1 },
  positionLabel: localized(),
  thumbnailUrl: String,
  videoUrl: String,
});

const rewardSchema = new Schema(
  {
    position: { type: Number, required: true, min: 1 },
    label: localized(),
    amount: { type: Number, required: true, min: 0, validate: Number.isInteger }, // paise
  },
  { _id: false },
);

const adSchema = new Schema(
  { imageUrl: String, targetUrl: String, label: localized(false) },
  { _id: false },
);

const datesSchema = new Schema(
  {
    registrationOpensAt: { type: Date, required: true },
    registrationClosesAt: { type: Date, required: true },
    submissionStartsAt: { type: Date, required: true },
    submissionEndsAt: { type: Date, required: true },
    resultAt: { type: Date, required: true },
  },
  { _id: false },
);

const competitionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    title: localized(),
    category: { type: String, required: true },
    tags: [{ type: String }],
    certificate: { type: Boolean, default: false },
    prizePool: { type: Number, required: true, min: 0, validate: Number.isInteger }, // paise
    entryFee: { type: Number, required: true, min: 0, validate: Number.isInteger }, // paise
    currency: { type: String, default: 'INR', enum: ['INR'] },
    capacity: { type: Number, required: true, min: 1, validate: Number.isInteger },
    // Denormalised seat counter, only ever changed with conditional $inc inside a
    // transaction together with the registration write that justifies it.
    // Invariant: 0 ≤ bookedCount ≤ capacity == count(active registrations).
    bookedCount: { type: Number, default: 0, min: 0, validate: Number.isInteger },
    judge: judgeSchema,
    dates: { type: datesSchema, required: true },
    previousWinners: [winnerSchema],
    about: localized(),
    judgingParameters: [localized()],
    rules: [localized()],
    rewards: [rewardSchema],
    disclaimer: localized(false),
    prizeInfoVideoUrl: String,
    refundPolicy: localized(false),
    paymentProvider: { type: String, default: 'razorpay' },
    ad: { type: adSchema, default: null },
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft' },
  },
  { timestamps: true },
);

competitionSchema.index({ status: 1, 'dates.registrationClosesAt': 1 });

competitionSchema.pre('validate', function validateDates(next) {
  const d = this.dates;
  if (d) {
    if (d.registrationOpensAt >= d.registrationClosesAt) {
      this.invalidate('dates.registrationClosesAt', 'registrationClosesAt must be after registrationOpensAt');
    }
    if (d.submissionStartsAt >= d.submissionEndsAt) {
      this.invalidate('dates.submissionEndsAt', 'submissionEndsAt must be after submissionStartsAt');
    }
    if (d.submissionEndsAt > d.resultAt) {
      this.invalidate('dates.resultAt', 'resultAt must not be before submissionEndsAt');
    }
  }
  if (this.bookedCount > this.capacity) this.invalidate('bookedCount', 'bookedCount exceeds capacity');
  next();
});

module.exports = model('Competition', competitionSchema);
