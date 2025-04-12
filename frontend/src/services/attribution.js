import api from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get attributions with optional filtering
 * @param {Object} filters - Filter parameters
 * @param {string} [filters.datasetId] - Filter by dataset ID
 * @param {string} [filters.modelId] - Filter by model ID
 * @param {string} [filters.creator] - Filter by creator
 * @param {string} [filters.usageType] - Filter by usage type
 * @param {string} [filters.status] - Filter by status (verified, pending)
 * @param {string} [filters.searchQuery] - Search in attributions
 * @returns {Promise<Array>} Attribution records
 */
export const getAttributions = async (filters = {}) => {
  try {
    return await api.get(API_ENDPOINTS.ATTRIBUTION.BASE, { params: filters });
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch attributions');
  }
};

/**
 * Get attributions for a specific dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Array>} Attribution records for the dataset
 */
export const getDatasetAttributions = async (datasetId) => {
  try {
    return await api.get(`${API_ENDPOINTS.ATTRIBUTION.DATASETS}/${datasetId}/attributions`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch dataset attributions');
  }
};

/**
 * Get specific attribution by ID
 * @param {string} id - Attribution ID
 * @returns {Promise<Object>} Attribution details
 */
export const getAttribution = async (id) => {
  try {
    return await api.get(`${API_ENDPOINTS.ATTRIBUTION.BASE}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch attribution details');
  }
};

/**
 * Create a new attribution record
 * @param {Object} attributionData - Attribution data
 * @param {string} attributionData.datasetId - Dataset ID
 * @param {string} attributionData.modelId - Model ID
 * @param {string} attributionData.modelName - Model name
 * @param {string} attributionData.usageType - Type of usage (training, fine-tuning, etc.)
 * @param {string} attributionData.description - Description of how the dataset was used
 * @param {number} [attributionData.impactScore] - Impact score of the dataset on the model
 * @param {Object} [attributionData.metadata] - Additional metadata
 * @returns {Promise<Object>} Created attribution record
 */
export const createAttribution = async (attributionData) => {
  try {
    return await api.post(API_ENDPOINTS.ATTRIBUTION.BASE, attributionData);
  } catch (error) {
    throw new Error(error.message || 'Failed to create attribution record');
  }
};

/**
 * Update an existing attribution record
 * @param {string} id - Attribution ID
 * @param {Object} data - Updated attribution data
 * @returns {Promise<Object>} Updated attribution record
 */
export const updateAttribution = async (id, data) => {
  try {
    return await api.put(`${API_ENDPOINTS.ATTRIBUTION.BASE}/${id}`, data);
  } catch (error) {
    throw new Error(error.message || 'Failed to update attribution record');
  }
};

/**
 * Delete an attribution record
 * @param {string} id - Attribution ID
 * @returns {Promise<Object>} Result of the deletion
 */
export const deleteAttribution = async (id) => {
  try {
    return await api.delete(`${API_ENDPOINTS.ATTRIBUTION.BASE}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to delete attribution record');
  }
};

/**
 * Verify an attribution record
 * @param {string} id - Attribution ID
 * @returns {Promise<Object>} Verification result
 */
export const verifyAttribution = async (id) => {
  try {
    return await api.post(`${API_ENDPOINTS.ATTRIBUTION.BASE}/${id}/verify`);
  } catch (error) {
    throw new Error(error.message || 'Failed to verify attribution');
  }
};

/**
 * Get royalty information for all datasets
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Royalty information
 */
export const getRoyalties = async (filters = {}) => {
  try {
    return await api.get(API_ENDPOINTS.ATTRIBUTION.ROYALTIES, { params: filters });
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch royalty information');
  }
};

/**
 * Get royalty information for a specific dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} Dataset royalty information
 */
export const getDatasetRoyalties = async (datasetId) => {
  try {
    return await api.get(`${API_ENDPOINTS.ATTRIBUTION.DATASETS}/${datasetId}/royalties`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch dataset royalty information');
  }
};

/**
 * Distribute royalties for a dataset
 * @param {string} datasetId - Dataset ID
 * @param {number} amount - Amount to distribute
 * @returns {Promise<Object>} Distribution result
 */
export const distributeRoyalties = async (datasetId, amount) => {
  try {
    return await api.post(`${API_ENDPOINTS.ATTRIBUTION.DATASETS}/${datasetId}/distribute`, { amount });
  } catch (error) {
    throw new Error(error.message || 'Failed to distribute royalties');
  }
};

/**
 * Add a contributor to a dataset
 * @param {string} datasetId - Dataset ID
 * @param {Object} contributor - Contributor data
 * @param {string} contributor.id - Contributor ID
 * @param {string} contributor.name - Contributor name
 * @param {string} contributor.walletAddress - Contributor wallet address
 * @param {number} contributor.share - Contributor share percentage
 * @returns {Promise<Object>} Added contributor
 */
export const addContributor = async (datasetId, contributor) => {
  try {
    return await api.post(`${API_ENDPOINTS.ATTRIBUTION.DATASETS}/${datasetId}/contributors`, contributor);
  } catch (error) {
    throw new Error(error.message || 'Failed to add contributor');
  }
};

/**
 * Update a contributor's information
 * @param {string} datasetId - Dataset ID
 * @param {string} contributorId - Contributor ID
 * @param {Object} updates - Updated data
 * @returns {Promise<Object>} Updated contributor
 */
export const updateContributor = async (datasetId, contributorId, updates) => {
  try {
    return await api.put(
      `${API_ENDPOINTS.ATTRIBUTION.DATASETS}/${datasetId}/contributors/${contributorId}`, 
      updates
    );
  } catch (error) {
    throw new Error(error.message || 'Failed to update contributor');
  }
};

/**
 * Get attribution statistics
 * @param {string} [datasetId] - Optional dataset ID to get stats for specific dataset
 * @returns {Promise<Object>} Attribution statistics
 */
export const getAttributionStats = async (datasetId = null) => {
  try {
    const endpoint = datasetId 
      ? `${API_ENDPOINTS.ATTRIBUTION.DATASETS}/${datasetId}/stats`
      : `${API_ENDPOINTS.ATTRIBUTION.STATS}`;
    
    return await api.get(endpoint);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch attribution statistics');
  }
};