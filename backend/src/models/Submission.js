const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubmissionSchema = new Schema(
  {
    competition: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registration: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },

    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['video', 'image'], default: 'video' },

    // A participant may re-upload while the submission window is open;
    // we keep every version for audit but `isLatest` marks the active one
    // so judges/queries don't have to reason about history.
    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
    },
    judgeScore: { type: Number, min: 0, max: 100 },
    judgeRemarks: { type: String },
  },
  { timestamps: true }
);

SubmissionSchema.index({ competition: 1, user: 1, isLatest: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);
