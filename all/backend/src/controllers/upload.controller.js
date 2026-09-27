'use strict';

const config = require('../config');
const { AppError } = require('../utils/AppError');

async function upload(req, res) {
  if (!req.file) throw new AppError('VALIDATION_ERROR', 'Multipart field "file" is required');
  const base = config.publicBaseUrl || `${req.protocol}://${req.get('host')}`;
  res.status(201).json({
    url: `${base}/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
}

module.exports = { upload };
