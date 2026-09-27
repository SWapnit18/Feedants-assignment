'use strict';

const crypto = require('node:crypto');
const mongoose = require('mongoose');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Cryptographically random base62 string. */
function randomId(length = 14) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

const isObjectId = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v) && mongoose.isValidObjectId(v);

module.exports = { randomId, isObjectId };
