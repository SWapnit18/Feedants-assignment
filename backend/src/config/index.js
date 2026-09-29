'use strict';

/**
 * Centralised, validated configuration. Every env var the app reads is
 * declared here (and documented in .env.example). Fails fast on bad config.
 */
require('dotenv').config();
const { z } = require('zod');

const bool = (def) =>
  z
    .enum(['true', 'false', '1', '0'])
    .default(def ? 'true' : 'false')
    .transform((v) => v === 'true' || v === '1');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(16).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ENABLE_DEV_LOGIN: bool(true),
  PAYMENT_MODE: z.enum(['mock', 'live']).default('mock'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_feedants_mock'),
  RAZORPAY_KEY_SECRET: z.string().default('mock_razorpay_secret_change_me'),
  SEAT_HOLD_MINUTES: z.coerce.number().positive().default(10),
  HOLD_SWEEP_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  PUBLIC_BASE_URL: z.string().url().optional(),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_ENABLED: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_MUTATION_MAX: z.coerce.number().int().positive().default(30),
  UPLOAD_DIR: z.string().default('uploads'),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(50 * 1024 * 1024),
  REFERRAL_REWARD_PAISE: z.coerce.number().int().nonnegative().default(1000),
  REFERRAL_BASE_URL: z.string().default('https://feedants.com/r/'),
  LOG_LEVEL: z.string().optional(),
  SEED_ON_START: z.string().optional(),
});

// Treat empty values (e.g. `PUBLIC_BASE_URL=` copied from .env.example) as unset.
const rawEnv = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ''));
const parsed = schema.safeParse(rawEnv);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
const env = parsed.data;
const isProd = env.NODE_ENV === 'production';
const isTest = env.NODE_ENV === 'test';

if (isProd && !env.JWT_SECRET) {
  console.error('JWT_SECRET is required in production');
  process.exit(1);
}
if (isProd && env.ENABLE_DEV_LOGIN) {
  console.warn('WARNING: ENABLE_DEV_LOGIN=true in production');
}

const path = require('node:path');

module.exports = Object.freeze({
  env: env.NODE_ENV,
  isProd,
  isTest,
  port: env.PORT,
  host: env.HOST,
  mongoUri: env.MONGODB_URI || null,
  jwt: {
    secret: env.JWT_SECRET || 'dev-only-insecure-jwt-secret-change-me',
    expiresIn: env.JWT_EXPIRES_IN,
  },
  enableDevLogin: env.ENABLE_DEV_LOGIN,
  payment: {
    mode: env.PAYMENT_MODE,
    provider: 'razorpay',
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
  },
  seatHoldMs: Math.round(env.SEAT_HOLD_MINUTES * 60_000),
  holdSweepIntervalMs: env.HOLD_SWEEP_INTERVAL_MS,
  publicBaseUrl: env.PUBLIC_BASE_URL ? env.PUBLIC_BASE_URL.replace(/\/$/, '') : null,
  corsOrigin: env.CORS_ORIGIN,
  rateLimit: {
    enabled: env.RATE_LIMIT_ENABLED ? env.RATE_LIMIT_ENABLED === 'true' : !isTest,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    mutationMax: env.RATE_LIMIT_MUTATION_MAX,
  },
  upload: {
    dir: process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve(__dirname, '../..', env.UPLOAD_DIR),
    maxBytes: env.UPLOAD_MAX_BYTES,
  },
  referral: {
    rewardPerSignup: env.REFERRAL_REWARD_PAISE,
    baseUrl: env.REFERRAL_BASE_URL,
  },
  logLevel: env.LOG_LEVEL || (isTest ? 'silent' : 'info'),
  seedOnStart: env.SEED_ON_START === 'true',
});
