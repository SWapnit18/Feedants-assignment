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

  try {
    const submission = await Submission.create({
      competitionId: competition._id,
      userId,
      registrationId: registration._id,
      mediaUrl,
      caption: caption ?? null,
      status: 'received',
    });
    return { submission: serializeSubmission(submission.toObject()) };
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new AppError('ALREADY_SUBMITTED', 'You have already submitted an entry');
    }
    throw err;
  }
}

async function getMySubmission(userId, idOrSlug) {
  const competition = await findCompetition(idOrSlug, { projection: '_id' });
  const submission = await Submission.findOne({ competitionId: competition._id, userId }).lean();
  return { submission: serializeSubmission(submission) };
}

module.exports = { createSubmission, getMySubmission };
