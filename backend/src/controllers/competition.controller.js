'use strict';

const crypto = require('node:crypto');
const competitionService = require('../services/competition.service');
const registrationService = require('../services/registration.service');
const submissionService = require('../services/submission.service');

async function getDetails(req, res) {
  const { idOrSlug } = req.valid.params;
  const body = await competitionService.getCompetitionDetails(idOrSlug, req.user?.id ?? null, req.valid.query.lang);
  res.set('Cache-Control', 'private, no-store');
  res.json(body);
}

async function list(req, res) {
  res.json(await competitionService.listCompetitions(req.valid.query.lang));
}

async function getAvailability(req, res) {
  const body = await competitionService.getAvailability(req.valid.params.idOrSlug);
  // ETag over the state only (serverTime changes every call) so pollers get cheap 304s.
  const etag = `W/"${crypto.createHash('sha1').update(JSON.stringify([body.availability, body.lifecycle])).digest('base64url')}"`;
  res.set({ 'Cache-Control': 'public, max-age=2', ETag: etag });
  if (req.fresh) return res.status(304).end();
  res.json(body);
}

async function getTestimonials(req, res) {
  const { limit, lang } = req.valid.query;
  res.set('Cache-Control', 'public, max-age=60');
  res.json(await competitionService.listTestimonials(req.valid.params.idOrSlug, limit, lang));
}

async function register(req, res) {
  const competition = await competitionService.findCompetition(req.valid.params.idOrSlug, { projection: '_id' });
  const { created, ...body } = await registrationService.registerForCompetition(req.user.id, competition._id);
  res.status(created ? 201 : 200).json(body);
}

async function createSubmission(req, res) {
  const body = await submissionService.createSubmission(req.user.id, req.valid.params.idOrSlug, req.valid.body);
  res.status(201).json(body);
}

async function getMySubmission(req, res) {
  res.json(await submissionService.getMySubmission(req.user.id, req.valid.params.idOrSlug));
}

module.exports = { list, getDetails, getAvailability, getTestimonials, register, createSubmission, getMySubmission };
