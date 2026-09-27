'use strict';

const { Schema, model } = require('mongoose');
const { localized } = require('./localized');

const testimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    avatarUrl: String,
    text: localized(),
    rating: { type: Number, min: 1, max: 5, required: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

testimonialSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = model('Testimonial', testimonialSchema);
