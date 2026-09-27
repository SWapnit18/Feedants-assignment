const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const { Schema } = mongoose;

/**
 * Minimal user model. In a real Feedants system, auth/identity is likely
 * its own service -- this is a self-contained stand-in so the competition
 * feature can be run and tested end to end without an external dependency.
 */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    photoUrl: { type: String },
    referralCode: { type: String, unique: true, default: () => nanoid(8) },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model('User', UserSchema);
