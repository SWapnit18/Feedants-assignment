'use strict';

const crypto = require('node:crypto');
const { IdempotencyKey } = require('../models');
const { AppError } = require('../utils/AppError');
const { isDuplicateKeyError } = require('../utils/transaction');
const logger = require('../config/logger');

const KEY_RE = /^[A-Za-z0-9_-]{8,128}$/;
const STALE_LOCK_MS = 60_000;

/** Deterministic JSON (sorted keys) so logically equal bodies hash equally. */
function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(',')}}`;
}

/**
 * Idempotency-Key support for mutating endpoints (must run after requireAuth).
 *
 * First request with a key claims it (unique index on key+user+route) and its
 * final response (<500) is stored; later requests with the same key replay the
 * stored response. Same key with a different body → IDEMPOTENCY_CONFLICT.
 * A request still in flight → IDEMPOTENCY_CONFLICT (retry later). 5xx responses
 * release the key so the client can retry. Keys expire after 24h (TTL index).
 * The header is optional; without it the request runs normally.
 */
function idempotency() {
  return async (req, res, next) => {
    const key = req.get('idempotency-key');
    if (!key) return next();
    if (!KEY_RE.test(key)) {
      throw new AppError('VALIDATION_ERROR', 'Idempotency-Key must be 8-128 chars of [A-Za-z0-9_-] (a UUID is recommended)');
    }

    const userId = req.user.id;
    const route = `${req.method} ${req.baseUrl}${req.path}`;
    const requestHash = crypto.createHash('sha256').update(stableStringify(req.body ?? {})).digest('hex');
    const scope = { key, userId, route };

    let record;
    try {
      record = await IdempotencyKey.create({ ...scope, requestHash, state: 'in_progress' });
    } catch (err) {
      if (!isDuplicateKeyError(err)) throw err;
      const existing = await IdempotencyKey.findOne(scope).lean();
      if (!existing) return next(new AppError('IDEMPOTENCY_CONFLICT', 'Please retry the request'));
      if (existing.requestHash !== requestHash) {
        throw new AppError('IDEMPOTENCY_CONFLICT', 'Idempotency-Key was already used with a different request body');
      }
      if (existing.state === 'completed') {
        res.set('Idempotent-Replayed', 'true');
        return res.status(existing.statusCode).json(existing.body);
      }
      // In flight. Take over only if the original holder evidently died.
      const takeover =
        Date.now() - new Date(existing.createdAt).getTime() > STALE_LOCK_MS &&
        (await IdempotencyKey.findOneAndUpdate(
          { _id: existing._id, state: 'in_progress', createdAt: existing.createdAt },
          { $set: { createdAt: new Date() } },
          { new: true },
        ).lean());
      if (!takeover) {
        throw new AppError('IDEMPOTENCY_CONFLICT', 'A request with this Idempotency-Key is still being processed', {
          details: { inProgress: true },
        });
      }
      record = takeover;
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const statusCode = res.statusCode;
      const persist =
        statusCode < 500
          ? IdempotencyKey.updateOne({ _id: record._id }, { $set: { state: 'completed', statusCode, body } })
          : IdempotencyKey.deleteOne({ _id: record._id });
      // Persist before sending so an immediate retry sees the stored response.
      persist
        .catch((err) => logger.error({ err }, 'failed to persist idempotency record'))
        .finally(() => originalJson(body));
      return res;
    };
    next();
  };
}

module.exports = { idempotency, stableStringify };
