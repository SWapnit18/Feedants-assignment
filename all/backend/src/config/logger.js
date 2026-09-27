'use strict';

const pino = require('pino');
const config = require('./index');

function prettyTransport() {
  if (config.isProd || config.isTest) return undefined;
  try {
    require.resolve('pino-pretty');
    return { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } };
  } catch {
    return undefined;
  }
}

const logger = pino({
  level: config.logLevel,
  transport: prettyTransport(),
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.razorpay_signature'],
});

module.exports = logger;
