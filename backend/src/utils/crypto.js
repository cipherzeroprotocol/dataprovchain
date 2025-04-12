/**
 * Cryptographic utilities
 */
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const authConfig = require('../config/auth');

/**
 * Generate a random challenge for Web3 authentication
 * @param {string} address - Wallet address requesting the challenge
 * @returns {Object} - Challenge object with message and expiration
 */
const generateChallenge = (address) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const expirationTime = timestamp + (authConfig.challengeExpirationMinutes * 60 * 1000);
  
  const message = `Sign this message to authenticate with DataProvChain: ${nonce}`;
  
  return {
    message,
    expirationTime,
    nonce
  };
};

/**
 * Hash a password using bcrypt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, authConfig.saltRounds);
};

/**
 * Verify a password against a hash
 * @param {string} password - The password to verify
 * @param {string} hash - The hash to verify against
 * @returns {Promise<boolean>} - Whether the password is valid
 */
const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Create a SHA-256 hash of data
 * @param {string|Buffer} data - The data to hash
 * @returns {string} - The hex-encoded hash
 */
const sha256 = (data) => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
};

/**
 * Generate a random API key
 * @returns {string} - The generated API key
 */
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateChallenge,
  hashPassword,
  verifyPassword,
  sha256,
  generateApiKey
};