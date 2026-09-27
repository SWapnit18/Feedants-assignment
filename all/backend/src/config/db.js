'use strict';

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

let memoryReplSet = null;

/**
 * Connects to MongoDB. When MONGODB_URI is unset (dev convenience) an
 * in-memory single-node replica set is started so multi-document
 * transactions work without installing MongoDB.
 * @returns {Promise<{ uri: string, inMemory: boolean }>}
 */
async function connectDatabase() {
  let uri = config.mongoUri;
  let inMemory = false;
  if (!uri) {
    if (config.isProd) throw new Error('MONGODB_URI is required in production');
    const { MongoMemoryReplSet } = require('mongodb-memory-server');
    memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
    uri = memoryReplSet.getUri('feedants');
    inMemory = true;
    logger.warn({ uri }, 'MONGODB_URI not set: started in-memory MongoDB replica set (data is lost on exit)');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { maxPoolSize: 50, serverSelectionTimeoutMS: 10_000 });
  await ensureIndexes();
  logger.info({ inMemory }, 'MongoDB connected');
  return { uri, inMemory };
}

/** Create collections + indexes up front (transactions cannot build indexes). */
async function ensureIndexes() {
  require('../models');
  for (const model of Object.values(mongoose.models)) {
    await model.createCollection();
    await model.syncIndexes();
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryReplSet) {
    await memoryReplSet.stop();
    memoryReplSet = null;
  }
}

module.exports = { connectDatabase, disconnectDatabase, ensureIndexes };
