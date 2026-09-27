'use strict';

const { Schema, model } = require('mongoose');

const idempotencyKeySchema = new Schema({
  key: { type: String, required: true },
  userId: { type: String, required: true },
  route: { type: String, required: true },
  requestHash: { type: String, required: true },
  state: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  statusCode: Number,
  body: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 }, // TTL 24h
});

idempotencyKeySchema.index({ key: 1, userId: 1, route: 1 }, { unique: true });

module.exports = model('IdempotencyKey', idempotencyKeySchema, 'idempotencykeys');
