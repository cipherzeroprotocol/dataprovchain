/**
 * Service for managing datasets
 */
const { v4: uuidv4 } = require('uuid');
const filecoinService = require('./filecoin.service');
const ipfsService = require('./ipfs.service');
const contractsService = require('./contracts.service');
const fileUtils = require('../utils/file');
const logger = require('../utils/logger');
const DB = require('../models'); // This would be your database models

/**
 * Create a new dataset
 * @param {Object} dataset - Dataset creation parameters
 * @param {string} dataset.name - Dataset name
 * @param {string} dataset.description - Dataset description
 * @param {string} dataset.dataType - Type of data
 * @param {Array<Object>} dataset.contributors - Array of contributor objects
 * @param {string} dataset.license - License information
 * @param {Array<string>} dataset.tags - Array of tags
 * @param {Buffer|string} dataset.file - Dataset file data or path
 * @param {string} dataset.creator - Creator's wallet address
 * @returns {Promise<Object>} - Created dataset information
 */
const createDataset = async (dataset) => {
  try {
    logger.info('Creating new dataset', { name: dataset.name, creator: dataset.creator });
    
    // Generate an internal ID
    const internalId = uuidv4();
    
    // Create metadata object
    const metadata = {
      name: dataset.name,
      description: dataset.description,
      dataType: dataset.dataType,
      contributors: dataset.contributors,
      license: dataset.license,
      tags: dataset.tags,
      creator: dataset.creator,
      created: new Date().toISOString()
    };
    
    // Upload metadata to IPFS
    const metadataUri = await ipfsService.uploadMetadata(metadata);
    logger.info('Dataset metadata uploaded to IPFS', { metadataUri });
    
    // Store dataset on Filecoin/IPFS
    const { cid } = await filecoinService.storeDataset({
      data: dataset.file,
      metadata,
      name: dataset.name
    });
    logger.info('Dataset stored on Filecoin/IPFS', { cid });
    
    // Extract contributor addresses for the smart contract
    const contributorAddresses = dataset.contributors.map(c => c.id);
    
    // Register dataset on blockchain
    const { tokenId } = await contractsService.registerDataset({
      cid,
      dataType: dataset.dataType,
      contributors: contributorAddresses,
      metadataURI: metadataUri
    });
    logger.info('Dataset registered on blockchain', { tokenId });
    
    // Create storage deal on Filecoin
    let fileSize;
    if (Buffer.isBuffer(dataset.file)) {
      fileSize = dataset.file.length;
    } else if (typeof dataset.file === 'string') {
      fileSize = await fileUtils.getFileSize(dataset.file);
    }
    
    const dealInfo = await filecoinService.createStorageDeal({
      cid,
      size: fileSize
    });
    logger.info('Filecoin storage deal created', { dealId: dealInfo.dealId });
    
    // Save dataset to database
    const dbDataset = await DB.Dataset.create({
      id: internalId,
      name: dataset.name,
      description: dataset.description,
      dataType: dataset.dataType,
      cid: cid,
      tokenId: tokenId,
      metadataUri: metadataUri,
      license: dataset.license,
      creator: dataset.creator,
      fileSize: fileSize,
      verified: false,
      dealId: dealInfo.dealId
    });
    
    // Save contributors to database
    for (const contributor of dataset.contributors) {
      await DB.Contributor.create({
        datasetId: internalId,
        address: contributor.id,
        share: contributor.share,
        name: contributor.name || null
      });
    }
    
    // Save tags to database
    for (const tag of dataset.tags) {
      await DB.Tag.create({
        datasetId: internalId,
        name: tag
      });
    }
    
    return {
      id: internalId,
      tokenId,
      cid,
      metadataUri,
      dealId: dealInfo.dealId,
      status: 'pending'
    };
  } catch (error) {
    logger.error('Error creating dataset', { error: error.message });
    throw error;
  }
};

/**
 * Get dataset by ID
 * @param {string} id - Dataset ID
 * @returns {Promise<Object>} - Dataset information
 */
const getDataset = async (id) => {
  try {
    // Get dataset from database
    const dataset = await DB.Dataset.findByPk(id, {
      include: [
        { model: DB.Contributor },
        { model: DB.Tag }
      ]
    });
    
    if (!dataset) {
      throw new Error(`Dataset not found: ${id}`);
    }
    
    // Check deal status if necessary
    if (dataset.dealId && !dataset.dealConfirmed) {
      const dealStatus = await filecoinService.checkDealStatus(dataset.dealId);
      
      if (dealStatus.active) {
        // Update database if deal is now active
        dataset.dealConfirmed = true;
        await dataset.save();
      }
    }
    
    // Format the response
    return {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      dataType: dataset.dataType,
      cid: dataset.cid,
      tokenId: dataset.tokenId,
      metadataUri: dataset.metadataUri,
      license: dataset.license,
      creator: dataset.creator,
      fileSize: dataset.fileSize,
      verified: dataset.verified,
      dealId: dataset.dealId,
      dealConfirmed: dataset.dealConfirmed,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
      contributors: dataset.Contributors.map(c => ({
        id: c.address,
        share: c.share,
        name: c.name
      })),
      tags: dataset.Tags.map(t => t.name)
    };
  } catch (error) {
    logger.error('Error getting dataset', { error: error.message, id });
    throw error;
  }
};

