/**
 * Filecoin deal monitoring job
 */
const filecoinService = require('../services/filecoin.service');
const DB = require('../models');
const logger = require('../utils/logger');

/**
 * Check status of pending deals
 */
const checkDeals = async () => {
  try {
    logger.info('Starting Filecoin deal status check');
    
    // Get datasets with pending deals
    const pendingDeals = await DB.Dataset.findAll({
      where: {
        dealId: { [DB.Sequelize.Op.ne]: null },
        dealConfirmed: false
      }
    });
    
    logger.info(`Found ${pendingDeals.length} pending deals to check`);
    
    if (pendingDeals.length === 0) {
      return { checked: 0, confirmed: 0 };
    }
    
    let confirmedCount = 0;
    
    // Check each deal
    for (const dataset of pendingDeals) {
      try {
        const dealStatus = await filecoinService.checkDealStatus(dataset.dealId);
        
        logger.debug('Deal status checked', { 
          dealId: dataset.dealId, 
          status: dealStatus.status,
          active: dealStatus.active
        });
        
        // If deal is active, update dataset
        if (dealStatus.active) {
          await dataset.update({ dealConfirmed: true });
          
          // Add a provenance record
          await DB.ProvenanceRecord.create({
            datasetId: dataset.id,
            actionType: 'storage_confirmed',
            performedBy: 'system',
            description: 'Filecoin storage deal confirmed',
            metadata: {
              dealId: dataset.dealId,
              provider: dealStatus.provider || 'unknown'
            }
          });
          
          confirmedCount++;
          logger.info('Deal confirmed', { dealId: dataset.dealId, datasetId: dataset.id });
        } else if (dealStatus.status === 'failed' || dealStatus.status === 'terminated') {
          // If deal has failed, log the issue
          logger.warn('Deal failed or terminated', { 
            dealId: dataset.dealId, 
            datasetId: dataset.id,
            status: dealStatus.status,
            message: dealStatus.message
          });
          
          // Add a provenance record for the failure
          await DB.ProvenanceRecord.create({
            datasetId: dataset.id,
            actionType: 'storage_failed',
            performedBy: 'system',
            description: 'Filecoin storage deal failed',
            metadata: {
              dealId: dataset.dealId,
              status: dealStatus.status,
              message: dealStatus.message
            }
          });
        }
      } catch (error) {
        logger.error('Error checking deal status', { 
          error: error.message, 
          dealId: dataset.dealId,
          datasetId: dataset.id
        });
      }
    }
    
    logger.info(`Deal check completed. Confirmed ${confirmedCount} of ${pendingDeals.length} deals`);
    
    return {
      checked: pendingDeals.length,
      confirmed: confirmedCount
    };
  } catch (error) {
    logger.error('Deal monitoring job failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  checkDeals
};