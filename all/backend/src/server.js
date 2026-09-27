'use strict';

const config = require('./config');
const logger = require('./config/logger');
const { connectDatabase, disconnectDatabase } = require('./config/db');
const { createApp } = require('./app');
const { startHoldSweeper } = require('./jobs/holdSweeper');

async function main() {
  const { inMemory } = await connectDatabase();
  if (inMemory || config.seedOnStart) {
    const { seedDatabase } = require('./seed');
    const summary = await seedDatabase();
    logger.info(summary, 'database seeded');
  }

  const app = createApp();
  const server = app.listen(config.port, config.host, () => {
    logger.info(`API listening on http://${config.host}:${config.port}/api/v1 (env=${config.env}, payments=${config.payment.mode})`);
  });
  server.keepAliveTimeout = 65_000;
  const sweeper = startHoldSweeper();

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'shutting down');
    sweeper.stop();
    const force = setTimeout(() => process.exit(1), 10_000);
    force.unref();
    server.close(async () => {
      try {
        await disconnectDatabase();
      } finally {
        process.exit(0);
      }
    });
    server.closeIdleConnections?.();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.fatal({ err }, 'failed to start');
  process.exit(1);
});
