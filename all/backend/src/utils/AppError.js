'use strict';

/** Canonical error codes → HTTP status (see docs/API_CONTRACT.md). */
const ERROR_STATUS = Object.freeze({
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ALREADY_REGISTERED: 409,
  COMPETITION_FULL: 409,
  REGISTRATION_CLOSED: 409,
  REGISTRATION_NOT_OPEN: 409,
  SUBMISSION_WINDOW_CLOSED: 409,
  NOT_REGISTERED: 403,
  ALREADY_SUBMITTED: 409,
  HOLD_EXPIRED: 410,
  PAYMENT_VERIFICATION_FAILED: 400,
  IDEMPOTENCY_CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
});

class AppError extends Error {
  /**
   * @param {keyof typeof ERROR_STATUS} code
   * @param {string} message
   * @param {{ status?: number, details?: unknown }} [opts]
   */
  constructor(code, message, opts = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = opts.status ?? ERROR_STATUS[code] ?? 500;
    this.details = opts.details;
  }

  toJSON() {
    const error = { code: this.code, message: this.message };
    if (this.details !== undefined) error.details = this.details;
    return { error };
  }
}

module.exports = { AppError, ERROR_STATUS };
