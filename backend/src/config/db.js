const mongoose = require('mongoose');
const dns = require('dns');
const config = require('./index');

// Fix for Windows / serverless DNS resolution for MongoDB Atlas SRV (_mongodb._tcp) records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore fallback if custom server not available
}

let cachedPromise = null;

/**
 * Establish or reuse cached MongoDB connection (optimized for both long-running and serverless Vercel runtimes).
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let uri = config.mongoUri || process.env.MONGO_URI;

  // Fallback to in-memory MongoDB when no URI is set or USE_MEMORY_DB is enabled
  if (!uri || process.env.USE_MEMORY_DB === 'true') {
    try {
      const { MongoMemoryReplSet } = require('mongodb-memory-server');
      const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
      uri = replSet.getUri();
      console.log('[db] using in-memory MongoDB (mongodb-memory-server)');
    } catch (e) {
      throw new Error('MONGODB_URI or MONGO_URI is not defined and mongodb-memory-server is not available');
    }
  }

  if (!cachedPromise) {
    mongoose.set('strictQuery', true);
    cachedPromise = mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    }).then((conn) => {
      console.log(`[db] connected -> ${conn.connection.name}`);
      return conn;
    }).catch((err) => {
      cachedPromise = null;
      console.error('[db] connection error', err);
      throw err;
    });
  }

  await cachedPromise;
  return mongoose.connection;
}

async function ensureIndexes() {
  const models = require('../models');
  await Promise.all(Object.values(models).map((model) => model.syncIndexes()));
}

module.exports = connectDB;
module.exports.ensureIndexes = ensureIndexes;
