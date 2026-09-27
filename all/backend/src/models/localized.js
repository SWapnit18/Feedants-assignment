'use strict';

const { Schema } = require('mongoose');

/** `{ en, hi }` localized string sub-schema (en required, hi optional → falls back to en). */
const localized = (required = true) =>
  new Schema(
    {
      en: { type: String, required, trim: true },
      hi: { type: String, trim: true },
    },
    { _id: false },
  );

module.exports = { localized };
