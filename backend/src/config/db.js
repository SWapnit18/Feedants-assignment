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
  const uri = config.mongoUri || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI or MONGO_URI is not defined in the environment');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
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
