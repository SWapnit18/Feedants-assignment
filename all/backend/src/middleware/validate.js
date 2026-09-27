'use strict';

const { z } = require('zod');

/**
 * Validate and coerce request parts with zod. Parsed values are exposed on
 * `req.valid.{params,query,body}` (Express 5 makes req.query read-only).
 * @param {{ params?: z.ZodTypeAny, query?: z.ZodTypeAny, body?: z.ZodTypeAny }} schemas
 */
function validate(schemas) {
  return (req, _res, next) => {
    req.valid = req.valid || {};
    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;
      // ZodError is mapped to VALIDATION_ERROR by the error handler.
      req.valid[part] = schemas[part].parse(req[part] ?? {});
    }
    next();
  };
}

const lang = z.enum(['en', 'hi']).default('en');
const idOrSlug = z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9-]+$/, 'Invalid competition id');
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

module.exports = { validate, schemas: { lang, idOrSlug, objectId } };
