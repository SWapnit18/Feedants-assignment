'use strict';

const { Router } = require('express');
const { z } = require('zod');
const ctrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const config = require('../config');

const authRouter = Router();
if (config.enableDevLogin) {
  authRouter.post('/dev-login', validate({ body: z.object({ email: z.string().trim().toLowerCase().email().max(254) }) }), ctrl.devLogin);
  authRouter.get('/users', ctrl.listUsers);
}

const meRouter = Router();
meRouter.get('/', requireAuth, ctrl.me);
meRouter.put('/', requireAuth, validate({ body: z.object({
  name: z.string().trim().min(1).max(120).optional(),
  profileImage: z.string().trim().url().nullable().optional(),
}).refine((body) => Object.keys(body).length > 0, 'At least one profile field is required') }), ctrl.updateMe);
meRouter.get('/referral', requireAuth, ctrl.referral);

module.exports = { authRouter, meRouter };
