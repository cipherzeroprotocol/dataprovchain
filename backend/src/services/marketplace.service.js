/**
 * Marketplace service for buying and selling datasets
 */
const { v4: uuidv4 } = require('uuid');
const { ethers } = require('ethers');
const contractsService = require('./contracts.service');
const web3Utils = require('../utils/web3');
const logger = require('../utils/logger');
const DB = require('../models');

/**
 * Create a new listing
 * @param {Object} listing - Listing data
 * @param {string} listing.datasetId - Dataset ID
 * @param {string} listing.price - Price in wei
 * @param {string} listing.licenseType - Type of license (e.g., "research", "commercial")
 * @param {number} listing.duration - Duration in seconds
 * @param {string} listing.seller - Seller's wallet address
 * @param {Object} [listing.terms] - Additional terms
 * @returns {Promise<Object>} - Created listing
 */
const createListing = async (listing) => {
  try {
    // Check if dataset exists
    const dataset = await DB.Dataset.findByPk(listing.datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${listing.datasetId}`);
    }
    
    // Check if seller is the creator or a contributor
    const isCreatorOrContributor = 
      dataset.creator === listing.seller ||
      await DB.Contributor.findOne({
        where: {
          datasetId: listing.datasetId,
          address: listing.seller
        }
      });
    
    if (!isCreatorOrContributor) {
      throw new Error('Only the creator or a contributor can create a listing');
    }
    
    // Validate price
    if (ethers.BigNumber.from(listing.price).lte(0)) {
      throw new Error('Price must be greater than 0');
    }
    
    // Validate duration
    if (listing.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    
    // Create listing on blockchain
    let listingId, txHash;
    try {
      const { listingId: onChainId, receipt } = await contractsService.createListing({
        datasetId: dataset.tokenId, // Use token ID for blockchain
        price: listing.price,
        licenseType: listing.licenseType,
        duration: listing.duration
      });
      
      listingId = onChainId;
      txHash = receipt.transactionHash;
      
      logger.info('Listing created on blockchain', { 
        listingId, 
        datasetId: listing.datasetId, 
        txHash 
      });
    } catch (blockchainError) {
      logger.error('Error creating listing on blockchain', { 
        error: blockchainError.message, 
        datasetId: listing.datasetId 
      });
      throw blockchainError;
    }
    
    // Create listing in database
    const dbListing = await DB.Listing.create({
      id: uuidv4(),
      datasetId: listing.datasetId,
      onChainId: listingId,
      price: listing.price,
      licenseType: listing.licenseType,
      duration: listing.duration,
      seller: listing.seller,
      terms: listing.terms || {},
      status: 'active',
      expiresAt: new Date(Date.now() + listing.duration * 1000),
      transactionHash: txHash
    });
    
    logger.info('Listing created in database', { 
      id: dbListing.id, 
      onChainId: listingId 
    });
    
    return {
      id: dbListing.id,
      onChainId: listingId,
      datasetId: dbListing.datasetId,
      price: dbListing.price,
      priceInEther: web3Utils.weiToEther(dbListing.price),
      licenseType: dbListing.licenseType,
      duration: dbListing.duration,
      seller: dbListing.seller,
      terms: dbListing.terms,
      status: dbListing.status,
      expiresAt: dbListing.expiresAt,
      transactionHash: dbListing.transactionHash,
      createdAt: dbListing.createdAt
    };
  } catch (error) {
    logger.error('Error creating listing', { error: error.message });
    throw error;
  }
};

/**
 * Get listing by ID
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} - Listing data
 */
const getListing = async (id) => {
  try {
    // Find listing in database
    const listing = await DB.Listing.findByPk(id, {
      include: [
        { 
          model: DB.Dataset, 
          attributes: ['id', 'name', 'description', 'dataType', 'cid'] 
        }
      ]
    });
    
    if (!listing) {
      throw new Error(`Listing not found: ${id}`);
    }
    
    // Check if listing has expired
    if (listing.expiresAt < new Date() && listing.status === 'active') {
      listing.status = 'expired';
      await listing.save();
    }
    
    return {
      id: listing.id,
      onChainId: listing.onChainId,
      datasetId: listing.datasetId,
      dataset: listing.Dataset ? {
        id: listing.Dataset.id,
        name: listing.Dataset.name,
        description: listing.Dataset.description,
        dataType: listing.Dataset.dataType,
        cid: listing.Dataset.cid
      } : null,
      price: listing.price,
      priceInEther: web3Utils.weiToEther(listing.price),
      licenseType: listing.licenseType,
      duration: listing.duration,
      seller: listing.seller,
      terms: listing.terms,
      status: listing.status,
      expiresAt: listing.expiresAt,
      transactionHash: listing.transactionHash,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt
    };
  } catch (error) {
    logger.error('Error getting listing', { error: error.message, id });
    throw error;
  }
};

/**
 * List available listings
 * @param {Object} [filters] - Filters
 * @param {string} [filters.datasetId] - Filter by dataset ID
 * @param {string} [filters.seller] - Filter by seller address
 * @param {string} [filters.licenseType] - Filter by license type
 * @param {string} [filters.status] - Filter by status
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Number of listings per page
 * @returns {Promise<Object>} - Paginated listings
 */
const listListings = async (filters = {}, page = 1, limit = 10) => {
  try {
    // Build query
    const where = {};
    
    if (filters.datasetId) {
      where.datasetId = filters.datasetId;
    }
    
    if (filters.seller) {
      where.seller = filters.seller;
    }
    
    if (filters.licenseType) {
      where.licenseType = filters.licenseType;
    }
    
    if (filters.status) {
      where.status = filters.status;
    } else {
      // By default, only show active listings
      where.status = 'active';
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get listings
    const { count, rows } = await DB.Listing.findAndCountAll({
      where,
      include: [
        { 
          model: DB.Dataset, 
          attributes: ['id', 'name', 'description', 'dataType', 'cid'] 
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Update expired listings
    const now = new Date();
    for (const listing of rows) {
      if (listing.expiresAt < now && listing.status === 'active') {
        listing.status = 'expired';
        await listing.save();
      }
    }
    
    // Format listings
    const listings = rows.map(listing => ({
      id: listing.id,
      onChainId: listing.onChainId,
      datasetId: listing.datasetId,
      dataset: listing.Dataset ? {
        id: listing.Dataset.id,
        name: listing.Dataset.name,
        description: listing.Dataset.description,
        dataType: listing.Dataset.dataType,
        cid: listing.Dataset.cid
      } : null,
      price: listing.price,
      priceInEther: web3Utils.weiToEther(listing.price),
      licenseType: listing.licenseType,
      duration: listing.duration,
      seller: listing.seller,
      status: listing.status,
      expiresAt: listing.expiresAt,
      createdAt: listing.createdAt
    }));
    
    return {
      listings,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error listing listings', { error: error.message });
    throw error;
  }
};

/**
 * Update a listing
 * @param {string} id - Listing ID
 * @param {Object} updates - Updates
 * @param {string} [updates.price] - New price
 * @param {string} [updates.licenseType] - New license type
 * @param {number} [updates.duration] - New duration
 * @param {Object} [updates.terms] - New terms
 * @param {string} [updates.status] - New status
 * @param {string} requester - Address of the requester
 * @returns {Promise<Object>} - Updated listing
 */
const updateListing = async (id, updates, requester) => {
  try {
    // Get listing
    const listing = await DB.Listing.findByPk(id);
    if (!listing) {
      throw new Error(`Listing not found: ${id}`);
    }
    
    // Check if requester is the seller
    if (listing.seller.toLowerCase() !== requester.toLowerCase()) {
      throw new Error('Only the seller can update the listing');
    }
    
    // Check if listing is active
    if (listing.status !== 'active') {
      throw new Error('Cannot update an inactive listing');
    }
    
    // Prepare updates
    const updateData = {};
    
    if (updates.price !== undefined) {
      // Validate price
      if (ethers.BigNumber.from(updates.price).lte(0)) {
        throw new Error('Price must be greater than 0');
      }
      updateData.price = updates.price;
    }
    
    if (updates.licenseType !== undefined) {
      updateData.licenseType = updates.licenseType;
    }
    
    if (updates.duration !== undefined) {
      // Validate duration
      if (updates.duration <= 0) {
        throw new Error('Duration must be greater than 0');
      }
      updateData.duration = updates.duration;
      updateData.expiresAt = new Date(Date.now() + updates.duration * 1000);
    }
    
    if (updates.terms !== undefined) {
      updateData.terms = updates.terms;
    }
    
    if (updates.status !== undefined) {
      if (!['active', 'cancelled'].includes(updates.status)) {
        throw new Error('Invalid status');
      }
      updateData.status = updates.status;
    }
    
    // Update listing on blockchain if price, licenseType, or duration changes
    if (updateData.price !== undefined || 
        updateData.licenseType !== undefined || 
        updateData.duration !== undefined) {
      try {
        const contract = contractsService.getContract('Marketplace');
        
        const tx = await contract.updateListing(
          listing.onChainId,
          updateData.price || listing.price,
          updateData.licenseType || listing.licenseType,
          updateData.duration || listing.duration
        );
        
        const receipt = await tx.wait();
        updateData.transactionHash = receipt.transactionHash;
        
        logger.info('Listing updated on blockchain', { 
          id, 
          onChainId: listing.onChainId, 
          txHash: receipt.transactionHash 
        });
      } catch (blockchainError) {
        logger.error('Error updating listing on blockchain', { 
          error: blockchainError.message, 
          id 
        });
        throw blockchainError;
      }
    }
    
    // Update listing in database
    await listing.update(updateData);
    
    logger.info('Listing updated', { id });
    
    return await getListing(id);
  } catch (error) {
    logger.error('Error updating listing', { error: error.message, id });
    throw error;
  }
};

/**
 * Purchase a listing
 * @param {string} id - Listing ID
 * @param {Object} purchaseData - Purchase data
 * @param {string} purchaseData.buyer - Buyer's wallet address
 * @param {string} [purchaseData.transactionHash] - Transaction hash if purchased on blockchain
 * @returns {Promise<Object>} - Purchase details
 */
const purchaseListing = async (id, purchaseData) => {
  try {
    // Get listing
    const listing = await DB.Listing.findByPk(id, {
      include: [
        { model: DB.Dataset }
      ]
    });
    
    if (!listing) {
      throw new Error(`Listing not found: ${id}`);
    }
    
    // Check if listing is active
    if (listing.status !== 'active') {
      throw new Error('Cannot purchase an inactive listing');
    }
    
    // Check if listing has expired
    if (listing.expiresAt < new Date()) {
      listing.status = 'expired';
      await listing.save();
      throw new Error('Listing has expired');
    }
    
    // If transactionHash is provided, verify it
    let txHash = purchaseData.transactionHash;
    if (!txHash) {
      // Purchase on blockchain
      try {
        const { receipt } = await contractsService.getContract('Marketplace').purchaseListing(
          listing.onChainId,
          { value: listing.price }
        );
        
        txHash = receipt.transactionHash;
        
        logger.info('Listing purchased on blockchain', { 
          id, 
          onChainId: listing.onChainId, 
          txHash 
        });
      } catch (blockchainError) {
        logger.error('Error purchasing listing on blockchain', { 
          error: blockchainError.message, 
          id 
        });
        throw blockchainError;
      }
    }
    
    // Create purchase record
    const purchase = await DB.Purchase.create({
      id: uuidv4(),
      listingId: id,
      datasetId: listing.datasetId,
      buyer: purchaseData.buyer,
      price: listing.price,
      licenseType: listing.licenseType,
      duration: listing.duration,
      expiresAt: new Date(Date.now() + listing.duration * 1000),
      transactionHash: txHash
    });
    
    // Update listing status
    await listing.update({ status: 'sold' });
    
    logger.info('Purchase recorded', { 
      id: purchase.id, 
      listingId: id, 
      buyer: purchaseData.buyer 
    });
    
    // Generate access credentials
    const accessToken = crypto.randomBytes(32).toString('hex');
    const accessExpiration = new Date(Date.now() + listing.duration * 1000);
    
    await DB.AccessGrant.create({
      id: uuidv4(),
      purchaseId: purchase.id,
      datasetId: listing.datasetId,
      grantee: purchaseData.buyer,
      accessToken,
      expiresAt: accessExpiration
    });
    
    return {
      id: purchase.id,
      listingId: id,
      datasetId: listing.datasetId,
      dataset: {
        id: listing.Dataset.id,
        name: listing.Dataset.name,
        cid: listing.Dataset.cid
      },
      buyer: purchase.buyer,
      seller: listing.seller,
      price: purchase.price,
      priceInEther: web3Utils.weiToEther(purchase.price),
      licenseType: purchase.licenseType,
      duration: purchase.duration,
      expiresAt: purchase.expiresAt,
      transactionHash: purchase.transactionHash,
      createdAt: purchase.createdAt,
      access: {
        token: accessToken,
        expiresAt: accessExpiration
      }
    };
  } catch (error) {
    logger.error('Error purchasing listing', { error: error.message, id });
    throw error;
  }
};

/**
 * Verify dataset access
 * @param {string} datasetId - Dataset ID
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} - Access information
 */
const verifyAccess = async (datasetId, accessToken) => {
  try {
    // Find access grant
    const accessGrant = await DB.AccessGrant.findOne({
      where: {
        datasetId,
        accessToken
      }
    });
    
    if (!accessGrant) {
      throw new Error('Invalid access token');
    }
    
    // Check if access has expired
    if (accessGrant.expiresAt < new Date()) {
      throw new Error('Access has expired');
    }
    
    return {
      hasAccess: true,
      grantee: accessGrant.grantee,
      expiresAt: accessGrant.expiresAt,
      remainingTime: Math.max(0, accessGrant.expiresAt - Date.now())
    };
  } catch (error) {
    logger.error('Error verifying access', { 
      error: error.message, 
      datasetId 
    });
    
    return {
      hasAccess: false,
      error: error.message
    };
  }
};

/**
 * Get user purchases
 * @param {string} address - User's wallet address
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Number of purchases per page
 * @returns {Promise<Object>} - Paginated purchases
 */
const getUserPurchases = async (address, page = 1, limit = 10) => {
  try {
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get purchases
    const { count, rows } = await DB.Purchase.findAndCountAll({
      where: { buyer: address },
      include: [
        { 
          model: DB.Dataset, 
          attributes: ['id', 'name', 'description', 'dataType', 'cid'] 
        },
        {
          model: DB.AccessGrant,
          as: 'accessGrant'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Format purchases
    const purchases = rows.map(purchase => ({
      id: purchase.id,
      listingId: purchase.listingId,
      datasetId: purchase.datasetId,
      dataset: purchase.Dataset ? {
        id: purchase.Dataset.id,
        name: purchase.Dataset.name,
        description: purchase.Dataset.description,
        dataType: purchase.Dataset.dataType,
        cid: purchase.Dataset.cid
      } : null,
      price: purchase.price,
      priceInEther: web3Utils.weiToEther(purchase.price),
      licenseType: purchase.licenseType,
      duration: purchase.duration,
      expiresAt: purchase.expiresAt,
      transactionHash: purchase.transactionHash,
      createdAt: purchase.createdAt,
      hasValidAccess: purchase.accessGrant && 
                       purchase.accessGrant.expiresAt > new Date(),
      accessExpiresAt: purchase.accessGrant && purchase.accessGrant.expiresAt
    }));
    
    return {
      purchases,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting user purchases', { 
      error: error.message, 
      address 
    });
    throw error;
  }
};

module.exports = {
  createListing,
  getListing,
  listListings,
  updateListing,
  purchaseListing,
  verifyAccess,
  getUserPurchases
};