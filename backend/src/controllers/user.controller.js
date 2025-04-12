/**
 * User controller
 */
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * Generate authentication challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateChallenge = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        status: 'error',
        message: 'Wallet address is required'
      });
    }
    
    const challenge = await authService.generateChallenge(address);
    
    return res.status(200).json({
      status: 'success',
      data: challenge
    });
  } catch (error) {
    logger.error('Error generating challenge', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Authenticate user with wallet signature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const authenticateWithWallet = async (req, res) => {
  try {
    const { address, signature } = req.body;
    
    if (!address || !signature) {
      return res.status(400).json({
        status: 'error',
        message: 'Address and signature are required'
      });
    }
    
    const result = await authService.authenticateWithWallet(address, signature);
    
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    
    return res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, walletAddress } = req.body;
    
    const user = await authService.registerUser({
      username,
      email,
      walletAddress
    });
    
    return res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    
    if (error.message.includes('already in use') || 
        error.message.includes('already registered') ||
        error.message.includes('already taken')) {
      return res.status(409).json({
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
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    
    return res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    logger.error('Error getting user profile', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserProfile = async (req, res) => {
  try {
    const { username, email, bio, avatarUrl } = req.body;
    
    const updatedUser = await authService.updateUserProfile(req.user.id, {
      username,
      email,
      bio,
      avatarUrl
    });
    
    return res.status(200).json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user profile', { error: error.message });
    
    if (error.message.includes('already taken') || 
        error.message.includes('already in use')) {
      return res.status(409).json({
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
 * Refresh API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshApiKey = async (req, res) => {
  try {
    const apiKey = await authService.refreshApiKey(req.user.id);
    
    return res.status(200).json({
      status: 'success',
      data: {
        apiKey
      }
    });
  } catch (error) {
    logger.error('Error refreshing API key', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  generateChallenge,
  authenticateWithWallet,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  refreshApiKey
};