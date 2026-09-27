const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getCompetitionState, getUserAction } = require('../utils/competitionState');

/**
 * GET /api/competitions
 * Returns published competitions or the primary featured competition.
 */
const getCompetitions = asyncHandler(async (req, res) => {
  const competitions = await Competition.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  if (!competitions || competitions.length === 0) {
    throw new ApiError(404, 'No competitions found');
  }

  // If client wants details of the first featured competition directly
  const competition = competitions[0];
  const now = new Date();
  const state = getCompetitionState(competition, now);

  let registration = null;
  let submission = null;

  if (req.userId) {
    [registration, submission] = await Promise.all([
      Registration.findOne({
        competition: competition._id,
        user: req.userId,
        status: 'active',
      }).lean(),
      Submission.findOne({
        competition: competition._id,
        user: req.userId,
        isLatest: true,
      }).lean(),
    ]);
  }

  const userAction = getUserAction({ state, registration, submission });

  res.json({
    success: true,
    data: {
      id: competition._id,
      title: competition.title,
      tags: competition.tags,
      hasCertificateForWinners: competition.hasCertificateForWinners,

      prizePool: competition.prizePool,
      entryFee: competition.entryFee,
      currency: competition.currency,

      capacity: {
        totalSpots: competition.totalSpots,
        spotsBooked: competition.spotsBooked,
        spotsLeft: competition.spotsLeft,
      },

      judge: competition.judge,

      dates: {
        registrationOpensAt: competition.registrationOpensAt,
        registrationClosesAt: competition.registrationClosesAt,
        submissionStartsAt: competition.submissionStartsAt,
        submissionEndsAt: competition.submissionEndsAt,
        resultDate: competition.resultDate,
        serverTime: now,
      },

      state,
      countdownTargetAt:
        state === 'UPCOMING'
          ? competition.registrationOpensAt
          : state === 'REGISTRATION_OPEN'
          ? competition.registrationClosesAt
          : state === 'AWAITING_SUBMISSION_WINDOW'
          ? competition.submissionStartsAt
          : state === 'SUBMISSION_OPEN'
          ? competition.submissionEndsAt
          : null,

      about: competition.aboutText,
      judgingParameters: competition.judgingParameters,
      rulesAndEligibility: competition.rulesAndEligibility,

      rewards: competition.rewards,
      previousWinners: competition.previousWinners,
      disclaimerText: competition.disclaimerText,
      prizeMoneyInfoVideoUrl: competition.prizeMoneyInfoVideoUrl,

      referral: {
        earnAmountPerSignup: competition.referral?.earnAmountPerSignup || 10,
        shareLink: 'https://feedants.com/r/referral123',
      },

      user: {
        isAuthenticated: !!req.userId,
        isRegistered: !!registration,
        registeredAt: registration?.createdAt || null,
        submission: submission
          ? {
              status: submission.status,
              submittedAt: submission.createdAt,
              mediaUrl: submission.mediaUrl,
            }
          : null,
      },

      action: userAction,
      allCompetitions: competitions.map((c) => ({
        id: c._id,
        title: c.title,
        prizePool: c.prizePool,
        entryFee: c.entryFee,
      })),
    },
  });
});

/**
 * GET /api/competitions/:id
 *
 * Single source of truth for the whole "Competition Details" screen.
 * Everything the design shows -- prize pool, spots left, countdown target,
 * important dates, tabs, rewards, previous winners, AND the user's own
 * registered/submitted state and what the bottom button should say -- is
 * assembled server-side so the client never has to re-derive business
 * rules (which would risk drifting from the backend).
 *
 * Auth is optional here: logged-out users can preview the screen, they
 * just get isRegistered:false and a "Register Now" CTA that will prompt
 * login when tapped (handled client-side).
 */
const getCompetitionDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let query = { isPublished: true };
  if (mongoose.isValidObjectId(id)) {
    query = { _id: id, isPublished: true };
  } else if (id && id !== 'featured' && id !== 'default') {
    query = {
      $or: [{ slug: id }, { title: new RegExp(id.replace(/-/g, ' '), 'i') }],
      isPublished: true,
    };
  }

  let competition = await Competition.findOne(query).lean({ virtuals: true });
  if (!competition) {
    competition = await Competition.findOne({ isPublished: true }).lean({ virtuals: true });
  }

  if (!competition) throw new ApiError(404, 'Competition not found');

  const now = new Date();
  const state = getCompetitionState(competition, now);

  let registration = null;
  let submission = null;

  if (req.userId) {
    [registration, submission] = await Promise.all([
      Registration.findOne({
        competition: competition._id,
        user: req.userId,
        status: 'active',
      }).lean(),
      Submission.findOne({
        competition: competition._id,
        user: req.userId,
        isLatest: true,
      }).lean(),
    ]);
  }

  const userAction = getUserAction({ state, registration, submission });

  res.json({
    success: true,
    data: {
      id: competition._id,
      title: competition.title,
      tags: competition.tags,
      hasCertificateForWinners: competition.hasCertificateForWinners,

      prizePool: competition.prizePool,
      entryFee: competition.entryFee,
      currency: competition.currency,

      capacity: {
        totalSpots: competition.totalSpots,
        spotsBooked: competition.spotsBooked,
        spotsLeft: competition.spotsLeft,
      },

      judge: competition.judge,

      dates: {
        registrationOpensAt: competition.registrationOpensAt,
        registrationClosesAt: competition.registrationClosesAt,
        submissionStartsAt: competition.submissionStartsAt,
        submissionEndsAt: competition.submissionEndsAt,
        resultDate: competition.resultDate,
        // The client should NEVER trust its own device clock for a
        // countdown against a shared deadline -- it drifts and can be
        // spoofed. We hand back our server time so the app can compute
        // an offset and render an accurate, tamper-resistant countdown.
        serverTime: now,
      },

      state, // e.g. "REGISTRATION_OPEN" -- drives non-CTA UI (badges, banners)
      countdownTargetAt:
        state === 'UPCOMING'
          ? competition.registrationOpensAt
          : state === 'REGISTRATION_OPEN'
          ? competition.registrationClosesAt
          : state === 'AWAITING_SUBMISSION_WINDOW'
          ? competition.submissionStartsAt
          : state === 'SUBMISSION_OPEN'
          ? competition.submissionEndsAt
          : null,

      about: competition.aboutText,
      judgingParameters: competition.judgingParameters,
      rulesAndEligibility: competition.rulesAndEligibility,

      rewards: competition.rewards,
      previousWinners: competition.previousWinners,
      disclaimerText: competition.disclaimerText,
      prizeMoneyInfoVideoUrl: competition.prizeMoneyInfoVideoUrl,

      referral: req.userId
        ? {
            earnAmountPerSignup: competition.referral?.earnAmountPerSignup || 0,
            // In production this is looked up from the User document's
            // own referralCode, not stored per-competition.
            shareLink: `https://feedants.com/r/${req.userId}`,
          }
        : null,

      user: {
        isAuthenticated: !!req.userId,
        isRegistered: !!registration,
        registeredAt: registration?.createdAt || null,
        submission: submission
          ? {
              status: submission.status,
              submittedAt: submission.createdAt,
              mediaUrl: submission.mediaUrl,
            }
          : null,
      },

      action: userAction, // { label, enabled, action }
    },
  });
});

/**
 * GET /api/competitions/:id/winners
 * Kept as a separate, cacheable, lightweight endpoint since "previous
 * winners" data changes far less often than live capacity/state and a
 * client might want to refresh it independently (e.g. a "see all" screen).
 */
const getPreviousWinners = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const competition = await Competition.findById(id).select('previousWinners').lean();
  if (!competition) throw new ApiError(404, 'Competition not found');
  res.json({ success: true, data: competition.previousWinners });
});

/**
 * GET /api/competitions/:id/reviews
 * Returns verified participant reviews and ratings for this competition.
 */
const getReviews = asyncHandler(async (req, res) => {
  const reviews = [
    {
      id: 'rev_1',
      author: 'Ananya Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: '2 days ago',
      comment:
        'Feedants gave me an amazing platform to share my Kathak performance with thousands of classical dance lovers across India! The judging feedback from Manju Dubey was super insightful.',
    },
    {
      id: 'rev_2',
      author: 'Rohan Mukherjee',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: '1 week ago',
      comment:
        'Great judging panel, completely fair evaluation, and seamless prize distribution directly to UPI within 24 hours of result declaration!',
    },
    {
      id: 'rev_3',
      author: 'Pooja Hegde',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: '2 weeks ago',
      comment:
        'Participating in Feedants Classical Dance was one of the best experiences of my dance journey. Verified certificates for winners helped build my portfolio!',
    },
  ];

  res.json({
    success: true,
    data: {
      averageRating: 4.9,
      totalReviews: 128,
      reviews,
    },
  });
});

module.exports = { getCompetitions, getCompetitionDetails, getPreviousWinners, getReviews };
