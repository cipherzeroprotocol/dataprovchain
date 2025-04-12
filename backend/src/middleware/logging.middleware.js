/**
 * Request logging middleware
 */
const logger = require('../utils/logger');

/**
 * Middleware to log request details
 */
const requestLogger = (req, res, next) => {
  // Generate request ID
  const requestId = Math.random().toString(36).substring(2, 15);
  req.requestId = requestId;
  
  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Calculate response time
  const start = Date.now();
  
  // Log response on request completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log level depends on status code
    const level = res.statusCode >= 500 ? 'error' : 
                  res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level]('Request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user ? req.user.id : null
    });
  });
  
  next();
};

module.exports = requestLogger;