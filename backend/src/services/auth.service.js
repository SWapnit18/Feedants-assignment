'use strict';

const jwt = require('jsonwebtoken');
const { User, Submission, Registration } = require('../models');
const { AppError } = require('../utils/AppError');
const { randomId, isObjectId } = require('../utils/ids');
const { isDuplicateKeyError } = require('../utils/transaction');
const config = require('../config');

const serializeUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarUrl || u.profileImage || u.photoUrl || null,
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

/** Sign in with email and password */
async function signIn(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash').lean();
  if (!user) {
    throw new AppError('UNAUTHENTICATED', 'Invalid email or password. Please check your credentials.');
  }

  if (user.passwordHash) {
    const isMatch = await User.comparePassword?.(password, user.passwordHash) || (await require('bcryptjs').compare(password, user.passwordHash));
    if (!isMatch) {
      throw new AppError('UNAUTHENTICATED', 'Invalid email or password. Please check your credentials.');
    }
  }

  const { email: _e, ...publicUser } = serializeUser(user);
  return { token: signToken(user), user: publicUser, data: { token: signToken(user), user: publicUser } };
}

/** Sign up with name, email, and minimum 8-char password */
async function signUp(name, email, password) {
  const trimmedName = String(name || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!trimmedName) throw new AppError('VALIDATION_ERROR', 'Full name is required');
  if (!normalizedEmail || !normalizedEmail.includes('@')) throw new AppError('VALIDATION_ERROR', 'Valid email is required');
  if (!password || password.length < 8) throw new AppError('VALIDATION_ERROR', 'Password must be at least 8 characters long');

  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    throw new AppError('CONFLICT', 'An account with this email address already exists. Please sign in.');
  }

  const passwordHash = await require('bcryptjs').hash(password, 10);
  const newUser = await User.create({
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
    referralCode: randomId(8).toLowerCase(),
  });

  const { email: _e, ...publicUser } = serializeUser(newUser.toObject());
  return { token: signToken(newUser), user: publicUser, data: { token: signToken(newUser), user: publicUser } };
}

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

  const rawSubmissions = await Submission.find({
    $or: [{ userId: user._id }, { user: user._id }],
  })
    .populate('competitionId', 'title category slug')
    .populate('competition', 'title category slug')
    .sort({ createdAt: -1 })
    .lean();

  const userSubmissions = (rawSubmissions || []).map((s) => {
    const comp = s.competitionId || s.competition || {};
    const compTitle =
      typeof comp.title === 'string'
        ? comp.title
        : comp.title?.en || s.title || 'Feedants Dance Competition';
    return {
      id: String(s._id),
      competitionId: comp._id ? String(comp._id) : undefined,
      competitionSlug: comp.slug || 'feedants-classical-dance',
      competitionTitle: compTitle,
      competitionCategory: comp.category || 'Dance Competition',
      status: s.status || 'Submitted',
      mediaUrl: s.mediaUrl || s.videoUrl,
      videoUrl: s.mediaUrl || s.videoUrl,
      fileName: s.fileName || 'performance_video.mp4',
      fileSize: s.fileSize || '34.8 MB',
      submittedAt: s.submittedAt
        ? new Date(s.submittedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Today',
    };
  });

  const registeredCount = await Registration.countDocuments({
    $or: [{ userId: user._id }, { user: user._id }],
    status: { $in: ['confirmed', 'active'] },
  });

  return {
    user: {
      ...serializeUser(user),
      submissions: userSubmissions,
      registeredCount,
    },
  };
}

async function updateUser(userId, changes) {
  const update = {};
  if (changes.name !== undefined) update.name = changes.name.trim();
  if (changes.profileImage !== undefined) update.profileImage = changes.profileImage || null;
  const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true }).lean();
  if (!user) throw new AppError('UNAUTHENTICATED', 'User no longer exists');
  return { user: serializeUser(user) };
}

module.exports = { devLogin, signIn, signUp, listUsers, getUser, updateUser, signToken, verifyToken };
