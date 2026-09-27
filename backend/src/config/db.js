const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows DNS resolution for MongoDB Atlas SRV (_mongodb._tcp) records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore fallback if custom server not available
}

/**
 * Establish the MongoDB connection.
 * We keep pool size sane for a multi-instance deployment behind a load
 * balancer -- each Node process gets its own pool, so don't set this too
 * high or you'll exhaust MongoDB's connection limit under horizontal scale.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in the environment');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`[db] connected -> ${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });
}

module.exports = connectDB;
