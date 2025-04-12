/**
 * Attribution tracking service
 */
const { v4: uuidv4 } = require('uuid');
const contractsService = require('./contracts.service');
const logger = require('../utils/logger');
const DB = require('../models');

/**
 * Record dataset usage
 * @param {Object} usage - Usage data
 * @param {string} usage.datasetId - Dataset ID
 * @param {string} usage.modelId - Model ID
 * @param {string} usage.usageType - Type of usage (e.g., "training", "validation")
 * @param {string} usage.usedBy - Address of the user
 * @param {number} usage.impactScore - Impact score (1-100)
 * @param {string} usage.description - Description of usage
 * @returns {Promise<Object>} - Created usage record
 */
const recordUsage = async (usage) => {
  try {
    // Check if dataset exists
    const dataset = await DB.Dataset.findByPk(usage.datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${usage.datasetId}`);
    }
    
    // Validate impact score
    if (usage.impactScore < 1 || usage.impactScore > 100) {
      throw new Error('Impact score must be between 1 and 100');
    }
    
    // Record usage on blockchain
    let txHash = null;
    try {
      const { receipt } = await contractsService.recordDatasetUsage(
        dataset.tokenId,
        usage.modelId,
        usage.usageType,
        usage.impactScore
      );
      txHash = receipt.transactionHash;
      logger.info('Usage recorded on blockchain', { 
        tokenId: dataset.tokenId, 
        txHash 
      });
    } catch (blockchainError) {
      logger.error('Error recording usage on blockchain', { 
        error: blockchainError.message,
        datasetId: usage.datasetId 
      });
      // Continue with database record even if blockchain fails
    }
    
    // Create usage record
    const usageRecord = await DB.Usage.create({
      id: uuidv4(),
      datasetId: usage.datasetId,
      modelId: usage.modelId,
      usageType: usage.usageType,
      usedBy: usage.usedBy,
      impactScore: usage.impactScore,
      description: usage.description,
      transactionHash: txHash
    });
    
    logger.info('Usage record created', { 
      id: usageRecord.id, 
      datasetId: usage.datasetId 
    });
    
    // Calculate and update royalties
    await calculateRoyalties(usage.datasetId);
    
    return {
      id: usageRecord.id,
      datasetId: usageRecord.datasetId,
      modelId: usageRecord.modelId,
      usageType: usageRecord.usageType,
      usedBy: usageRecord.usedBy,
      impactScore: usageRecord.impactScore,
      description: usageRecord.description,
      transactionHash: usageRecord.transactionHash,
      createdAt: usageRecord.createdAt
    };
  } catch (error) {
    logger.error('Error recording usage', { error: error.message });
    throw error;
  }
};

/**
 * Calculate royalties for a dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} - Royalty calculation result
 */
const calculateRoyalties = async (datasetId) => {
  try {
    // Get dataset
    const dataset = await DB.Dataset.findByPk(datasetId, {
      include: [
        { model: DB.Contributor }
      ]
    });
    
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }
    
    // Get all usage records
    const usageRecords = await DB.Usage.findAll({
      where: { datasetId }
    });
    
    // Calculate total impact
    const totalImpact = usageRecords.reduce((sum, record) => sum + record.impactScore, 0);
    
    // Calculate royalties for each contributor
    const royalties = dataset.Contributors.map(contributor => {
      const share = contributor.share / 100; // Convert percentage to decimal
      const royaltyAmount = totalImpact * share;
      
      return {
        contributorId: contributor.id,
        contributorAddress: contributor.address,
        share: contributor.share,
        royaltyAmount,
        datasetId
      };
    });
    
    // Update or create royalty records
    for (const royalty of royalties) {
      await DB.Royalty.upsert({
        contributorAddress: royalty.contributorAddress,
        datasetId,
        share: royalty.share,
        totalAmount: royalty.royaltyAmount,
        lastCalculated: new Date()
      });
    }
    
    logger.info('Royalties calculated', { datasetId, totalImpact });
    
    return {
      datasetId,
      totalImpact,
      royalties
    };
  } catch (error) {
    logger.error('Error calculating royalties', { 
      error: error.message,
      datasetId 
    });
    throw error;
  }
};

/**
 * Get usage history for a dataset
 * @param {string} datasetId - Dataset ID
 * @param {Object} [options] - Query options
 * @param {number} [options.limit] - Maximum number of records
 * @param {string} [options.usageType] - Filter by usage type
 * @returns {Promise<Array>} - Usage records
 */
const getUsageHistory = async (datasetId, options = {}) => {
  try {
    // Check if dataset exists
    const dataset = await DB.Dataset.findByPk(datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }
    
    // Build query
    const query = {
      where: { datasetId },
      order: [['createdAt', 'DESC']]
    };
    
    if (options.limit) {
      query.limit = options.limit;
    }
    
    if (options.usageType) {
      query.where.usageType = options.usageType;
    }
    
    // Get records
    const records = await DB.Usage.findAll(query);
    
    return records.map(record => ({
      id: record.id,
      datasetId: record.datasetId,
      modelId: record.modelId,
      usageType: record.usageType,
      usedBy: record.usedBy,
      impactScore: record.impactScore,
      description: record.description,
      transactionHash: record.transactionHash,
      createdAt: record.createdAt
    }));
  } catch (error) {
    logger.error('Error getting usage history', { 
      error: error.message, 
      datasetId 
    });
    throw error;
  }
};

/**
 * Get royalty distribution for a dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} - Royalty distribution
 */
const getRoyaltyDistribution = async (datasetId) => {
  try {
    // Check if dataset exists
    const dataset = await DB.Dataset.findByPk(datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }
    
    // Get royalty records
    const royalties = await DB.Royalty.findAll({
      where: { datasetId },
      include: [
        { 
          model: DB.User, 
          as: 'contributor',
          attributes: ['id', 'username', 'walletAddress'] 
        }
      ]
    });
    
    // Get total usage impact
    const totalImpact = await DB.Usage.sum('impactScore', {
      where: { datasetId }
    }) || 0;
    
    // Calculate total royalties
    const totalRoyalties = royalties.reduce((sum, record) => sum + record.totalAmount, 0);
    
    return {
      datasetId,
      totalImpact,
      totalRoyalties,
      lastCalculated: royalties.length > 0 
        ? royalties[0].lastCalculated 
        : null,
      contributors: royalties.map(royalty => ({
        address: royalty.contributorAddress,
        username: royalty.contributor ? royalty.contributor.username : 'Unknown',
        share: royalty.share,
        amount: royalty.totalAmount
      }))
    };
  } catch (error) {
    logger.error('Error getting royalty distribution', { 
      error: error.message, 
      datasetId 
    });
    throw error;
  }
};

/**
 * Distribute royalties to contributors
 * @param {string} datasetId - Dataset ID
 * @param {Object} paymentData - Payment data
 * @param {string} paymentData.paymentId - Payment transaction ID
 * @param {string} paymentData.paymentAmount - Payment amount
 * @param {string} paymentData.paymentType - Payment type (e.g., "eth", "fil")
 * @param {string} paymentData.paidBy - Address of the payer
 * @returns {Promise<Object>} - Distribution result
 */
const distributeRoyalties = async (datasetId, paymentData) => {
  try {
    // Get royalty distribution
    const distribution = await getRoyaltyDistribution(datasetId);
    
    if (distribution.contributors.length === 0) {
      throw new Error('No contributors found for royalty distribution');
    }
    
    // Record payment in database
    const payment = await DB.RoyaltyPayment.create({
      id: uuidv4(),
      datasetId,
      paymentId: paymentData.paymentId,
      amount: paymentData.paymentAmount,
      paymentType: paymentData.paymentType,
      paidBy: paymentData.paidBy,
      status: 'completed'
    });
    
    // Record distributions for each contributor
    const distributions = [];
    for (const contributor of distribution.contributors) {
      // Calculate share of this payment
      const share = contributor.share / 100;
      const amount = paymentData.paymentAmount * share;
      
      // Record distribution
      const dist = await DB.RoyaltyDistribution.create({
        id: uuidv4(),
        paymentId: payment.id,
        contributorAddress: contributor.address,
        amount,
        share: contributor.share,
        status: 'completed'
      });
      
      distributions.push({
        id: dist.id,
        contributorAddress: contributor.address,
        amount,
        share: contributor.share
      });
    }
    
    logger.info('Royalties distributed', { 
      datasetId, 
      paymentId: payment.id, 
      amount: paymentData.paymentAmount 
    });
    
    return {
      paymentId: payment.id,
      datasetId,
      amount: paymentData.paymentAmount,
      paymentType: paymentData.paymentType,
      paidBy: paymentData.paidBy,
      distributionDate: payment.createdAt,
      distributions
    };
  } catch (error) {
    logger.error('Error distributing royalties', { 
      error: error.message, 
      datasetId 
    });
    throw error;
  }
};

/**
 * Get attribution metrics for a dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} - Attribution metrics
 */
const getAttributionMetrics = async (datasetId) => {
  try {
    // Check if dataset exists
    const dataset = await DB.Dataset.findByPk(datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }
    
    // Get usage records
    const usageRecords = await DB.Usage.findAll({
      where: { datasetId }
    });
    
    // Get royalty payments
    const payments = await DB.RoyaltyPayment.findAll({
      where: { datasetId }
    });
    
    // Calculate metrics
    const totalUsageCount = usageRecords.length;
    const totalImpactScore = usageRecords.reduce((sum, record) => sum + record.impactScore, 0);
    
    // Usage types breakdown
    const usageTypeCount = {};
    usageRecords.forEach(record => {
      usageTypeCount[record.usageType] = (usageTypeCount[record.usageType] || 0) + 1;
    });
    
    // Impact over time (by month)
    const impactByMonth = {};
    usageRecords.forEach(record => {
      const month = record.createdAt.toISOString().substring(0, 7); // YYYY-MM
      impactByMonth[month] = (impactByMonth[month] || 0) + record.impactScore;
    });
    
    // Total royalties
    const totalRoyalties = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    return {
      datasetId,
      totalUsageCount,
      totalImpactScore,
      totalRoyalties,
      usageTypeBreakdown: Object.entries(usageTypeCount).map(([type, count]) => ({
        type,
        count,
        percentage: (count / totalUsageCount) * 100
      })),
      impactOverTime: Object.entries(impactByMonth).map(([month, impact]) => ({
        month,
        impact
      })),
      paymentCount: payments.length
    };
  } catch (error) {
    logger.error('Error getting attribution metrics', { 
      error: error.message, 
      datasetId 
    });
    throw error;
  }
};

module.exports = {
  recordUsage,
  calculateRoyalties,
  getUsageHistory,
  getRoyaltyDistribution,
  distributeRoyalties,
  getAttributionMetrics
};