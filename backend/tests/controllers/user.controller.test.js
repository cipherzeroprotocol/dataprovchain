/**
 * User controller test
 */
const userController = require('../../src/controllers/user.controller');
const authService = require('../../src/services/auth.service');
const { mockRequest, mockResponse, generateMockUser } = require('../utils/test-helpers');

// Mock the auth service
jest.mock('../../src/services/auth.service');

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('generateChallenge', () => {
    it('should return a challenge when given a valid address', async () => {
      // Setup
      const req = mockRequest({
        body: { address: '0x1234567890abcdef' }
      });
      const res = mockResponse();
      
      const mockChallenge = {
        message: 'Sign this message to authenticate',
        expiresAt: new Date().toISOString()
      };
      
      authService.generateChallenge.mockResolvedValue(mockChallenge);
      
      // Execute
      await userController.generateChallenge(req, res);
      
      // Assert
      expect(authService.generateChallenge).toHaveBeenCalledWith('0x1234567890abcdef');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockChallenge
      });
    });
    
    it('should return 400 when address is missing', async () => {
      // Setup
      const req = mockRequest({
        body: {}
      });
      const res = mockResponse();
      
      // Execute
      await userController.generateChallenge(req, res);
      
      // Assert
      expect(authService.generateChallenge).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Wallet address is required'
      });
    });
  });
  
  describe('authenticateWithWallet', () => {
    it('should authenticate a user with valid signature', async () => {
      // Setup
      const req = mockRequest({
        body: {
          address: '0x1234567890abcdef',
          signature: '0xsignature'
        }
      });
      const res = mockResponse();
      
      const mockUser = generateMockUser();
      const mockToken = 'jwt_token';
      
      authService.authenticateWithWallet.mockResolvedValue({
        user: mockUser,
        token: mockToken
      });
      
      // Execute
      await userController.authenticateWithWallet(req, res);
      
      // Assert
      expect(authService.authenticateWithWallet).toHaveBeenCalledWith(
        '0x1234567890abcdef',
        '0xsignature'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser, token: mockToken }
      });
    });
    
    it('should return 400 when parameters are missing', async () => {
      // Setup
      const req = mockRequest({
        body: { address: '0x1234567890abcdef' }
      });
      const res = mockResponse();
      
      // Execute
      await userController.authenticateWithWallet(req, res);
      
      // Assert
      expect(authService.authenticateWithWallet).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Address and signature are required'
      });
    });
    
    it('should return 401 when authentication fails', async () => {
      // Setup
      const req = mockRequest({
        body: {
          address: '0x1234567890abcdef',
          signature: '0xsignature'
        }
      });
      const res = mockResponse();
      
      const errorMessage = 'Invalid signature';
      authService.authenticateWithWallet.mockRejectedValue(new Error(errorMessage));
      
      // Execute
      await userController.authenticateWithWallet(req, res);
      
      // Assert
      expect(authService.authenticateWithWallet).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: errorMessage
      });
    });
  });
  
  describe('getCurrentUser', () => {
    it('should return the current user profile', async () => {
      // Setup
      const mockUser = generateMockUser();
      const req = mockRequest({
        user: { id: mockUser.id }
      });
      const res = mockResponse();
      
      authService.getUserById.mockResolvedValue(mockUser);
      
      // Execute
      await userController.getCurrentUser(req, res);
      
      // Assert
      expect(authService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser
      });
    });
  });
});
