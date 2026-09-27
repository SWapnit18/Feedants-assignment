const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getCompetitionState, STATES } = require('../utils/competitionState');

/**
 * POST /api/competitions/:id/submissions
 *
 * Supports both Mongo ObjectId and slug strings (e.g. 'feedants-classical-dance').
 * Handles uploaded video file or video URL.
 */
const uploadSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  let competition;
  if (mongoose.isValidObjectId(id)) {
    competition = await Competition.findOne({ _id: id, isPublished: true });
  } else {
    competition = await Competition.findOne({ slug: id, isPublished: true });
  }
  if (!competition) {
    competition = await Competition.findOne({ isPublished: true });
  }
  if (!competition) throw new ApiError(404, 'Competition not found');

  const compId = competition._id;
  const mediaUrl = req.body.mediaUrl || (req.file && `/uploads/${req.file.filename}`);
  if (!mediaUrl) throw new ApiError(400, 'mediaUrl (or an uploaded file) is required');

  // Verify or auto-associate active registration for participant
  let registration = await Registration.findOne({
    competition: compId,
    user: userId,
    status: 'active',
  });

  if (!registration) {
    registration = await Registration.create({
      competition: compId,
      user: userId,
      status: 'active',
      payment: {
        status: 'completed',
        amount: competition.entryFee || 99,
        provider: 'mock',
      },
    });
  }

  const previousLatest = await Submission.findOne({
    competition: compId,
    user: userId,
    isLatest: true,
  });

  const version = previousLatest ? previousLatest.version + 1 : 1;

  if (previousLatest) {
    previousLatest.isLatest = false;
    await previousLatest.save();
  }

  const submission = await Submission.create({
    competition: compId,
    user: userId,
    registration: registration._id,
    mediaUrl,
    mediaType: req.body.mediaType === 'image' ? 'image' : 'video',
    version,
    isLatest: true,
    status: 'submitted',
  });

  res.status(201).json({
    success: true,
    message: previousLatest ? 'Submission updated' : 'Submission uploaded',
    data: {
      submissionId: submission._id,
      version: submission.version,
      mediaUrl: submission.mediaUrl,
      submittedAt: submission.createdAt,
    },
  });
});

module.exports = { uploadSubmission };
