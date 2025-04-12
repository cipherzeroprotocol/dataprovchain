/**
 * Marketplace controller
 */
const marketplaceService = require('../services/marketplace.service');
const logger = require('../utils/logger');

/**
 * Create a new listing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createListing = async (req, res) => {
  try {
    const { datasetId, price, licenseType, duration, terms } = req.body;
    
    const listing = await marketplaceService.createListing({
      datasetId,
      price,
      licenseType,
      duration: parseInt(duration),
      seller: req.user.walletAddress,
      terms
    });
    
    return res.status(201).json({
      status: 'success',
      data: listing
    });
  } catch (error) {
    logger.error('Error creating listing', { error: error.message });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    if (error.message.includes('Only the creator or a contributor')) {
      return res.status(403).json({
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
 * Get a listing by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await marketplaceService.getListing(id);
    
    return res.status(200).json({
      status: 'success',
      data: listing
    });
  } catch (error) {
    logger.error('Error getting listing', { error: error.message, id: req.params.id });
    
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
 * List available listings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const listListings = async (req, res) => {
  try {
    const { datasetId, seller, licenseType, status, page, limit } = req.query;
    
    const filters = {
      datasetId,
      seller,
      licenseType,
      status
    };
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const result = await marketplaceService.listListings(filters, pageNum, limitNum);
    
    return res.status(200).json({
      status: 'success',
      data: result.listings,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error listing listings', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Update a listing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, licenseType, duration, terms, status } = req.body;
    
    const updates = {};
    
    if (price !== undefined) updates.price = price;
    if (licenseType !== undefined) updates.licenseType = licenseType;
    if (duration !== undefined) updates.duration = parseInt(duration);
    if (terms !== undefined) updates.terms = terms;
    if (status !== undefined) updates.status = status;
    
    const updatedListing = await marketplaceService.updateListing(id, updates, req.user.walletAddress);
    
    return res.status(200).json({
      status: 'success',
      data: updatedListing
    });
  } catch (error) {
    logger.error('Error updating listing', { error: error.message, id: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    if (error.message.includes('Only the seller')) {
      return res.status(403).json({
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
 * Purchase a listing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const purchaseListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionHash } = req.body;
    
    const purchase = await marketplaceService.purchaseListing(id, {
      buyer: req.user.walletAddress,
      transactionHash
    });
    
    return res.status(200).json({
      status: 'success',
      data: purchase
    });
  } catch (error) {
    logger.error('Error purchasing listing', { error: error.message, id: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    if (error.message.includes('Cannot purchase an inactive') || 
        error.message.includes('has expired')) {
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
 * Verify access to a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyAccess = async (req, res) => {
  try {
    const { datasetId, accessToken } = req.body;
    
    if (!datasetId || !accessToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Dataset ID and access token are required'
      });
    }
    
    const accessResult = await marketplaceService.verifyAccess(datasetId, accessToken);
    
    return res.status(200).json({
      status: 'success',
      data: accessResult
    });
  } catch (error) {
    logger.error('Error verifying access', { error: error.message });
    
    return res.status(401).json({
      status: 'error',
      message: error.message,
      hasAccess: false
    });
  }
};

/**
 * Get user purchases
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserPurchases = async (req, res) => {
  try {
    const { page, limit } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const result = await marketplaceService.getUserPurchases(
      req.user.walletAddress,
      pageNum,
      limitNum
    );
    
    return res.status(200).json({
      status: 'success',
      data: result.purchases,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error getting user purchases', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
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