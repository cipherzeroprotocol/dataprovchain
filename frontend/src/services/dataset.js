import api from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get datasets with optional filtering
 * @param {Object} filters - Filter parameters for datasets
 * @param {string} [filters.dataType] - Filter by data type
 * @param {boolean} [filters.verified] - Filter by verification status
 * @param {string} [filters.creator] - Filter by creator ID
 * @param {string} [filters.license] - Filter by license type
 * @param {Array} [filters.tags] - Filter by tags
 * @param {string} [filters.searchQuery] - Search by name or description
 * @param {number} [filters.page=1] - Page number
 * @param {number} [filters.limit=10] - Items per page
 * @param {string} [filters.sortBy='createdAt'] - Sort field
 * @param {string} [filters.sortOrder='desc'] - Sort order
 * @returns {Promise<Object>} Datasets and pagination data
 */
export const getDatasets = async (filters = {}) => {
  try {
    return await api.get(API_ENDPOINTS.DATASETS.BASE, { params: filters });
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch datasets');
  }
};

/**
 * Get a specific dataset by ID
 * @param {string} id - Dataset ID
 * @returns {Promise<Object>} Dataset details
 */
export const getDataset = async (id) => {
  try {
    return await api.get(`${API_ENDPOINTS.DATASETS.BASE}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch dataset details');
  }
};

/**
 * Create a new dataset
 * @param {Object} datasetData - Dataset data
 * @param {string} datasetData.name - Dataset name
 * @param {string} datasetData.description - Dataset description
 * @param {string} datasetData.dataType - Type of data
 * @param {string} datasetData.license - License type
 * @param {Array} datasetData.tags - Tags for the dataset
 * @param {Object} [datasetData.metadata] - Additional metadata
 * @returns {Promise<Object>} Created dataset
 */
export const createDataset = async (datasetData) => {
  try {
    return await api.post(API_ENDPOINTS.DATASETS.BASE, datasetData);
  } catch (error) {
    throw new Error(error.message || 'Failed to create dataset');
  }
};

/**
 * Update an existing dataset
 * @param {string} id - Dataset ID
 * @param {Object} data - Updated dataset data
 * @returns {Promise<Object>} Updated dataset
 */
export const updateDataset = async (id, data) => {
  try {
    return await api.put(`${API_ENDPOINTS.DATASETS.BASE}/${id}`, data);
  } catch (error) {
    throw new Error(error.message || 'Failed to update dataset');
  }
};

/**
 * Delete a dataset
 * @param {string} id - Dataset ID
 * @returns {Promise<Object>} Result of the deletion
 */
export const deleteDataset = async (id) => {
  try {
    return await api.delete(`${API_ENDPOINTS.DATASETS.BASE}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to delete dataset');
  }
};

/**
 * Upload files to a dataset
 * @param {string} id - Dataset ID
 * @param {Array<File>} files - Array of files to upload
 * @param {Function} [onProgress] - Optional progress callback
 * @returns {Promise<Object>} Updated dataset with files
 */
export const uploadDatasetFiles = async (id, files, onProgress = null) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    // Add progress event listener if callback provided
    if (onProgress) {
      config.onUploadProgress = progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }

    return await api.post(`${API_ENDPOINTS.DATASETS.BASE}/${id}/files`, formData, config);
  } catch (error) {
    throw new Error(error.message || 'Failed to upload dataset files');
  }
};

/**
 * Publish dataset to the marketplace
 * @param {string} id - Dataset ID
 * @param {Object} marketplaceData - Marketplace listing data
 * @returns {Promise<Object>} Result containing published dataset and marketplace listing
 */
export const publishDataset = async (id, marketplaceData) => {
  try {
    return await api.post(`${API_ENDPOINTS.DATASETS.BASE}/${id}/publish`, marketplaceData);
  } catch (error) {
    throw new Error(error.message || 'Failed to publish dataset to marketplace');
  }
};

/**
 * Verify a dataset's integrity and provenance
 * @param {string} id - Dataset ID
 * @returns {Promise<Object>} Verification result
 */
export const verifyDataset = async (id) => {
  try {
    return await api.post(`${API_ENDPOINTS.DATASETS.BASE}/${id}/verify`);
  } catch (error) {
    throw new Error(error.message || 'Failed to verify dataset');
  }
};

/**
 * Get datasets owned by the current user
 * @returns {Promise<Array>} List of user's datasets
 */
export const getUserDatasets = async () => {
  try {
    return await api.get(API_ENDPOINTS.DATASETS.USER);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch user datasets');
  }
};

/**
 * Get datasets purchased by the current user
 * @returns {Promise<Array>} List of purchased datasets
 */
export const getPurchasedDatasets = async () => {
  try {
    return await api.get(API_ENDPOINTS.DATASETS.PURCHASED);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch purchased datasets');
  }
};

/**
 * Download a dataset file
 * @param {string} datasetId - Dataset ID
 * @param {string} fileId - File ID
 * @returns {Promise<Blob>} File blob for downloading
 */
export const downloadDatasetFile = async (datasetId, fileId) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.DATASETS.BASE}/${datasetId}/files/${fileId}/download`, 
      { responseType: 'blob' }
    );
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to download file');
  }
};