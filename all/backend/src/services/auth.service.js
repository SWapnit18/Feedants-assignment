'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/AppError');
const { randomId, isObjectId } = require('../utils/ids');
const { isDuplicateKeyError } = require('../utils/transaction');
const config = require('../config');

const serializeUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarUrl || null,
  referralCode: u.referralCode,
});

function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, config.jwt.secret, { expiresIn: config.jwt.expiresIn, algorithm: 'HS256' });
}

/** @returns {{ sub: string }} */
function verifyToken(token) {
  try {
    return /** @type {any} */ (jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }));
  } catch {
    throw new AppError('UNAUTHENTICATED', 'Invalid or expired token');
  }
}

const nameFromEmail = (email) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ') || 'Feedants User';

/** Demo login: find (or create) a user by email and issue a JWT. */
async function devLogin(email) {
  let user = await User.findOne({ email }).lean();
  if (!user) {
    try {
      user = (await User.create({ email, name: nameFromEmail(email), referralCode: randomId(8).toLowerCase() })).toObject();
    } catch (err) {
      if (!isDuplicateKeyError(err)) throw err;
      user = await User.findOne({ email }).lean();
    }
  }
  const { email: _e, ...publicUser } = serializeUser(user);
  return { token: signToken(user), user: publicUser };
}

async function listUsers() {
  const users = await User.find({}, 'name email avatarUrl').sort({ createdAt: 1 }).limit(100).lean();
  return { users: users.map((u) => ({ id: String(u._id), name: u.name, email: u.email, avatarUrl: u.avatarUrl || null })) };
}

async function getUser(userId) {
  const user = isObjectId(userId) ? await User.findById(userId).lean() : null;
  if (!user) throw new AppError('UNAUTHENTICATED', 'User no longer exists');
  return { user: serializeUser(user) };
}

module.exports = { devLogin, listUsers, getUser, signToken, verifyToken };
