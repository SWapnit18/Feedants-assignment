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

router.get('/', validate({ query: z.object({ lang: schemas.lang }) }), ctrl.list);
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
      mediaUrl: z.string().trim().min(1).max(5000000).optional(),
      videoUrl: z.string().trim().min(1).max(5000000).optional(),
      videoFileName: z.string().trim().max(255).optional(),
      fileName: z.string().trim().max(255).optional(),
      fileSize: z.string().trim().max(50).optional(),
      title: z.string().trim().max(255).optional(),
      description: z.string().trim().max(1000).optional(),
      caption: z.string().trim().max(500).optional(),
    }).refine((b) => b.mediaUrl || b.videoUrl, 'mediaUrl or videoUrl is required'),
  }),
  ctrl.createSubmission,
);

router.get('/:idOrSlug/submissions/me', requireAuth, validate({ params }), ctrl.getMySubmission);
router.get('/:idOrSlug/submission', requireAuth, validate({ params }), ctrl.getMySubmission);
router.get('/:idOrSlug/submissions', requireAuth, validate({ params }), ctrl.getMySubmission);

module.exports = router;
