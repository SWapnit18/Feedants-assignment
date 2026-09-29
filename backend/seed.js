/**
 * =========================================================================
 * FEEDANTS COMPETITION SYSTEM - ROOT SEED SCRIPT (Requirement #21)
 * =========================================================================
 * Usage: node seed.js or npm run seed
 */
const { seedDatabase } = require('./src/seed/seed.js');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db.js');

async function run() {
  await connectDB();
  await seedDatabase();
  console.log('[seed] Development data inserted.');
  await mongoose.connection.close();
}

run().catch((error) => {
  console.error('[seed] failed', error);
  process.exitCode = 1;
});
