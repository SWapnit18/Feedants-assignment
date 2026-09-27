const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { login } = require('../controllers/authController');
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

module.exports = router;
