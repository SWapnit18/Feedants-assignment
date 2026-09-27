const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Takes an array of express-validator chains, runs them, and turns any
 * failure into a single consistent 400 ApiError instead of scattering
 * validation logic through every controller.
 */
function validate(validations) {
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
