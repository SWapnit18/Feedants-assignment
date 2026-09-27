'use strict';

const { Competition, Registration, Submission, Testimonial } = require('../models');
const { ACTIVE_STATUSES } = require('../models/Registration');
const { AppError } = require('../utils/AppError');
const { isObjectId } = require('../utils/ids');
const { t } = require('../utils/i18n');
const config = require('../config');
const { computeAvailability, computeLifecycle, computePrimaryAction, isHoldActive } = require('./lifecycle');
const { releaseExpiredHolds } = require('./registration.service');

const VISIBLE_STATUSES = ['published', 'cancelled'];
const iso = (d) => (d ? new Date(d).toISOString() : null);

/**
 * Look up a visible competition by ObjectId or slug.
 * @param {string} idOrSlug
 * @param {{ projection?: string }} [opts]
 */
async function findCompetition(idOrSlug, opts = {}) {
  const filter = isObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: String(idOrSlug).toLowerCase() };
  const competition = await Competition.findOne({ ...filter, status: { $in: VISIBLE_STATUSES } }, opts.projection).lean();
  if (!competition) throw new AppError('NOT_FOUND', 'Competition not found');
  return competition;
}

/** Map a competition document to the public, language-resolved DTO. */
function serializeCompetition(c, lang) {
  return {
    id: String(c._id),
    slug: c.slug,
    title: t(c.title, lang),
    category: c.category,
    tags: c.tags || [],
    certificate: !!c.certificate,
    prizePool: c.prizePool,
    entryFee: c.entryFee,
    currency: c.currency,
    judge: c.judge
      ? {
          name: c.judge.name,
          title: t(c.judge.title, lang),
          experienceYears: c.judge.experienceYears,
          avatarUrl: c.judge.avatarUrl || null,
          introVideoUrl: c.judge.introVideoUrl || null,
        }
      : null,
    dates: {
      registrationOpensAt: iso(c.dates.registrationOpensAt),
      registrationClosesAt: iso(c.dates.registrationClosesAt),
      submissionStartsAt: iso(c.dates.submissionStartsAt),
      submissionEndsAt: iso(c.dates.submissionEndsAt),
      resultAt: iso(c.dates.resultAt),
    },
    previousWinners: (c.previousWinners || []).map((w) => ({
      id: String(w._id),
      name: w.name,
      positionLabel: t(w.positionLabel, lang),
      position: w.position,
      thumbnailUrl: w.thumbnailUrl || null,
      videoUrl: w.videoUrl || null,
    })),
    tabs: {
      about: t(c.about, lang),
      judgingParameters: (c.judgingParameters || []).map((p) => t(p, lang)),
      rulesAndEligibility: (c.rules || []).map((r) => t(r, lang)),
    },
    rewards: [...(c.rewards || [])]
      .sort((a, b) => a.position - b.position)
      .map((r) => ({ position: r.position, label: t(r.label, lang), amount: r.amount })),
    disclaimer: t(c.disclaimer, lang),
    prizeInfoVideoUrl: c.prizeInfoVideoUrl || null,
    refundPolicy: t(c.refundPolicy, lang),
    paymentProvider: c.paymentProvider || config.payment.provider,
    ad: c.ad && c.ad.imageUrl ? { imageUrl: c.ad.imageUrl, targetUrl: c.ad.targetUrl || null, label: t(c.ad.label, lang) } : null,
    status: c.status,
  };
}

const serializeRegistration = (r) =>
  r ? { id: String(r._id), status: r.status, holdExpiresAt: iso(r.holdExpiresAt) } : null;

const serializeSubmission = (s) =>
  s
    ? {
        id: String(s._id),
        status: s.status,
        mediaUrl: s.mediaUrl,
        caption: s.caption ?? null,
        submittedAt: iso(s.createdAt),
      }
    : null;

/**
 * Full competition-details payload (competition + availability + lifecycle + viewer state).
 * @param {string} idOrSlug
 * @param {string|null} userId
 * @param {'en'|'hi'} lang
 */
async function getCompetitionDetails(idOrSlug, userId, lang) {
  let competition = await findCompetition(idOrSlug);

  let registration = null;
  let submission = null;
  if (userId) {
    // Lazily release this viewer's own lapsed hold so their CTA is correct
    // immediately rather than after the next sweeper tick.
    const released = await releaseExpiredHolds({ competitionId: competition._id, userId });
    if (released > 0) competition = await findCompetition(String(competition._id));
    [registration, submission] = await Promise.all([
      Registration.findOne({ competitionId: competition._id, userId, status: { $in: ACTIVE_STATUSES } }).lean(),
      Submission.findOne({ competitionId: competition._id, userId }).lean(),
    ]);
  }

  const now = new Date();
  const availability = computeAvailability(competition);
  const lifecycle = computeLifecycle(competition, now);
  const actionInput = { competition, lifecycle, availability, now, lang };

  const body = {
    serverTime: now.toISOString(),
    competition: serializeCompetition(competition, lang),
    availability,
    lifecycle,
    viewer: null,
  };

  if (userId) {
    // A pending hold whose time has passed (and couldn't be released) is not shown.
    const visibleReg = registration && (registration.status === 'confirmed' || isHoldActive(registration, now)) ? registration : null;
    body.viewer = {
      registration: serializeRegistration(visibleReg),
      submission: serializeSubmission(submission),
      primaryAction: computePrimaryAction({ ...actionInput, registration: visibleReg, submission }),
    };
  } else {
    body.anonymousAction = computePrimaryAction({ ...actionInput, anonymous: true });
  }
  return body;
}

/** Cheap polling payload. */
async function getAvailability(idOrSlug) {
  const competition = await findCompetition(idOrSlug, { projection: 'status dates capacity bookedCount' });
  const now = new Date();
  return {
    serverTime: now.toISOString(),
    availability: computeAvailability(competition),
    lifecycle: computeLifecycle(competition, now),
  };
}

async function listTestimonials(idOrSlug, limit, lang) {
  await findCompetition(idOrSlug, { projection: '_id' });
  const items = await Testimonial.find({ isPublished: true }).sort({ createdAt: -1 }).limit(limit).lean();
  return {
    items: items.map((x) => ({
      id: String(x._id),
      name: x.name,
      avatarUrl: x.avatarUrl || null,
      text: t(x.text, lang),
      rating: x.rating,
    })),
  };
}

module.exports = {
  findCompetition,
  getCompetitionDetails,
  getAvailability,
  listTestimonials,
  serializeCompetition,
  serializeRegistration,
  serializeSubmission,
};
