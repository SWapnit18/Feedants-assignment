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

  let registration = await Registration.findOne({
    competitionId: competition._id,
    userId,
    status: 'confirmed',
  }).lean();

  if (!registration) {
    registration = await Registration.findOneAndUpdate(
      { competitionId: competition._id, userId },
      { $set: { status: 'confirmed', holdExpiresAt: null } },
      { upsert: true, new: true }
    ).lean();
  }

  try {
    const submission = await Submission.create({
      competitionId: competition._id,
      userId,
      registrationId: registration._id,
      mediaUrl,
      caption: caption ?? null,
    });
    return { submission: serializeSubmission(submission.toObject()) };
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      // Allow user to update their submission with a new video performance
      const updated = await Submission.findOneAndUpdate(
        { competitionId: competition._id, userId },
        { mediaUrl, caption: caption ?? null, submittedAt: new Date() },
        { new: true }
      );
      return { submission: serializeSubmission(updated.toObject()) };
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
