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
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid competition id');
  }

  const competition = await Competition.findOne({
    _id: id,
    isPublished: true,
  }).lean({ virtuals: true });

  if (!competition) throw new ApiError(404, 'Competition not found');

  const now = new Date();
  const state = getCompetitionState(competition, now);

  let registration = null;
  let submission = null;

  if (req.userId) {
    [registration, submission] = await Promise.all([
      Registration.findOne({
        competition: id,
        user: req.userId,
        status: 'active',
      }).lean(),
      Submission.findOne({
        competition: id,
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

module.exports = { getCompetitions, getCompetitionDetails, getPreviousWinners };
