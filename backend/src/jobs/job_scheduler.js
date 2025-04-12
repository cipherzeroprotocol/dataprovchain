/**
 * Job scheduler
 */
const { scheduleJob, cancelJob } = require('node-schedule');
const dealMonitor = require('./deal_monitor');
const royaltyProcessor = require('./royalty_processor');
const logger = require('../utils/logger');

// Map to store job references
const jobMap = new Map();

/**
 * Initialize background jobs
 */
const initializeJobs = async () => {
  try {
    // Schedule deal monitoring job to run every 30 minutes
    const dealMonitorJob = scheduleJob('dealMonitor', '*/30 * * * *', async () => {
      try {
        await dealMonitor.checkDeals();
      } catch (error) {
        logger.error('Deal monitor job failed', { error: error.message });
      }
    });
    jobMap.set('dealMonitor', dealMonitorJob);
    logger.info('Deal monitor job scheduled');
    
    // Schedule royalty processing job to run daily at midnight
    const royaltyProcessorJob = scheduleJob('royaltyProcessor', '0 0 * * *', async () => {
      try {
        await royaltyProcessor.processRoyalties();
      } catch (error) {
        logger.error('Royalty processor job failed', { error: error.message });
      }
    });
    jobMap.set('royaltyProcessor', royaltyProcessorJob);
    logger.info('Royalty processor job scheduled');
    
    // Run the deal monitor immediately for initial check
    await dealMonitor.checkDeals();
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize jobs', { error: error.message });
    throw error;
  }
};

/**
 * Stop all scheduled jobs
 */
const stopJobs = async () => {
  try {
    for (const [name, job] of jobMap.entries()) {
      cancelJob(job);
      logger.info(`Job ${name} stopped`);
    }
    
    jobMap.clear();
    return true;
  } catch (error) {
    logger.error('Failed to stop jobs', { error: error.message });
    throw error;
  }
};

/**
 * Run a specific job immediately
 * @param {string} jobName - Name of the job to run
 */
const runJobNow = async (jobName) => {
  try {
    switch (jobName) {
      case 'dealMonitor':
        await dealMonitor.checkDeals();
        break;
      case 'royaltyProcessor':
        await royaltyProcessor.processRoyalties();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
    
    logger.info(`Job ${jobName} run manually`);
    return true;
  } catch (error) {
    logger.error(`Failed to run job ${jobName}`, { error: error.message });
    throw error;
  }
};

module.exports = {
  initializeJobs,
  stopJobs,
  runJobNow
};