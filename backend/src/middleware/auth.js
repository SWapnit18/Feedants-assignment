const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { AppError } = require('../utils/AppError');

function decodeToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Required auth: rejects the request if no valid token is present.
 * Used for write actions (register, submit).
 */
function requireAuth(req, res, next) {
  const payload = decodeToken(req);
  if (!payload) throw new AppError('UNAUTHENTICATED', 'Authentication required');
  req.userId = payload.sub;
  req.user = { id: payload.sub };
  next();
}

/**
 * Optional auth: attaches req.userId if a valid token is present, but does
 * not reject the request otherwise. Used for GET /competitions/:id so the
 * screen still renders (without personalised state) for logged-out users.
 */
function optionalAuth(req, res, next) {
  const payload = decodeToken(req);
  if (payload) {
    req.userId = payload.sub;
    req.user = { id: payload.sub };
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
