'use strict';

const { Schema, model } = require('mongoose');

const submissionSchema = new Schema(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    mediaUrl: { type: String, required: true },
    caption: { type: String, default: null, maxlength: 500 },
    status: { type: String, enum: ['received', 'rejected', 'shortlisted'], default: 'received' },
  },
  { timestamps: true },
);

submissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

module.exports = model('Submission', submissionSchema);
