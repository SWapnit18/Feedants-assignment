'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Real Winner model for competition results / previous winners.
 * As per Requirement #12:
 * Fields: competitionId, userId, position, prize, videoUrl, year
 */
const WinnerSchema = new Schema(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    position: { type: Number, required: true }, // 1, 2, 3...
    positionLabel: { type: String }, // e.g. "1st Winner"
    prize: { type: String, required: true }, // e.g. "₹ 550"
    videoUrl: { type: String },
    photoUrl: { type: String },
    year: { type: String, required: true }, // e.g. "2024", "2023"
  },
  { timestamps: true }
);

WinnerSchema.index({ competitionId: 1, year: -1, position: 1 });

module.exports = mongoose.model('Winner', WinnerSchema);
