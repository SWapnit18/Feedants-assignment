'use strict';

const mongoose = require('mongoose');
const config = require('../config');
const { MediaFile } = require('../models');
const { AppError } = require('../utils/AppError');

async function upload(req, res) {
  if (!req.file) throw new AppError('VALIDATION_ERROR', 'Multipart field "file" is required');

  const media = await MediaFile.create({
    filename: req.file.originalname || 'video.mp4',
    contentType: req.file.mimetype || 'video/mp4',
    data: req.file.buffer,
    size: req.file.size || req.file.buffer.length,
    uploadedBy: req.user?.id || null,
  });

  const base = config.publicBaseUrl || `${req.protocol}://${req.get('host')}`;
  res.status(201).json({
    url: `${base}/api/v1/uploads/${media._id}`,
    mimeType: media.contentType,
    size: media.size,
    id: String(media._id),
  });
}

async function getMedia(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: 'Not found' });
  }

  const media = await MediaFile.findById(id).lean();
  if (!media || !media.data) {
    return res.status(404).json({ error: 'Media not found' });
  }

  const buffer = Buffer.isBuffer(media.data) ? media.data : Buffer.from(media.data);
  const totalSize = buffer.length;
  const contentType = media.contentType || 'video/mp4';

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

    if (start >= totalSize || end >= totalSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${totalSize}`,
      });
      return res.end();
    }

    const chunksize = end - start + 1;
    const chunk = buffer.subarray(start, end + 1);

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    return res.end(chunk);
  }

  res.writeHead(200, {
    'Content-Length': totalSize,
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
  });
  return res.end(buffer);
}

module.exports = { upload, getMedia };
