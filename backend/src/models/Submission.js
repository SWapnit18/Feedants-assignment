const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubmissionSchema = new Schema(
  {
    competition: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registration: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },

    mediaUrl: { type: String, required: true },
    videoUrl: { type: String },
    mediaType: { type: String, enum: ['video', 'image'], default: 'video' },

    title: { type: String, trim: true },
    description: { type: String, trim: true },
    fileName: { type: String },
    fileSize: { type: String },
    submittedAt: { type: Date, default: Date.now },

    // A participant may re-upload while the submission window is open;
    // we keep every version for audit but `isLatest` marks the active one
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

SubmissionSchema.virtual('userId').get(function() {
  return this.user;
});

SubmissionSchema.virtual('competitionId').get(function() {
  return this.competition;
});

SubmissionSchema.pre('save', function(next) {
  if (this.mediaUrl && !this.videoUrl) {
    this.videoUrl = this.mediaUrl;
  } else if (this.videoUrl && !this.mediaUrl) {
    this.mediaUrl = this.videoUrl;
  }
  if (!this.submittedAt) {
    this.submittedAt = this.createdAt || new Date();
  }
  next();
});

SubmissionSchema.set('toJSON', { virtuals: true });
SubmissionSchema.set('toObject', { virtuals: true });

SubmissionSchema.index({ competition: 1, user: 1, isLatest: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);
