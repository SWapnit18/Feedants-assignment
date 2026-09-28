'use strict';

const { rateLimit } = require('express-rate-limit');
const config = require('../config');
const { AppError } = require('../utils/AppError');

const handler = (_req, _res, next, options) =>
  next(new AppError('RATE_LIMITED', 'Too many requests, please slow down', { details: { retryAfterMs: options.windowMs } }));

const passthrough = (_req, _res, next) => next();

/** Global per-IP limiter. (In a multi-instance deploy, back this with a Redis store.) */
const globalLimiter = config.rateLimit.enabled
  ? rateLimit({ windowMs: config.rateLimit.windowMs, limit: config.rateLimit.max, standardHeaders: 'draft-7', legacyHeaders: false, handler })
  : passthrough;

/** Stricter limiter for authentication routes to prevent brute-force attacks. */
const authLimiter = config.rateLimit.enabled
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 10, // 10 attempts per 15 minutes
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      handler: (_req, _res, next) =>
        next(new AppError('RATE_LIMITED', 'Too many login attempts, please try again later.', { details: { retryAfterMs: 15 * 60 * 1000 } })),
    })
  : passthrough;

/** Stricter limiter for money/seat-touching mutations, keyed per user. */
const mutationLimiter = config.rateLimit.enabled
  ? rateLimit({
      windowMs: config.rateLimit.windowMs,
      limit: config.rateLimit.mutationMax,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      keyGenerator: (req) => (req.user ? `u:${req.user.id}` : `ip:${req.ip}`),
      handler,
    })
  : passthrough;

module.exports = { globalLimiter, mutationLimiter, authLimiter };
