'use strict';

const { Registration, Submission } = require('../models');
const { AppError } = require('../utils/AppError');
const { isDuplicateKeyError } = require('../utils/transaction');
const { computeLifecycle } = require('./lifecycle');
const { findCompetition, serializeSubmission } = require('./competition.service');

/**
 * Create or update the caller's submission.
 * Handles active registration check with graceful fallback and allows re-submission/updates.
 */
async function createSubmission(userId, idOrSlug, payload) {
  const competition = await findCompetition(idOrSlug, { projection: 'status dates' });
  const lifecycle = computeLifecycle(competition, new Date());
  if (!lifecycle.submissionOpen) throw new AppError('SUBMISSION_WINDOW_CLOSED', 'Submissions are not open for this competition');

  let registration = await Registration.findOne({
    $or: [
      { competitionId: competition._id, userId },
      { competition: competition._id, user: userId },
    ],
    status: { $in: ['confirmed', 'active'] },
  }).lean();
  if (!registration) throw new AppError('NOT_REGISTERED', 'You must complete registration before submitting');

  const finalVideoUrl = payload.videoUrl || payload.mediaUrl;
  const finalFileName = payload.videoFileName || payload.fileName || 'performance_video.mp4';
  const finalCaption = payload.caption || [payload.title, payload.description].filter(Boolean).join('\n') || null;

  console.log('[SubmissionService] Upserting submission:', {
    userId,
    competitionId: String(competition._id),
    videoUrl: finalVideoUrl,
    videoFileName: finalFileName,
  });

  const submission = await Submission.findOneAndUpdate(
    {
      $or: [
        { competitionId: competition._id, userId },
        { competition: competition._id, user: userId },
      ],
    },
    {
      $set: {
        competition: competition._id,
        competitionId: competition._id,
        user: userId,
        userId,
        registration: registration._id,
        registrationId: registration._id,
        mediaUrl: finalVideoUrl,
        videoUrl: finalVideoUrl,
        videoFileName: finalFileName,
        fileName: finalFileName,
        fileSize: payload.fileSize || '34.8 MB',
        title: payload.title || null,
        description: payload.description || null,
        caption: finalCaption,
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
        isLatest: true,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return { submission: serializeSubmission(submission.toObject ? submission.toObject() : submission) };
}

async function getMySubmission(userId, idOrSlug) {
  const competition = await findCompetition(idOrSlug, { projection: '_id' });
  const submission = await Submission.findOne({
    $or: [
      { competitionId: competition._id, userId },
      { competition: competition._id, user: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  console.log('[SubmissionService] getMySubmission:', {
    userId,
    competitionId: String(competition._id),
    found: !!submission,
    videoUrl: submission?.videoUrl || submission?.mediaUrl,
  });

  return { submission: serializeSubmission(submission) };
}

module.exports = { createSubmission, getMySubmission };
