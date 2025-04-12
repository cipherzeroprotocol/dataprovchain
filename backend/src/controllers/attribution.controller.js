/**
 * Attribution controller
 */
const attributionService = require('../services/attribution.service');
const logger = require('../utils/logger');

/**
 * Record dataset usage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const recordUsage = async (req, res) => {
  try {
    const { datasetId, modelId, usageType, impactScore, description } = req.body;
    
    const usage = await attributionService.recordUsage({
      datasetId,
      modelId,
      usageType,
      usedBy: req.user.walletAddress,
      impactScore: parseInt(impactScore),
      description
    });
    
    return res.status(201).json({
      status: 'success',
      data: usage
    });
  } catch (error) {
    logger.error('Error recording usage', { error: error.message });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    if (error.message.includes('Impact score must be between')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get usage history for a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsageHistory = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { limit, usageType } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      usageType
    };
    
    const usageRecords = await attributionService.getUsageHistory(datasetId, options);
    
    return res.status(200).json({
      status: 'success',
      data: usageRecords
    });
  } catch (error) {
    logger.error('Error getting usage history', { 
      error: error.message, 
      datasetId: req.params.datasetId 
    });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get royalty distribution for a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoyaltyDistribution = async (req, res) => {
  try {
    const { datasetId } = req.params;
    
    const distribution = await attributionService.getRoyaltyDistribution(datasetId);
    
    return res.status(200).json({
      status: 'success',
      data: distribution
    });
  } catch (error) {
    logger.error('Error getting royalty distribution', { 
      error: error.message, 
      datasetId: req.params.datasetId 
    });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Distribute royalties for a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const distributeRoyalties = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { paymentId, paymentAmount, paymentType } = req.body;
    
    if (!paymentId || !paymentAmount || !paymentType) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment ID, amount, and type are required'
      });
    }
    
    const result = await attributionService.distributeRoyalties(datasetId, {
      paymentId,
      paymentAmount,
      paymentType,
      paidBy: req.user.walletAddress
    });
    
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Error distributing royalties', { 
      error: error.message, 
      datasetId: req.params.datasetId 
    });
    
    if (error.message.includes('not found') || 
        error.message.includes('No contributors found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get attribution metrics for a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAttributionMetrics = async (req, res) => {
  try {
    const { datasetId } = req.params;
    
    const metrics = await attributionService.getAttributionMetrics(datasetId);
    
    return res.status(200).json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting attribution metrics', { 
      error: error.message, 
      datasetId: req.params.datasetId 
    });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  recordUsage,
  getUsageHistory,
  getRoyaltyDistribution,
  distributeRoyalties,
  getAttributionMetrics
};