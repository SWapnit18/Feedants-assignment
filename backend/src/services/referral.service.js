'use strict';

const mongoose = require('mongoose');
const { User, Referral } = require('../models');
const { AppError } = require('../utils/AppError');
const config = require('../config');

async function getReferralSummary(userId) {
  const user = await User.findById(userId, 'referralCode').lean();
  if (!user) throw new AppError('UNAUTHENTICATED', 'User no longer exists');
  const [agg] = await Referral.aggregate([
    { $match: { referrerId: new mongoose.Types.ObjectId(String(userId)) } },
    { $group: { _id: null, signups: { $sum: 1 }, earned: { $sum: '$rewardAmount' } } },
  ]);
  return {
    code: user.referralCode,
    link: `${config.referral.baseUrl}${user.referralCode}`,
    rewardPerSignup: config.referral.rewardPerSignup,
    signups: agg?.signups ?? 0,
    earned: agg?.earned ?? 0,
  };
}

module.exports = { getReferralSummary };
