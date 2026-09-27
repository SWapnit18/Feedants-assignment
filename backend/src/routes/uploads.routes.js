'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Router } = require('express');
const multer = require('multer');
const ctrl = require('../controllers/upload.controller');
const { requireAuth } = require('../middleware/auth');
const { mutationLimiter } = require('../middleware/rateLimit');
const { AppError } = require('../utils/AppError');
const config = require('../config');

fs.mkdirSync(config.upload.dir, { recursive: true });

const SAFE_EXT = /^\.[a-z0-9]{1,8}$/i;

// Dev: local disk. Prod: swap for S3 presigned PUT URLs so bytes never pass through the API.
const upload = multer({
  storage: multer.diskStorage({
    destination: config.upload.dir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      cb(null, `${crypto.randomUUID()}${SAFE_EXT.test(ext) ? ext.toLowerCase() : ''}`);
    },
  }),
  limits: { fileSize: config.upload.maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/^(video|image)\//.test(file.mimetype)) return cb(null, true);
    cb(new AppError('VALIDATION_ERROR', 'Only video/* or image/* files are allowed'));
  },
});

const router = Router();
router.post('/', requireAuth, mutationLimiter, upload.single('file'), ctrl.upload);

module.exports = router;
