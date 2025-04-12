/**
 * Authentication service
 */
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const crypto = require('crypto');
const authConfig = require('../config/auth');
const web3Utils = require('../utils/web3');
const cryptoUtils = require('../utils/crypto');
const logger = require('../utils/logger');
const DB = require('../models');

// Store for challenge messages (in real production, use Redis)
const challengeStore = new Map();

/**
 * Generate an authentication challenge for web3 authentication
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} - Challenge object
 */
const generateChallenge = async (address) => {
  if (!web3Utils.isValidAddress(address)) {
    throw new Error('Invalid wallet address');
  }
  
  const challenge = cryptoUtils.generateChallenge(address);
  
  // Store the challenge
  challengeStore.set(address.toLowerCase(), challenge);
  
  logger.info('Authentication challenge generated', { address });
  
  return {
    message: challenge.message,
    expiresAt: new Date(challenge.expirationTime).toISOString()
  };
};

/**
 * Verify a signed challenge
 * @param {string} address - Wallet address
 * @param {string} signature - Signed message
 * @returns {Promise<boolean>} - Whether the signature is valid
 */
const verifyChallenge = async (address, signature) => {
  address = address.toLowerCase();
  
  const challenge = challengeStore.get(address);
  if (!challenge) {
    throw new Error('No challenge found for this address. Please request a new challenge.');
  }
  
  // Check if challenge has expired
  if (Date.now() > challenge.expirationTime) {
    challengeStore.delete(address);
    throw new Error('Challenge has expired. Please request a new challenge.');
  }
  
  // Verify signature
  const isValid = web3Utils.verifyPersonalSignature(address, challenge.message, signature);
  
  // Delete the challenge to prevent replay attacks
  challengeStore.delete(address);
  
  if (!isValid) {
    logger.warn('Invalid signature', { address });
    throw new Error('Invalid signature');
  }
  
  logger.info('Challenge verified successfully', { address });
  return true;
};

/**
 * Register a new user
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.walletAddress - Wallet address
 * @returns {Promise<Object>} - Created user
 */
const registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await DB.User.findOne({
      where: {
        [DB.Sequelize.Op.or]: [
          { email: userData.email },
          { walletAddress: userData.walletAddress.toLowerCase() },
          { username: userData.username }
        ]
      }
    });
    
    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new Error('Email already in use');
      }
      if (existingUser.walletAddress === userData.walletAddress.toLowerCase()) {
        throw new Error('Wallet address already registered');
      }
      if (existingUser.username === userData.username) {
        throw new Error('Username already taken');
      }
    }
    
    // Create user
    const user = await DB.User.create({
      username: userData.username,
      email: userData.email,
      walletAddress: userData.walletAddress.toLowerCase(),
      role: 'user',
      verified: false, // Require email verification
      apiKey: cryptoUtils.generateApiKey()
    });
    
    logger.info('User registered', { id: user.id, walletAddress: user.walletAddress });
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt
    };
  } catch (error) {
    logger.error('Error registering user', { error: error.message });
    throw error;
  }
};

/**
 * Authenticate a user with wallet signature
 * @param {string} address - Wallet address
 * @param {string} signature - Signed message
 * @returns {Promise<Object>} - Authentication result with token
 */
const authenticateWithWallet = async (address, signature) => {
  try {
    // Verify signature
    await verifyChallenge(address, signature);
    
    // Find user
    let user = await DB.User.findOne({
      where: { walletAddress: address.toLowerCase() }
    });
    
    // Create user if not exists
    if (!user) {
      const username = `user_${address.substring(2, 8)}`;
      
      user = await DB.User.create({
        username,
        email: null,
        walletAddress: address.toLowerCase(),
        role: 'user',
        verified: true, // Wallet auth is inherently verified
        apiKey: cryptoUtils.generateApiKey()
      });
      
      logger.info('New user created via wallet authentication', { 
        id: user.id, 
        walletAddress: user.walletAddress 
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Update last login
    await user.update({ lastLogin: new Date() });
    
    logger.info('User authenticated with wallet', { 
      id: user.id, 
      walletAddress: user.walletAddress 
    });
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        verified: user.verified
      },
      token
    };
  } catch (error) {
    logger.error('Authentication failed', { error: error.message, address });
    throw error;
  }
};

/**
 * Generate a JWT token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    walletAddress: user.walletAddress,
    role: user.role
  };
  
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: `${authConfig.jwtExpirationInterval}m`
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Decoded token payload
 */
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    
    // Check if user still exists
    const user = await DB.User.findByPk(decoded.id);
    if (!user) {
      throw new Error('User no longer exists');
    }
    
    return decoded;
  } catch (error) {
    logger.error('Token verification failed', { error: error.message });
    throw new Error('Invalid token');
  }
};

/**
 * Get a user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} - User object
 */
const getUserById = async (id) => {
  try {
    const user = await DB.User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt
    };
  } catch (error) {
    logger.error('Error getting user by ID', { error: error.message, id });
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated user
 */
const updateUserProfile = async (id, updateData) => {
  try {
    const user = await DB.User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Only allow updating certain fields
    const allowedUpdates = {
      username: updateData.username,
      email: updateData.email,
      bio: updateData.bio,
      avatarUrl: updateData.avatarUrl
    };
    
    // Filter out undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });
    
    // Check if username is taken
    if (allowedUpdates.username) {
      const existingUser = await DB.User.findOne({
        where: { username: allowedUpdates.username }
      });
      
      if (existingUser && existingUser.id !== id) {
        throw new Error('Username already taken');
      }
    }
    
    // Check if email is taken
    if (allowedUpdates.email) {
      const existingUser = await DB.User.findOne({
        where: { email: allowedUpdates.email }
      });
      
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use');
      }
      
      // If email is changing, mark as unverified
      if (user.email !== allowedUpdates.email) {
        allowedUpdates.verified = false;
      }
    }
    
    await user.update(allowedUpdates);
    
    logger.info('User profile updated', { id });
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      verified: user.verified,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    logger.error('Error updating user profile', { error: error.message, id });
    throw error;
  }
};

/**
 * Validate API key
 * @param {string} apiKey - API key
 * @returns {Promise<Object>} - User object
 */
const validateApiKey = async (apiKey) => {
  try {
    const user = await DB.User.findOne({
      where: { apiKey }
    });
    
    if (!user) {
      throw new Error('Invalid API key');
    }
    
    return {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      role: user.role
    };
  } catch (error) {
    logger.error('API key validation failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  generateChallenge,
  verifyChallenge,
  registerUser,
  authenticateWithWallet,
  generateToken,
  verifyToken,
  getUserById,
  updateUserProfile,
  validateApiKey
};