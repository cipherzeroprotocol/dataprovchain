/**
 * Test helper utilities
 */
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authConfig = require('../../src/config/auth');

/**
 * Generate a mock user
 * @param {Object} [overrides] - Optional field overrides
 * @returns {Object} - Mock user object
 */
const generateMockUser = (overrides = {}) => {
  return {
    id: uuidv4(),
    username: `user_${Math.random().toString(36).substring(2, 10)}`,
    email: `test_${Math.random().toString(36).substring(2, 10)}@example.com`,
    walletAddress: `0x${Math.random().toString(36).substring(2, 10)}`,
    role: 'user',
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

/**
 * Generate a mock dataset
 * @param {Object} [overrides] - Optional field overrides
 * @returns {Object} - Mock dataset object
 */
const generateMockDataset = (overrides = {}) => {
  return {
    id: uuidv4(),
    name: `Dataset ${Math.random().toString(36).substring(2, 10)}`,
    description: 'Test dataset description',
    dataType: 'text',
    cid: `bafybeig${Math.random().toString(36).substring(2, 30)}`,
    tokenId: Math.floor(Math.random() * 1000).toString(),
    license: 'CC-BY-4.0',
    creator: `0x${Math.random().toString(36).substring(2, 10)}`,
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

/**
 * Generate a valid JWT token for testing
 * @param {Object} user - User object to encode in the token
 * @returns {string} - JWT token
 */
const generateAuthToken = (user) => {
  const payload = {
    id: user.id,
    walletAddress: user.walletAddress,
    role: user.role
  };
  
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: '1h'
  });
};

/**
 * Create a mock request object
 * @param {Object} [options] - Request options
 * @param {Object} [options.body] - Request body
 * @param {Object} [options.params] - Request params
 * @param {Object} [options.query] - Request query
 * @param {Object} [options.user] - Authenticated user
 * @param {Object} [options.headers] - Request headers
 * @returns {Object} - Mock request object
 */
const mockRequest = (options = {}) => {
  const req = {};
  req.body = options.body || {};
  req.params = options.params || {};
  req.query = options.query || {};
  req.user = options.user || null;
  req.headers = options.headers || {};
  return req;
};

/**
 * Create a mock response object
 * @returns {Object} - Mock response object with jest spies
 */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.download = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

module.exports = {
  generateMockUser,
  generateMockDataset,
  generateAuthToken,
  mockRequest,
  mockResponse
};
