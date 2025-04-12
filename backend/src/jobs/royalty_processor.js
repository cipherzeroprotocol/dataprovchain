/**
 * Royalty processing job
 */
const DB = require('../models');
const logger = require('../utils/logger');

/**
 * Process royalties for all datasets
 */
const processRoyalties = async () => {
  try {
    logger.info('Starting royalty processing job');
    
    // Get all datasets with usage records
    const datasets = await DB.Dataset.findAll({
      include: [
        {
          model: DB.Usage,
          required: true
        },
        {
          model: DB.Contributor
        }
      ]
    });
    
    logger.info(`Found ${datasets.length} datasets with usage records`);
    
    if (datasets.length === 0) {
      return { processed: 0 };
    }
    
    let processedCount = 0;
    
    // Process each dataset
    for (const dataset of datasets) {
      try {
        // Get all usage records for the dataset
        const usageRecords = await DB.Usage.findAll({
          where: { datasetId: dataset.id }
        });
        
        // Calculate total impact
        const totalImpact = usageRecords.reduce((sum, record) => sum + record.impactScore, 0);
        
        // Calculate royalties for each contributor
        for (const contributor of dataset.Contributors) {
          const share = contributor.share / 100; // Convert percentage to decimal
          const royaltyAmount = totalImpact * share;
          
          // Update or create royalty record
          await DB.Royalty.upsert({
            contributorAddress: contributor.address,
            datasetId: dataset.id,
            share: contributor.share,
            totalAmount: royaltyAmount,
            lastCalculated: new Date()
          });
        }
        
        processedCount++;
        logger.info('Royalties processed for dataset', { 
          datasetId: dataset.id, 
          totalImpact,
          contributorCount: dataset.Contributors.length
        });
      } catch (error) {
        logger.error('Error processing royalties for dataset', { 
          error: error.message, 
          datasetId: dataset.id
        });
      }
    }
    
    logger.info(`Royalty processing completed. Processed ${processedCount} of ${datasets.length} datasets`);
    
    return {
      processed: processedCount
    };
  } catch (error) {
    logger.error('Royalty processing job failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  processRoyalties
};