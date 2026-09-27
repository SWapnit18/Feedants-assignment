'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const pinoHttp = require('pino-http');
const crypto = require('node:crypto');
const config = require('./config');
const logger = require('./config/logger');
const { globalLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('etag', false); // ETags are set explicitly where they make sense
  app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const id = req.headers['x-request-id'] || crypto.randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
      autoLogging: { ignore: (req) => req.url === '/api/v1/health' },
    }),
  );
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim()),
      exposedHeaders: ['ETag', 'X-Request-Id', 'Idempotent-Replayed', 'RateLimit', 'RateLimit-Policy'],
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));

  app.use('/uploads', express.static(config.upload.dir, { maxAge: '1d', fallthrough: false, index: false }));
  app.use('/api/v1', globalLimiter, apiRoutes);
  app.get('/', (_req, res) => res.json({ name: 'feedants-competition-api', docs: '/api/v1/health' }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
