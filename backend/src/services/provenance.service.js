/**
 * Provenance tracking service
 */
const { v4: uuidv4 } = require('uuid');
const contractsService = require('./contracts.service');
const ipfsService = require('./ipfs.service');
const logger = require('../utils/logger');
const DB = require('../models');

/**
 * Add a provenance record
 * @param {Object} record - Provenance record
 * @param {string} record.datasetId - Dataset ID
 * @param {string} record.actionType - Type of action (e.g., "creation", "modification", "derivation")
 * @param {string} record.performedBy - Address of the actor who performed the action
 * @param {string} record.description - Description of the action
 * @param {Object} [record.metadata] - Additional metadata
 * @param {string} [record.previousRecordId] - ID of the previous record (for linking)
 * @returns {Promise<Object>} - Created provenance record
 */
const addProvenanceRecord = async (record) => {
  try {
    // Get dataset
    const dataset = await DB.Dataset.findByPk(record.datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${record.datasetId}`);
    }
    
    // Create unique ID for the record
    const id = uuidv4();
    
    // Prepare record for IPFS
    const timestamp = new Date();
    const provenanceData = {
      id,
      datasetId: record.datasetId,
      datasetTokenId: dataset.tokenId,
      actionType: record.actionType,
      performedBy: record.performedBy,
      description: record.description,
      metadata: record.metadata || {},
      timestamp: timestamp.toISOString(),
      previousRecordId: record.previousRecordId || null
    };
    
    // Store record on IPFS
    const cid = await ipfsService.uploadMetadata(provenanceData);
    logger.info('Provenance record stored on IPFS', { cid, id });
    
    // Record provenance on blockchain
    let txHash = null;
    try {
      const { receipt } = await contractsService.getContract('DatasetRegistry').addProvenanceRecord(
        dataset.tokenId,
        record.actionType,
        record.performedBy,
        cid
      );
      txHash = receipt.transactionHash;
      logger.info('Provenance recorded on blockchain', { 
        tokenId: dataset.tokenId, 
        txHash 
      });
    } catch (blockchainError) {
      logger.error('Error recording provenance on blockchain', { 
        error: blockchainError.message,
        id 
      });
      // Continue with database record even if blockchain fails
    }
    
    // Store in database
    const provenanceRecord = await DB.ProvenanceRecord.create({
      id,
      datasetId: record.datasetId,
      actionType: record.actionType,
      performedBy: record.performedBy,
      description: record.description,
      metadata: record.metadata || {},
      ipfsCid: cid,
      transactionHash: txHash,
      previousRecordId: record.previousRecordId || null
    });
    
    logger.info('Provenance record created', { id });
    
    return {
      id: provenanceRecord.id,
      datasetId: provenanceRecord.datasetId,
      actionType: provenanceRecord.actionType,
      performedBy: provenanceRecord.performedBy,
      description: provenanceRecord.description,
      metadata: provenanceRecord.metadata,
      ipfsCid: provenanceRecord.ipfsCid,
      transactionHash: provenanceRecord.transactionHash,
      previousRecordId: provenanceRecord.previousRecordId,
      createdAt: provenanceRecord.createdAt
    };
  } catch (error) {
    logger.error('Error adding provenance record', { error: error.message });
    throw error;
  }
};

/**
 * Get provenance history for a dataset
 * @param {string} datasetId - Dataset ID
 * @param {Object} [options] - Query options
 * @param {number} [options.limit] - Maximum number of records
 * @param {string} [options.actionType] - Filter by action type
 * @returns {Promise<Array>} - Provenance records
 */
const getProvenanceHistory = async (datasetId, options = {}) => {
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
    
    if (options.actionType) {
      query.where.actionType = options.actionType;
    }
    
    // Get records
    const records = await DB.ProvenanceRecord.findAll(query);
    
    return records.map(record => ({
      id: record.id,
      datasetId: record.datasetId,
      actionType: record.actionType,
      performedBy: record.performedBy,
      description: record.description,
      metadata: record.metadata,
      ipfsCid: record.ipfsCid,
      transactionHash: record.transactionHash,
      previousRecordId: record.previousRecordId,
      createdAt: record.createdAt
    }));
  } catch (error) {
    logger.error('Error getting provenance history', { 
      error: error.message, 
      datasetId 
    });
    throw error;
  }
};

/**
 * Get provenance graph data for visualization
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} - Graph data with nodes and edges
 */
const getProvenanceGraph = async (datasetId) => {
  try {
    // Get dataset
    const dataset = await DB.Dataset.findByPk(datasetId, {
      include: [
        { model: DB.User, as: 'creator', attributes: ['id', 'username', 'walletAddress'] }
      ]
    });
    
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }
    
    // Get all provenance records
    const records = await DB.ProvenanceRecord.findAll({
      where: { datasetId },
      order: [['createdAt', 'ASC']]
    });
    
    // Build graph
    const nodes = [];
    const edges = [];
    
    // Add dataset node
    nodes.push({
      id: `dataset-${dataset.id}`,
      type: 'dataset',
      label: dataset.name,
      data: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        dataType: dataset.dataType,
        createdAt: dataset.createdAt,
        creator: dataset.creator ? dataset.creator.username : 'Unknown'
      }
    });
    
    // Add actor nodes and action nodes
    const actorNodes = new Set();
    
    records.forEach((record, index) => {
      // Add actor node if not already added
      if (!actorNodes.has(record.performedBy)) {
        nodes.push({
          id: `actor-${record.performedBy}`,
          type: 'actor',
          label: record.performedBy.substring(0, 10) + '...',
          data: {
            address: record.performedBy
          }
        });
        actorNodes.add(record.performedBy);
      }
      
      // Add action node
      const actionNodeId = `action-${record.id}`;
      nodes.push({
        id: actionNodeId,
        type: 'action',
        label: record.actionType,
        data: {
          id: record.id,
          type: record.actionType,
          description: record.description,
          timestamp: record.createdAt,
          metadata: record.metadata
        }
      });
      
      // Add edge from actor to action
      edges.push({
        id: `edge-actor-${record.id}`,
        source: `actor-${record.performedBy}`,
        target: actionNodeId,
        label: 'performed'
      });
      
      // Add edge from action to dataset
      edges.push({
        id: `edge-action-${record.id}`,
        source: actionNodeId,
        target: `dataset-${dataset.id}`,
        label: record.actionType
      });
      
      // Add edge from previous action if exists
      if (record.previousRecordId) {
        edges.push({
          id: `edge-prev-${record.id}`,
          source: `action-${record.previousRecordId}`,
          target: actionNodeId,
          label: 'precedes'
        });
      }
    });
    
    return {
      nodes,
      edges
    };
  } catch (error) {
    logger.error('Error generating provenance graph', { 
      error: error.message, 
      datasetId 
    });
    throw error;
  }
};

/**
 * Verify a dataset's provenance chain
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} - Verification result
 */
const verifyProvenanceChain = async (datasetId) => {
  try {
    // Get all provenance records
    const records = await DB.ProvenanceRecord.findAll({
      where: { datasetId },
      order: [['createdAt', 'ASC']]
    });
    
    if (records.length === 0) {
      return {
        verified: false,
        reason: 'No provenance records found'
      };
    }
    
    // Get dataset
    const dataset = await DB.Dataset.findByPk(datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }
    
    // Verify on blockchain
    let blockchainVerified = true;
    let failedRecords = [];
    
    try {
      const onChainRecords = await contractsService.getContract('DatasetRegistry')
        .getProvenanceRecords(dataset.tokenId);
      
      // Check if all records exist on chain
      for (const record of records) {
        if (record.transactionHash) {
          const found = onChainRecords.some(
            r => r.metadataURI === record.ipfsCid
          );
          
          if (!found) {
            blockchainVerified = false;
            failedRecords.push(record.id);
          }
        }
      }
    } catch (blockchainError) {
      logger.error('Error verifying provenance on blockchain', { 
        error: blockchainError.message, 
        datasetId 
      });
      blockchainVerified = false;
    }
    
    // Verify IPFS records
    let ipfsVerified = true;
    
    for (const record of records) {
      try {
        // Check if record exists on IPFS
        const exists = await ipfsService.checkContentExists(record.ipfsCid);
        
        if (!exists) {
          ipfsVerified = false;
          failedRecords.push(record.id);
        }
      } catch (ipfsError) {
        logger.error('Error verifying provenance on IPFS', { 
          error: ipfsError.message, 
          id: record.id 
        });
        ipfsVerified = false;
        failedRecords.push(record.id);
      }
    }
    
    // Verify chain integrity
    let chainIntegrity = true;
    
    // Check if links between records are valid
    for (const record of records) {
      if (record.previousRecordId) {
        const previousExists = records.some(r => r.id === record.previousRecordId);
        
        if (!previousExists) {
          chainIntegrity = false;
          failedRecords.push(record.id);
        }
      }
    }
    
    return {
      verified: blockchainVerified && ipfsVerified && chainIntegrity,
      blockchainVerified,
      ipfsVerified,
      chainIntegrity,
      recordsCount: records.length,
      failedRecords: [...new Set(failedRecords)]
    };
  } catch (error) {
    logger.error('Error verifying provenance chain', { 
      error: error.message, 
      datasetId 
    });
    throw error;
  }
};

module.exports = {
  addProvenanceRecord,
  getProvenanceHistory,
  getProvenanceGraph,
  verifyProvenanceChain
};