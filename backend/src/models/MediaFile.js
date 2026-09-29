'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const MediaFileSchema = new Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, default: 'video/mp4' },
    data: { type: Buffer, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.MediaFile || mongoose.model('MediaFile', MediaFileSchema);
