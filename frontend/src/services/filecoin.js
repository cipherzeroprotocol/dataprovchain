import api from './api';
import { API_ENDPOINTS } from '../constants/api';
import * as contracts from './contracts';

/**
 * Create a Filecoin storage deal
 * @param {string} datasetId - Dataset ID
 * @param {string} cid - IPFS content identifier
 * @param {number} [duration=525600] - Deal duration in minutes (default 1 year)
 * @returns {Promise<Object>} Created Filecoin deal information
 */
export const createStorageDeal = async (datasetId, cid, duration = 525600) => {
  try {
    return await api.post(API_ENDPOINTS.FILECOIN.DEALS, {
      datasetId,
      cid,
      duration
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to create Filecoin storage deal');
  }
};

/**
 * Get deals for a dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Array>} List of storage deals
 */
export const getDatasetDeals = async (datasetId) => {
  try {
    return await api.get(`${API_ENDPOINTS.FILECOIN.DATASETS}/${datasetId}/deals`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch dataset deals');
  }
};

/**
 * Get a specific deal by ID
 * @param {string} dealId - Deal ID
 * @returns {Promise<Object>} Deal details
 */
export const getDeal = async (dealId) => {
  try {
    return await api.get(`${API_ENDPOINTS.FILECOIN.DEALS}/${dealId}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch deal details');
  }
};

/**
 * Check deal status
 * @param {string} dealId - Deal ID
 * @returns {Promise<Object>} Deal status
 */
export const checkDealStatus = async (dealId) => {
  try {
    return await api.get(`${API_ENDPOINTS.FILECOIN.DEALS}/${dealId}/status`);
  } catch (error) {
    throw new Error(error.message || 'Failed to check deal status');
  }
};

/**
 * Renew a storage deal
 * @param {string} dealId - Deal ID
 * @param {number} [duration=525600] - Additional duration in minutes (default 1 year)
 * @returns {Promise<Object>} Updated deal information
 */
export const renewDeal = async (dealId, duration = 525600) => {
  try {
    return await api.post(`${API_ENDPOINTS.FILECOIN.DEALS}/${dealId}/renew`, { duration });
  } catch (error) {
    throw new Error(error.message || 'Failed to renew storage deal');
  }
};

/**
 * Retrieve data from a Filecoin deal
 * @param {string} dealId - Deal ID
 * @returns {Promise<Object>} Retrieval information
 */
export const retrieveData = async (dealId) => {
  try {
    return await api.post(`${API_ENDPOINTS.FILECOIN.DEALS}/${dealId}/retrieve`);
  } catch (error) {
    throw new Error(error.message || 'Failed to retrieve data from Filecoin');
  }
};

/**
 * Get deal cost estimate
 * @param {number} size - Size in bytes
 * @param {number} [duration=525600] - Deal duration in minutes
 * @returns {Promise<Object>} Cost estimate
 */
export const getDealCostEstimate = async (size, duration = 525600) => {
  try {
    return await api.get(`${API_ENDPOINTS.FILECOIN.COST_ESTIMATE}?size=${size}&duration=${duration}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to get cost estimate');
  }
};

/**
 * Create a Car file from an IPFS CID
 * @param {string} cid - IPFS content identifier
 * @returns {Promise<Object>} CAR file information
 */
export const createCarFile = async (cid) => {
  try {
    return await api.post(API_ENDPOINTS.FILECOIN.CREATE_CAR, { cid });
  } catch (error) {
    throw new Error(error.message || 'Failed to create CAR file');
  }
};

/**
 * Verify a Filecoin deal on-chain
 * @param {string} dealId - Deal ID
 * @returns {Promise<Object>} Verification result
 */
export const verifyDealOnChain = async (dealId) => {
  try {
    // First get deal information from API
    const deal = await getDeal(dealId);
    
    // Then verify on-chain using the contract
    await contracts.initContracts(true);
    const result = await contracts.filecoinDealClient.verifyDeal(deal.chainDealId);
    
    return {
      verified: result,
      deal: deal
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to verify deal on-chain');
  }
};

/**
 * Get storage statistics for a dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} Storage statistics
 */
export const getStorageStats = async (datasetId) => {
  try {
    return await api.get(`${API_ENDPOINTS.FILECOIN.DATASETS}/${datasetId}/stats`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch storage statistics');
  }
};