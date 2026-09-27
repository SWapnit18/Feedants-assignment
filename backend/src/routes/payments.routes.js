'use strict';

const { Router } = require('express');
const { z } = require('zod');
const ctrl = require('../controllers/registration.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const config = require('../config');

const router = Router();

// Mock checkout exists only in PAYMENT_MODE=mock (404 otherwise).
if (config.payment.mode === 'mock') {
  router.post(
    '/mock/checkout',
    requireAuth,
    validate({ body: z.object({ orderId: z.string().min(1).max(64) }) }),
    ctrl.mockCheckout,
  );
}

module.exports = router;
