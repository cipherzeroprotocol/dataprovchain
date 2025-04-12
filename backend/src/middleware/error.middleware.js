/**
 * Error handling middleware
 */
const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error('Error caught by global error handler', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  
  // Determine status code
  let statusCode = err.statusCode || 500;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
  }
  
  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || 
      err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    return res.status(statusCode).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  // Hide sensitive error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  const responseError = {
    status: 'error',
    message: isProduction && statusCode === 500 
      ? 'Internal Server Error' 
      : err.message || 'Something went wrong'
  };
  
  // Add error details in non-production environment
  if (!isProduction && err.stack) {
    responseError.stack = err.stack;
  }
  
  return res.status(statusCode).json(responseError);
};

module.exports = errorMiddleware;