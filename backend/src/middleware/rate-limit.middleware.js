/**
 * Rate limiting middleware
 */
const { rateLimit } = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const appConfig = require('../config/app');
const logger = require('../utils/logger');

// Create Redis client if Redis URL is configured
let redisClient;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
    
    redisClient.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected for rate limiting');
    });
  } catch (error) {
    logger.error('Redis connection failed, falling back to memory store', { 
      error: error.message 
    });
    redisClient = null;
  }
}

// Basic rate limiter (15 minutes, 100 requests)
const basicLimiter = rateLimit({
  windowMs: appConfig.rateLimitWindow,
  max: appConfig.rateLimitRequests,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient 
    ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rateLimit:'
      })
    : undefined,
  skip: (req) => req.ip === '127.0.0.1',
  message: {
    status: 'error',
    message: 'Too many requests, please try again later'
  }
});

// More strict API limiter (15 minutes, 30 requests)
const apiLimiter = rateLimit({
  windowMs: appConfig.rateLimitWindow,
  max: 30, // Stricter limit for API endpoints
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient 
    ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rateLimitApi:'
      })
    : undefined,
  skip: (req) => req.ip === '127.0.0.1',
  message: {
    status: 'error',
    message: 'Too many API requests, please try again later'
  }
});

// Auth limiter (15 minutes, 10 requests)
const authLimiter = rateLimit({
  windowMs: appConfig.rateLimitWindow,
  max: 10, // Very strict for auth endpoints to prevent brute force
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient 
    ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rateLimitAuth:'
      })
    : undefined,
  skip: (req) => req.ip === '127.0.0.1',
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later'
  }
});

module.exports = {
  basicLimiter,
  apiLimiter,
  authLimiter
};