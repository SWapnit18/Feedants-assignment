'use strict';

const mongoose = require('mongoose');

/**
 * Run `fn` inside a MongoDB multi-document transaction. The driver's
 * withTransaction retries the whole callback on TransientTransactionError
 * (e.g. WriteConflict under contention) and retries commit on
 * UnknownTransactionCommitResult, so `fn` must be side-effect free outside
 * the database (it may run more than once).
 * @template T
 * @param {(session: import('mongoose').ClientSession) => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function runInTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(
      async () => {
        result = await fn(session);
      },
      {
        readPreference: 'primary',
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      },
    );
    return /** @type {T} */ (result);
  } finally {
    await session.endSession();
  }
}

const isDuplicateKeyError = (err) => err && (err.code === 11000 || err.code === 11001);

module.exports = { runInTransaction, isDuplicateKeyError };
