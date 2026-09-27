'use strict';

const { ZodError } = require('zod');
const mongoose = require('mongoose');
const multer = require('multer');
const { AppError } = require('../utils/AppError');

function notFound(req, _res, next) {
  next(new AppError('NOT_FOUND', `Route ${req.method} ${req.path} not found`));
}

/** Normalise any thrown error into the contract's error envelope. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let appErr;
  if (err instanceof AppError) appErr = err;
  else if (err instanceof ZodError) {
    appErr = new AppError('VALIDATION_ERROR', 'Invalid request', {
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  } else if (err instanceof multer.MulterError) {
    appErr = new AppError('VALIDATION_ERROR', err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message, {
      status: err.code === 'LIMIT_FILE_SIZE' ? 413 : 400,
    });
  } else if (err?.type === 'entity.parse.failed') {
    appErr = new AppError('VALIDATION_ERROR', 'Malformed JSON body');
  } else if (err?.type === 'entity.too.large') {
    appErr = new AppError('VALIDATION_ERROR', 'Request body too large', { status: 413 });
  } else if (err instanceof mongoose.Error.ValidationError) {
    appErr = new AppError('VALIDATION_ERROR', err.message);
  } else if (err instanceof mongoose.Error.CastError || err?.status === 404 || err?.statusCode === 404) {
    appErr = new AppError('NOT_FOUND', 'Resource not found');
  } else {
    appErr = new AppError('INTERNAL', 'Something went wrong');
  }

  if (appErr.status >= 500) (req.log || console).error({ err }, 'unhandled error');
  else if (req.log) req.log.debug({ code: appErr.code }, appErr.message);

  if (res.headersSent) return;
  res.status(appErr.status).json(appErr.toJSON());
}

module.exports = { errorHandler, notFound };
