const express = require('express');
const multer = require('multer');
const { param, body } = require('express-validator');
const { uploadSubmission } = require('../controllers/submissionController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Local-disk storage for the reference implementation only. See the
// comment in submissionController.js -- production should use pre-signed
// direct-to-S3/Cloudinary uploads instead of routing media through the API
// server.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.MEDIA_UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_SIZE_MB) || 200) * 1024 * 1024 },
});

router.post(
  '/:id/submissions',
  requireAuth,
  upload.single('file'),
  validate([
    param('id').isString().trim().notEmpty(),
    body('mediaUrl').optional().isString(),
    body('mediaType').optional().isIn(['video', 'image']),
  ]),
  uploadSubmission
);

router.post(
  '/:id/submission',
  requireAuth,
  upload.single('file'),
  validate([
    param('id').isString().trim().notEmpty(),
    body('mediaUrl').optional().isString(),
    body('mediaType').optional().isIn(['video', 'image']),
  ]),
  uploadSubmission
);

module.exports = router;
