'use strict';

const authService = require('../services/auth.service');
const referralService = require('../services/referral.service');

async function devLogin(req, res) {
  res.json(await authService.devLogin(req.valid.body.email));
}

async function listUsers(_req, res) {
  res.json(await authService.listUsers());
}

async function me(req, res) {
  res.json(await authService.getUser(req.user.id));
}

async function referral(req, res) {
  res.json(await referralService.getReferralSummary(req.user.id));
}

module.exports = { devLogin, listUsers, me, referral };
