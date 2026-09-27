const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const Winner = require('../models/Winner');
const Testimonial = require('../models/Testimonial');
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

  const compId = competition._id;
  const previousWinners = await Winner.find({ competitionId: compId })
    .sort({ year: -1, position: 1 })
    .lean();

  const totalSpots = competition.totalSpots || competition.maxParticipants || 20;
  const spotsBooked = competition.spotsBooked || 0;
  const spotsLeft = Math.max(totalSpots - spotsBooked, 0);
  const availableSpots = spotsLeft;

  res.json({
    success: true,
    data: {
      id: competition._id,
      title: competition.title,
      category: competition.category || 'Classical Dance',
      tags: competition.tags || [],
      hasCertificateForWinners: competition.hasCertificateForWinners,

      prizePool: competition.prizePool,
      entryFee: competition.entryFee,
      currency: competition.currency || 'INR',

      capacity: {
        totalSpots,
        maxParticipants: totalSpots,
        spotsBooked,
        spotsLeft,
        availableSpots,
      },

      judge: competition.judge,

      dates: {
        registrationOpensAt: competition.registrationOpensAt,
        registrationClosesAt: competition.registrationClosesAt,
        registrationStart: competition.registrationOpensAt,
        registrationEnd: competition.registrationClosesAt,
        submissionStartsAt: competition.submissionStartsAt,
        submissionEndsAt: competition.submissionEndsAt,
        submissionStart: competition.submissionStartsAt,
        submissionEnd: competition.submissionEndsAt,
        resultDate: competition.resultDate,
        serverTime: now,
      },

      state, // e.g. "REGISTRATION_OPEN"
      status: state,
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

      about: competition.aboutText || competition.description || '',
      description: competition.aboutText || competition.description || '',
      judgingParameters: competition.judgingParameters || [],
      rulesAndEligibility: competition.rulesAndEligibility || competition.rules || '',
      rules: competition.rules || competition.rulesAndEligibility || '',
      eligibility: competition.eligibility || competition.rulesAndEligibility || '',

      rewards: competition.rewards || [],
      previousWinners: previousWinners || [],
      disclaimerText: competition.disclaimerText,
      prizeMoneyInfoVideoUrl: competition.prizeMoneyInfoVideoUrl,

      referral: req.userId
        ? {
            earnAmountPerSignup: competition.referral?.earnAmountPerSignup || 0,
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

      action: userAction,
    },
  });
});

/**
 * GET /api/competitions/:id/winners
 * Returns previous winners for this competition from the real Winner collection.
 */
const getPreviousWinners = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let compId = id;
  if (!mongoose.isValidObjectId(id)) {
    const comp = await Competition.findOne({
      $or: [{ slug: id }, { title: new RegExp(id.replace(/-/g, ' '), 'i') }],
      isPublished: true,
    }).select('_id').lean();
    if (comp) compId = comp._id;
  }
  let winners = await Winner.find({ competitionId: compId }).sort({ year: -1, position: 1 }).lean();
  res.json({ success: true, data: winners || [] });
});

/**
 * GET /api/competitions/:id/reviews
 * Returns real participant reviews and testimonials from MongoDB.
 */
const getReviews = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const reviews = testimonials.map((t) => ({
    id: String(t._id),
    author: t.name,
    avatar: t.avatarUrl || null,
    rating: t.rating || 5,
    date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent',
    comment: typeof t.text === 'object' ? t.text?.en || t.text?.hi || '' : (t.text || ''),
  }));

  const averageRating =
    reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1))
      : 5.0;

  res.json({
    success: true,
    data: {
      averageRating,
      totalReviews: reviews.length,
      reviews,
    },
  });
});

module.exports = { getCompetitions, getCompetitionDetails, getPreviousWinners, getReviews };
