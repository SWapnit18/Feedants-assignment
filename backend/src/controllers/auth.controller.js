'use strict';

const authService = require('../services/auth.service');
const referralService = require('../services/referral.service');

async function signIn(req, res) {
  const { email, password } = req.valid.body;
  res.json(await authService.signIn(email, password));
}

async function signUp(req, res) {
  const { name, email, password } = req.valid.body;
  res.status(201).json(await authService.signUp(name, email, password));
}

async function devLogin(req, res) {
  res.json(await authService.devLogin(req.valid.body.email));
}

async function listUsers(_req, res) {
  res.json(await authService.listUsers());
}

async function me(req, res) {
  res.json(await authService.getUser(req.user.id));
}

async function updateMe(req, res) {
  res.json(await authService.updateUser(req.user.id, req.valid.body));
}

async function referral(req, res) {
  res.json(await referralService.getReferralSummary(req.user.id));
}

module.exports = { signIn, signUp, devLogin, listUsers, me, updateMe, referral };