/**
 * Get dataset by token ID
 * @param {string} tokenId - Dataset token ID
 * @returns {Promise<Object>} - Dataset information
 */
const getDatasetByTokenId = async (tokenId) => {
  try {
    // Get dataset from database
    const dataset = await DB.Dataset.findOne({
      where: { tokenId },
      include: [
        { model: DB.Contributor },
        { model: DB.Tag }
      ]
    });
    
    if (!dataset) {
      throw new Error(`Dataset not found with token ID: ${tokenId}`);
    }
    
    // Format and return (same as getDataset)
    return {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      dataType: dataset.dataType,
      cid: dataset.cid,
      tokenId: dataset.tokenId,
      metadataUri: dataset.metadataUri,
      license: dataset.license,
      creator: dataset.creator,
      fileSize: dataset.fileSize,
      verified: dataset.verified,
      dealId: dataset.dealId,
      dealConfirmed: dataset.dealConfirmed,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
      contributors: dataset.Contributors.map(c => ({
        id: c.address,
        share: c.share,
        name: c.name
      })),
      tags: dataset.Tags.map(t => t.name)
    };
  } catch (error) {
    logger.error('Error getting dataset by token ID', { error: error.message, tokenId });
    throw error;
  }
};

/**
 * List datasets with optional filtering
 * @param {Object} filters - Filter options
 * @param {string} [filters.creator] - Filter by creator
 * @param {string} [filters.dataType] - Filter by data type
 * @param {boolean} [filters.verified] - Filter by verification status
 * @param {string} [filters.tag] - Filter by tag
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Items per page
 * @returns {Promise<Object>} - Paginated datasets
 */
const listDatasets = async (filters = {}, page = 1, limit = 10) => {
  try {
    // Build query conditions
    const where = {};
    
    if (filters.creator) {
      where.creator = filters.creator;
    }
    
    if (filters.dataType) {
      where.dataType = filters.dataType;
    }
    
    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }
    
    // Tag filtering needs a JOIN
    const include = [
      { model: DB.Contributor }
    ];
    
    if (filters.tag) {
      include.push({
        model: DB.Tag,
        where: { name: filters.tag }
      });
    } else {
      include.push({ model: DB.Tag });
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Execute query
    const { count, rows } = await DB.Dataset.findAndCountAll({
      where,
      include,
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Format results
    const datasets = rows.map(dataset => ({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      dataType: dataset.dataType,
      cid: dataset.cid,
      tokenId: dataset.tokenId,
      license: dataset.license,
      creator: dataset.creator,
      verified: dataset.verified,
      createdAt: dataset.createdAt,
      contributors: dataset.Contributors.map(c => ({
        id: c.address,
        share: c.share,
        name: c.name
      })),
      tags: dataset.Tags.map(t => t.name)
    }));
    
    return {
      datasets,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error listing datasets', { error: error.message, filters });
    throw error;
  }
};

/**
 * Verify a dataset
 * @param {string} id - Dataset ID
 * @param {string} verifier - Verifier's address
 * @returns {Promise<Object>} - Updated dataset information
 */
const verifyDataset = async (id, verifier) => {
  try {
    // Get dataset from database
    const dataset = await DB.Dataset.findByPk(id);
    
    if (!dataset) {
      throw new Error(`Dataset not found: ${id}`);
    }
    
    if (dataset.verified) {
      throw new Error(`Dataset already verified: ${id}`);
    }
    
    // Verify dataset on blockchain
    await contractsService.verifyDataset(dataset.tokenId);
    
    // Update database
    dataset.verified = true;
    dataset.verifier = verifier;
    dataset.verifiedAt = new Date();
    await dataset.save();
    
    // Create verification record
    await DB.Verification.create({
      datasetId: id,
      verifier,
      verifiedAt: new Date()
    });
    
    logger.info('Dataset verified', { id, tokenId: dataset.tokenId, verifier });
    
    return {
      id,
      verified: true,
      verifier,
      verifiedAt: dataset.verifiedAt
    };
  } catch (error) {
    logger.error('Error verifying dataset', { error: error.message, id });
    throw error;
  }
};

/**
 * Download dataset
 * @param {string} id - Dataset ID
 * @returns {Promise<Object>} - Dataset content and metadata
 */
const downloadDataset = async (id) => {
  try {
    // Get dataset from database
    const dataset = await DB.Dataset.findByPk(id);
    
    if (!dataset) {
      throw new Error(`Dataset not found: ${id}`);
    }
    
    // Retrieve dataset from Filecoin/IPFS
    const result = await filecoinService.retrieveDataset(dataset.cid);
    
    logger.info('Dataset downloaded', { id, cid: dataset.cid });
    
    return {
      data: result.data,
      metadata: result.metadata,
      name: result.name
    };
  } catch (error) {
    logger.error('Error downloading dataset', { error: error.message, id });
    throw error;
  }
};

module.exports = {
  createDataset,
  getDataset,
  getDatasetByTokenId,
  listDatasets,
  verifyDataset,
  downloadDataset
};