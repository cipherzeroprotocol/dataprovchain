/**
 * Server entry point
 */
const http = require('http');
const app = require('./app');
const config = require('./config/app');
const logger = require('./utils/logger');
const DB = require('./models');
const jobScheduler = require('./jobs/job_scheduler');

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(config.port, async () => {
  logger.info(`Server running on port ${config.port}`);
  
  // Sync database models (in production, use migrations instead)
  if (config.env === 'development') {
    try {
      await DB.sequelize.sync();
      logger.info('Database synchronized');
    } catch (error) {
      logger.error('Failed to synchronize database', { error: error.message });
    }
  }
  
  // Start background jobs
  try {
    await jobScheduler.initializeJobs();
    logger.info('Background jobs initialized');
  } catch (error) {
    logger.error('Failed to initialize background jobs', { error: error.message });
  }
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  // In production, you might want to restart the process using a process manager
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { 
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Stop background jobs
  try {
    await jobScheduler.stopJobs();
    logger.info('Background jobs stopped');
  } catch (error) {
    logger.error('Error stopping background jobs', { error: error.message });
  }
  
  // Close database connection
  try {
    await DB.sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection', { error: error.message });
  }
  
  // Exit process
  process.exit(0);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;