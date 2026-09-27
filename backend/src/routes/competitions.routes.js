'use strict';

const { Router } = require('express');
const { z } = require('zod');
const ctrl = require('../controllers/competition.controller');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { idempotency } = require('../middleware/idempotency');
const { mutationLimiter } = require('../middleware/rateLimit');

const router = Router();
const params = z.object({ idOrSlug: schemas.idOrSlug });

router.get('/:idOrSlug', optionalAuth, validate({ params, query: z.object({ lang: schemas.lang }) }), ctrl.getDetails);

router.get('/:idOrSlug/availability', validate({ params }), ctrl.getAvailability);

router.get(
  '/:idOrSlug/testimonials',
  validate({
    params,
    query: z.object({ lang: schemas.lang, limit: z.coerce.number().int().min(1).max(50).default(10) }),
  }),
  ctrl.getTestimonials,
);

router.post('/:idOrSlug/registrations', requireAuth, mutationLimiter, idempotency(), validate({ params }), ctrl.register);

router.post(
  '/:idOrSlug/submissions',
  requireAuth,
  mutationLimiter,
  idempotency(),
  validate({
    params,
    body: z.object({
      mediaUrl: z
        .string()
        .trim()
        .url()
        .max(2048)
        .refine((u) => /^https?:\/\//i.test(u), 'mediaUrl must be http(s)'),
      caption: z.string().trim().max(500).optional(),
    }),
  }),
  ctrl.createSubmission,
);

router.get('/:idOrSlug/submissions/me', requireAuth, validate({ params }), ctrl.getMySubmission);

module.exports = router;
