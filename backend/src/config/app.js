/**
 * Application configuration
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  apiPrefix: '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES || 60 * 24 * 7, // 7 days
  rateLimitRequests: process.env.RATE_LIMIT_REQUESTS || 100,
  rateLimitWindow: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  logLevel: process.env.LOG_LEVEL || 'info',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../../uploads'),
  tempDir: process.env.TEMP_DIR || path.resolve(__dirname, '../../../temp'),
};

module.exports = config;