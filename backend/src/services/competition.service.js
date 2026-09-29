'use strict';

const { Competition, Registration, Submission, Testimonial, Winner } = require('../models');
const { ACTIVE_STATUSES } = require('../models/Registration');
const { AppError } = require('../utils/AppError');
const { isObjectId } = require('../utils/ids');
const { t } = require('../utils/i18n');
const config = require('../config');
const { computeAvailability, computeLifecycle, computePrimaryAction, isHoldActive } = require('./lifecycle');
const { releaseExpiredHolds } = require('./registration.service');

const VISIBLE_STATUSES = ['published', 'cancelled'];
const iso = (d) => (d ? new Date(d).toISOString() : null);

async function listCompetitions(lang = 'en') {
  const competitions = await Competition.find({ status: 'published' })
    .sort({ 'dates.registrationClosesAt': 1, createdAt: -1 })
    .select('_id slug title category tags status dates')
    .lean();

  return {
    items: competitions.map((c) => ({
      id: String(c._id),
      slug: c.slug || String(c._id),
      title: t(c.title, lang),
      category: c.category,
      tags: c.tags || [],
      status: c.status,
      dates: {
        registrationOpensAt: iso(c.dates?.registrationOpensAt),
        registrationClosesAt: iso(c.dates?.registrationClosesAt),
        submissionStartsAt: iso(c.dates?.submissionStartsAt),
        submissionEndsAt: iso(c.dates?.submissionEndsAt),
        resultAt: iso(c.dates?.resultAt),
      },
    })),
  };
}

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
function serializeCompetition(c, lang, winners = c.previousWinners || []) {
  const localizedList = (values) => {
    if (typeof values === 'string') return [values];
    return (values || []).map((value) => {
      if (typeof value === 'string') return value;
      if (value?.name && value?.percentage != null) {
        return `${t(value.name, lang)} (${value.percentage}%)${value.description ? `: ${t(value.description, lang)}` : ''}`;
      }
      return t(value, lang);
    }).filter(Boolean);
  };
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
    previousWinners: winners.map((w) => ({
      id: String(w._id),
      name: w.name,
      positionLabel: t(w.positionLabel, lang),
      position: w.position,
      thumbnailUrl: w.thumbnailUrl || null,
      videoUrl: w.videoUrl || null,
    })),
    tabs: {
      about: t(c.about, lang),
      judgingParameters: localizedList(c.judgingParameters),
      rulesAndEligibility: localizedList(c.rules || c.rulesAndEligibility),
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
        submissionId: String(s._id),
        competitionId: String(s.competitionId || s.competition),
        userId: String(s.userId || s.user),
        status: s.status || 'submitted',
        mediaUrl: s.videoUrl || s.mediaUrl,
        videoUrl: s.videoUrl || s.mediaUrl,
        videoFileName: s.videoFileName || s.fileName || 'performance.mp4',
        fileName: s.videoFileName || s.fileName || 'performance.mp4',
        fileSize: s.fileSize || null,
        title: s.title || null,
        description: s.description || null,
        caption: s.caption ?? s.description ?? null,
        submittedAt: iso(s.submittedAt || s.createdAt),
        updatedAt: iso(s.updatedAt || s.submittedAt || s.createdAt),
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
  const winners = await Winner.find({ competitionId: competition._id }).sort({ year: -1, position: 1 }).lean();
  if (userId) {
    // Lazily release this viewer's own lapsed hold so their CTA is correct
    // immediately rather than after the next sweeper tick.
    const released = await releaseExpiredHolds({ competitionId: competition._id, userId });
    if (released > 0) competition = await findCompetition(String(competition._id));
    [registration, submission] = await Promise.all([
      Registration.findOne({
        $or: [
          { competitionId: competition._id, userId },
          { competition: competition._id, user: userId },
        ],
        status: { $in: ACTIVE_STATUSES },
      }).lean(),
      Submission.findOne({
        $or: [
          { competitionId: competition._id, userId },
          { competition: competition._id, user: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);
  }

  const now = new Date();
  const availability = computeAvailability(competition);
  const lifecycle = computeLifecycle(competition, now);
  const actionInput = { competition, lifecycle, availability, now, lang };

  const body = {
    serverTime: now.toISOString(),
    competition: serializeCompetition(competition, lang, winners),
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
  listCompetitions,
  findCompetition,
  getCompetitionDetails,
  getAvailability,
  listTestimonials,
  serializeCompetition,
  serializeRegistration,
  serializeSubmission,
};
