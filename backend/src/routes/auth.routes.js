'use strict';

const { Router } = require('express');
const { z } = require('zod');
const ctrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const config = require('../config');

const authRouter = Router();

authRouter.post(
  ['/sign-in', '/signin', '/login'],
  authLimiter,
  validate({
    body: z.object({
      email: z.string().trim().toLowerCase().email().max(254),
      password: z.string().min(1, 'Password is required'),
    }),
  }),
  ctrl.signIn,
);

authRouter.post(
  ['/sign-up', '/signup'],
  authLimiter,
  validate({
    body: z.object({
      name: z.string().trim().min(1, 'Name is required').max(120),
      email: z.string().trim().toLowerCase().email().max(254),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),
  ctrl.signUp,
);

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
