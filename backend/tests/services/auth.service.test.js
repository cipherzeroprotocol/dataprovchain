/**
 * Auth service test
 */
const jwt = require('jsonwebtoken');
const authService = require('../../src/services/auth.service');
const web3Utils = require('../../src/utils/web3');
const cryptoUtils = require('../../src/utils/crypto');
const { generateMockUser } = require('../utils/test-helpers');

// Mock the required dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/utils/web3');
jest.mock('../../src/utils/crypto');
jest.mock('../../src/models');

const DB = require('../../src/models');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('generateChallenge', () => {
    it('should generate a challenge for a valid address', async () => {
      // Setup
      const address = '0x1234567890abcdef';
      const mockChallenge = {
        message: 'Sign this message to authenticate: abc123',
        expirationTime: Date.now() + 300000, // 5 minutes
        nonce: 'abc123'
      };
      
      web3Utils.isValidAddress.mockReturnValue(true);
      cryptoUtils.generateChallenge.mockReturnValue(mockChallenge);
      
      // Execute
      const result = await authService.generateChallenge(address);
      
      // Assert
      expect(web3Utils.isValidAddress).toHaveBeenCalledWith(address);
      expect(cryptoUtils.generateChallenge).toHaveBeenCalledWith(address);
      expect(result).toEqual({
        message: mockChallenge.message,
        expiresAt: new Date(mockChallenge.expirationTime).toISOString()
      });
    });
    
    it('should throw an error for an invalid address', async () => {
      // Setup
      const address = 'invalid-address';
      web3Utils.isValidAddress.mockReturnValue(false);
      
      // Execute & Assert
      await expect(authService.generateChallenge(address)).rejects.toThrow('Invalid wallet address');
      expect(web3Utils.isValidAddress).toHaveBeenCalledWith(address);
      expect(cryptoUtils.generateChallenge).not.toHaveBeenCalled();
    });
  });
  
  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      // Setup
      const userId = '123';
      const mockUser = generateMockUser({ id: userId });
      
      DB.User.findByPk.mockResolvedValue(mockUser);
      
      // Execute
      const result = await authService.getUserById(userId);
      
      // Assert
      expect(DB.User.findByPk).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        walletAddress: mockUser.walletAddress,
        role: mockUser.role,
        verified: mockUser.verified,
        createdAt: mockUser.createdAt
      });
    });
    
    it('should throw an error when user not found', async () => {
      // Setup
      const userId = 'non-existent';
      DB.User.findByPk.mockResolvedValue(null);
      
      // Execute & Assert
      await expect(authService.getUserById(userId)).rejects.toThrow('User not found');
      expect(DB.User.findByPk).toHaveBeenCalledWith(userId);
    });
  });
  
  describe('generateToken', () => {
    it('should generate a JWT token for a user', () => {
      // Setup
      const mockUser = generateMockUser();
      const mockToken = 'jwt_token';
      
      jwt.sign.mockReturnValue(mockToken);
      
      // Execute
      const result = authService.generateToken(mockUser);
      
      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          walletAddress: mockUser.walletAddress,
          role: mockUser.role
        },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(result).toBe(mockToken);
    });
  });
});
