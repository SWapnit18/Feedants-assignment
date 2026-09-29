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
async function createSubmission(userId, idOrSlug, { mediaUrl, caption }) {
  const competition = await findCompetition(idOrSlug, { projection: 'status dates' });
  const lifecycle = computeLifecycle(competition, new Date());
  if (!lifecycle.submissionOpen) throw new AppError('SUBMISSION_WINDOW_CLOSED', 'Submissions are not open for this competition');

  let registration = await Registration.findOne({
    competitionId: competition._id,
    userId,
    status: 'confirmed',
  }).lean();
  if (!registration) throw new AppError('NOT_REGISTERED', 'You must complete registration before submitting');

  const submission = await Submission.findOneAndUpdate(
    { competitionId: competition._id, userId },
    {
      $set: {
        competition: competition._id,
        competitionId: competition._id,
        user: userId,
        userId,
        registration: registration._id,
        registrationId: registration._id,
        mediaUrl,
        videoUrl: mediaUrl,
        caption: caption ?? null,
        status: 'received',
        submittedAt: new Date(),
        isLatest: true,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return { submission: serializeSubmission(submission.toObject ? submission.toObject() : submission) };
}

async function getMySubmission(userId, idOrSlug) {
  const competition = await findCompetition(idOrSlug, { projection: '_id' });
  const submission = await Submission.findOne({ competitionId: competition._id, userId }).lean();
  return { submission: serializeSubmission(submission) };
}

module.exports = { createSubmission, getMySubmission };
