'use strict';

const { Schema, model } = require('mongoose');

const referralSchema = new Schema(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refereeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rewardAmount: { type: Number, required: true, min: 0 }, // paise
  },
  { timestamps: true },
);

module.exports = model('Referral', referralSchema);
