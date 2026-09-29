const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubmissionSchema = new Schema(
  {
    competition: { type: Schema.Types.ObjectId, ref: 'Competition' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    registration: { type: Schema.Types.ObjectId, ref: 'Registration' },
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration' },

    mediaUrl: { type: String, required: true },
    videoUrl: { type: String },
    videoFileName: { type: String },
    fileName: { type: String },
    mediaType: { type: String, enum: ['video', 'image'], default: 'video' },

    title: { type: String, trim: true },
    description: { type: String, trim: true },
    caption: { type: String, trim: true },
    fileSize: { type: String },
    submittedAt: { type: Date, default: Date.now },

    // A participant may re-upload while the submission window is open;
    // we keep every version for audit but `isLatest` marks the active one
    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ['received', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'received',
    },
    judgeScore: { type: Number, min: 0, max: 100 },
    judgeRemarks: { type: String },
  },
  { timestamps: true }
);

SubmissionSchema.pre('save', function(next) {
  if (!this.competition && this.competitionId) this.competition = this.competitionId;
  if (!this.user && this.userId) this.user = this.userId;
  if (!this.registration && this.registrationId) this.registration = this.registrationId;
  if (!this.competitionId && this.competition) this.competitionId = this.competition;
  if (!this.userId && this.user) this.userId = this.user;
  if (!this.registrationId && this.registration) this.registrationId = this.registration;
  if (this.mediaUrl && !this.videoUrl) {
    this.videoUrl = this.mediaUrl;
  } else if (this.videoUrl && !this.mediaUrl) {
    this.mediaUrl = this.videoUrl;
  }
  if (this.videoFileName && !this.fileName) {
    this.fileName = this.videoFileName;
  } else if (this.fileName && !this.videoFileName) {
    this.videoFileName = this.fileName;
  }
  if (!this.submittedAt) {
    this.submittedAt = this.createdAt || new Date();
  }
  next();
});

SubmissionSchema.set('toJSON', { virtuals: true });
SubmissionSchema.set('toObject', { virtuals: true });

SubmissionSchema.index({ competition: 1, user: 1, isLatest: 1 });
SubmissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
