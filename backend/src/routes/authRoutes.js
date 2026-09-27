const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { login, getMe, updateMe } = require('../controllers/authController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

router.post(
  '/login',
  authLimiter,
  validate([body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 6 })]),
  login
);

router.get('/me', optionalAuth, getMe);
router.put('/me', optionalAuth, updateMe);
router.patch('/me', optionalAuth, updateMe);

module.exports = router;
