const { validationResult } = require('express-validator');
const { z } = require('zod');
const ApiError = require('../utils/ApiError');
const { AppError } = require('../utils/AppError');

/**
 * Takes an array of express-validator chains, runs them, and turns any
 * failure into a single consistent 400 ApiError instead of scattering
 * validation logic through every controller.
 */
function validate(validations) {
  if (!Array.isArray(validations)) return validateZod(validations);
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    throw new ApiError(
      400,
      'Validation failed',
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  };
}

module.exports = validate;
module.exports.validate = validateZod;
module.exports.schemas = {
  idOrSlug: z.string().trim().min(1).max(128),
  objectId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId'),
  lang: z.enum(['en', 'hi']).default('en'),
};

function validateZod({ body, query, params } = {}) {
  return (req, _res, next) => {
    try {
      const valid = {};
      if (body) valid.body = body.parse(req.body);
      if (query) valid.query = query.parse(req.query);
      if (params) valid.params = params.parse(req.params);
      req.valid = valid;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return next(new AppError('VALIDATION_ERROR', 'Request validation failed', { details: err.issues }));
      }
      return next(err);
    }
  };
}
