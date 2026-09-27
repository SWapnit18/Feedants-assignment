'use strict';

const { Router } = require('express');
const mongoose = require('mongoose');
const { authRouter, meRouter } = require('./auth.routes');

const api = Router();

api.get('/health', (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', db: dbUp, serverTime: new Date().toISOString() });
});

api.use('/auth', authRouter);
api.use('/me', meRouter);
api.use('/competitions', require('./competitions.routes'));
api.use('/registrations', require('./registrations.routes'));
api.use('/payments', require('./payments.routes'));
api.use('/uploads', require('./uploads.routes'));

module.exports = api;
