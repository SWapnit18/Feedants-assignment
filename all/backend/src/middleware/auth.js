'use strict';

const { AppError } = require('../utils/AppError');
const { verifyToken } = require('../services/auth.service');

function extractToken(req) {
  const header = req.get('authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (!/^Bearer$/i.test(scheme) || !token) throw new AppError('UNAUTHENTICATED', 'Malformed Authorization header');
  return token;
}

/** Attach `req.user = { id }` if a valid bearer token is present; anonymous otherwise. */
function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  req.user = token ? { id: verifyToken(token).sub } : null;
  next();
}

/** Reject the request unless it carries a valid bearer token. */
function requireAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) throw new AppError('UNAUTHENTICATED', 'Authentication required');
  req.user = { id: verifyToken(token).sub };
  next();
}

module.exports = { optionalAuth, requireAuth };
