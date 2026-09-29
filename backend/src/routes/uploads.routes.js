'use strict';

const { Router } = require('express');
const multer = require('multer');
const ctrl = require('../controllers/upload.controller');
const { requireAuth } = require('../middleware/auth');
const { mutationLimiter } = require('../middleware/rateLimit');
const { AppError } = require('../utils/AppError');
const config = require('../config');

// Memory storage for serverless and database streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxBytes || 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/^(video|image)\//.test(file.mimetype)) return cb(null, true);
    cb(new AppError('VALIDATION_ERROR', 'Only video/* or image/* files are allowed'));
  },
});

const router = Router();
router.post('/', requireAuth, mutationLimiter, upload.single('file'), ctrl.upload);
router.get('/:id', ctrl.getMedia);

module.exports = router;
