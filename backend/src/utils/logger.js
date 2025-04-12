/**
 * Logger utility
 */
const winston = require('winston');
const appConfig = require('../config/app');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Create format for logging
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports to use based on environment
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  
  // File transport for all logs
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger
const logger = winston.createLogger({
  level: appConfig.logLevel,
  levels,
  format,
  transports,
});

// Export a logger function that includes metadata
module.exports = {
  error: (message, metadata = {}) => {
    logger.error({ message, ...metadata });
  },
  warn: (message, metadata = {}) => {
    logger.warn({ message, ...metadata });
  },
  info: (message, metadata = {}) => {
    logger.info({ message, ...metadata });
  },
  http: (message, metadata = {}) => {
    logger.http({ message, ...metadata });
  },
  debug: (message, metadata = {}) => {
    logger.debug({ message, ...metadata });
  },
  // Stream for Morgan HTTP logger
  stream: {
    write: (message) => {
      logger.http(message.trim());
    },
  },
};