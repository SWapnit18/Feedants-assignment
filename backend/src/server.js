require('express-async-errors');

const connectDB = require('./config/db');
const config = require('./config');
const { createApp } = require('./app');

const app = createApp();

async function start() {
  await connectDB();
  await connectDB.ensureIndexes();
  if (config.seedOnStart) {
    const { seedDatabase } = require('./seed/seed');
    await seedDatabase();
    console.log('[server] seed data inserted');
  }
  app.listen(config.port, config.host, () => console.log(`[server] listening on ${config.host}:${config.port}`));
}

if (!process.env.VERCEL) {
  start().catch((err) => {
    console.error('[server] failed to start', err);
    process.exit(1);
  });
}

module.exports = app;
