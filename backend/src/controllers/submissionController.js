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
 * Expects a file already uploaded via multer (req.file) in this reference
 * implementation. In production, swap the local disk storage in
 * routes/submissionRoutes.js for direct-to-S3 pre-signed uploads so large
 * video files never pass through the API servers at all -- the client
 * uploads straight to object storage and only sends us the resulting URL.
 */
const uploadSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid competition id');

  const mediaUrl = req.body.mediaUrl || (req.file && `/uploads/${req.file.filename}`);
  if (!mediaUrl) throw new ApiError(400, 'mediaUrl (or an uploaded file) is required');

  const competition = await Competition.findOne({ _id: id, isPublished: true }).lean();
  if (!competition) throw new ApiError(404, 'Competition not found');

  const state = getCompetitionState(competition);
  if (state !== STATES.SUBMISSION_OPEN) {
    throw new ApiError(409, 'Submissions are not open for this competition right now');
  }

  const registration = await Registration.findOne({
    competition: id,
    user: userId,
    status: 'active',
  });
  if (!registration) {
    throw new ApiError(403, 'Only registered participants can submit an entry');
  }

  const previousLatest = await Submission.findOne({
    competition: id,
    user: userId,
    isLatest: true,
  });

  const version = previousLatest ? previousLatest.version + 1 : 1;

  if (previousLatest) {
    previousLatest.isLatest = false;
    await previousLatest.save();
  }

  const submission = await Submission.create({
    competition: id,
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
      submittedAt: submission.createdAt,
    },
  });
});

module.exports = { uploadSubmission };
