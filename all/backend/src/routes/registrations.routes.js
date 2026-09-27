'use strict';

const { Router } = require('express');
const { z } = require('zod');
const ctrl = require('../controllers/registration.controller');
const { requireAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { idempotency } = require('../middleware/idempotency');
const { mutationLimiter } = require('../middleware/rateLimit');

const router = Router();
const params = z.object({ id: schemas.objectId });

router.post(
  '/:id/verify-payment',
  requireAuth,
  mutationLimiter,
  idempotency(),
  validate({
    params,
    body: z.object({
      razorpay_order_id: z.string().min(1).max(64),
      razorpay_payment_id: z.string().min(1).max(64),
      razorpay_signature: z.string().min(1).max(256),
    }),
  }),
  ctrl.verifyPayment,
);

router.delete('/:id', requireAuth, mutationLimiter, validate({ params }), ctrl.cancel);

module.exports = router;
