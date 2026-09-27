const express = require('express');
const { param, body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { registerForCompetition } = require('../controllers/registrationController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Registration is the hottest write path (thundering herd right when a
// popular competition opens or right before it closes), so it gets its own
// tighter, dedicated rate limit on top of the global one in server.js.
const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Please slow down.' },
});

router.post(
  '/:id/register',
  registerLimiter,
  requireAuth,
  validate([
    param('id').isMongoId(),
    body('paymentId').optional().isString(),
    body('referralCode').optional().isString(),
  ]),
  registerForCompetition
);

module.exports = router;
