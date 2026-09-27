'use strict';

const config = require('../config');
const logger = require('../config/logger');
const { releaseExpiredHolds } = require('../services/registration.service');

/**
 * Periodically releases lapsed seat holds. Safe to run on every instance:
 * each release is a conditional, transactional state transition, so
 * concurrent sweepers can never double-decrement bookedCount.
 */
function startHoldSweeper({ intervalMs = config.holdSweepIntervalMs } = {}) {
  let running = false;
  const tick = async () => {
    if (running) return; // don't overlap slow sweeps
    running = true;
    try {
      const released = await releaseExpiredHolds();
      if (released) logger.info({ released }, 'released expired seat holds');
    } catch (err) {
      logger.error({ err }, 'hold sweep failed');
    } finally {
      running = false;
    }
  };
  const timer = setInterval(tick, intervalMs);
  timer.unref();
  tick();
  return { stop: () => clearInterval(timer), tick };
}

module.exports = { startHoldSweeper };
