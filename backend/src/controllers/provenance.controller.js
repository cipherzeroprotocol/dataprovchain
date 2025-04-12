/**
 * Provenance controller
 */
const provenanceService = require('../services/provenance.service');
const logger = require('../utils/logger');

/**
 * Add a provenance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addProvenanceRecord = async (req, res) => {
  try {
    const { datasetId, actionType, description, metadata, previousRecordId } = req.body;
    
    const record = await provenanceService.addProvenanceRecord({
      datasetId,
      actionType,
      performedBy: req.user.walletAddress,
      description,
      metadata,
      previousRecordId
    });
    
    return res.status(201).json({
      status: 'success',
      data: record
    });
  } catch (error) {
    logger.error('Error adding provenance record', { error: error.message });
    
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
 * Get provenance history for a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProvenanceHistory = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { limit, actionType } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit) : undefined,
      actionType
    };
    
    const records = await provenanceService.getProvenanceHistory(datasetId, options);
    
    return res.status(200).json({
      status: 'success',
      data: records
    });
  } catch (error) {
    logger.error('Error getting provenance history', { 
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
 * Get provenance graph data for visualization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProvenanceGraph = async (req, res) => {
  try {
    const { datasetId } = req.params;
    
    const graphData = await provenanceService.getProvenanceGraph(datasetId);
    
    return res.status(200).json({
      status: 'success',
      data: graphData
    });
  } catch (error) {
    logger.error('Error getting provenance graph', { 
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
 * Verify a dataset's provenance chain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyProvenanceChain = async (req, res) => {
  try {
    const { datasetId } = req.params;
    
    const result = await provenanceService.verifyProvenanceChain(datasetId);
    
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Error verifying provenance chain', { 
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
  addProvenanceRecord,
  getProvenanceHistory,
  getProvenanceGraph,
  verifyProvenanceChain
};