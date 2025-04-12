import api from './api';
import { API_ENDPOINTS } from '../constants/api';
import { signMessage } from '../utils/web3';

/**
 * Register a new user
 * @param {Object} userData User data
 * @param {string} userData.username Username
 * @param {string} userData.email Email
 * @param {string} userData.walletAddress Wallet address
 * @returns {Promise<Object>} Registered user data
 */
export const register = async (userData) => {
  try {
    return await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Login with wallet
 * @param {string} walletAddress Wallet address
 * @param {Object} signer Ethers signer
 * @returns {Promise<Object>} User data and token
 */
export const loginWithWallet = async (walletAddress, signer) => {
  try {
    // Step 1: Get nonce from server
    const { nonce } = await api.post(`${API_ENDPOINTS.AUTH.LOGIN}/nonce`, { walletAddress });
    
    // Step 2: Sign the nonce
    const message = `Sign this message to authenticate with DataProvChain. Nonce: ${nonce}`;
    const signature = await signMessage(message, signer);
    
    // Step 3: Verify signature and login
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      walletAddress,
      signature
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Get the current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    return await api.get(API_ENDPOINTS.AUTH.PROFILE);
  } catch (error) {
    throw new Error(error.message || 'Failed to get user profile');
  }
};

/**
 * Logout the current user
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
};

/**
 * Check if the user is authenticated
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};
