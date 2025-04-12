import api from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get provenance records with optional filtering
 * @param {Object} filters - Filter parameters
 * @param {string} [filters.datasetId] - Filter by dataset ID
 * @param {string} [filters.actionType] - Filter by action type
 * @param {string} [filters.actor] - Filter by actor/performer
 * @param {Date} [filters.startDate] - Filter by start date
 * @param {Date} [filters.endDate] - Filter by end date
 * @param {string} [filters.searchQuery] - Search in provenance records
 * @returns {Promise<Array>} Provenance records
 */
export const getProvenanceRecords = async (filters = {}) => {
  try {
    return await api.get(API_ENDPOINTS.PROVENANCE.RECORDS, { params: filters });
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch provenance records');
  }
};

/**
 * Get provenance records for a specific dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Array>} Provenance records for the dataset
 */
export const getDatasetProvenance = async (datasetId) => {
  try {
    return await api.get(`${API_ENDPOINTS.PROVENANCE.DATASETS}/${datasetId}/records`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch dataset provenance');
  }
};

/**
 * Get specific provenance record by ID
 * @param {string} id - Provenance record ID
 * @returns {Promise<Object>} Provenance record details
 */
export const getProvenanceRecord = async (id) => {
  try {
    return await api.get(`${API_ENDPOINTS.PROVENANCE.RECORDS}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch provenance record');
  }
};

/**
 * Create a new provenance record
 * @param {Object} recordData - Provenance record data
 * @param {string} recordData.datasetId - Dataset ID
 * @param {string} recordData.actionType - Type of action (create, update, transform, etc.)
 * @param {string} recordData.description - Description of the provenance action
 * @param {Object} [recordData.metadata] - Additional metadata about the action
 * @param {string} [recordData.parentId] - Parent record ID if derived from another dataset
 * @returns {Promise<Object>} Created provenance record
 */
export const createProvenanceRecord = async (recordData) => {
  try {
    return await api.post(API_ENDPOINTS.PROVENANCE.RECORDS, recordData);
  } catch (error) {
    throw new Error(error.message || 'Failed to create provenance record');
  }
};

/**
 * Update an existing provenance record
 * @param {string} id - Provenance record ID
 * @param {Object} data - Updated record data
 * @returns {Promise<Object>} Updated provenance record
 */
export const updateProvenanceRecord = async (id, data) => {
  try {
    return await api.put(`${API_ENDPOINTS.PROVENANCE.RECORDS}/${id}`, data);
  } catch (error) {
    throw new Error(error.message || 'Failed to update provenance record');
  }
};

/**
 * Delete a provenance record
 * @param {string} id - Provenance record ID
 * @returns {Promise<Object>} Result of the deletion
 */
export const deleteProvenanceRecord = async (id) => {
  try {
    return await api.delete(`${API_ENDPOINTS.PROVENANCE.RECORDS}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to delete provenance record');
  }
};

/**
 * Verify dataset provenance chain
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} Verification result
 */
export const verifyProvenance = async (datasetId) => {
  try {
    return await api.post(`${API_ENDPOINTS.PROVENANCE.DATASETS}/${datasetId}/verify`);
  } catch (error) {
    throw new Error(error.message || 'Failed to verify dataset provenance');
  }
};

/**
 * Get provenance graph data for visualization
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} Graph data with nodes and edges
 */
export const getProvenanceGraph = async (datasetId) => {
  try {
    return await api.get(`${API_ENDPOINTS.PROVENANCE.DATASETS}/${datasetId}/graph`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch provenance graph');
  }
};

/**
 * Export provenance record in specified format
 * @param {string} id - Provenance record ID
 * @param {string} [format='json'] - Export format (json, xml, pdf)
 * @returns {Promise<Blob|Object>} Exported data
 */
export const exportProvenanceRecord = async (id, format = 'json') => {
  try {
    // For JSON, return object
    if (format === 'json') {
      return await api.get(`${API_ENDPOINTS.PROVENANCE.RECORDS}/${id}/export?format=${format}`);
    }
    
    // For other formats, return blob for download
    return await api.get(`${API_ENDPOINTS.PROVENANCE.RECORDS}/${id}/export?format=${format}`, { 
      responseType: 'blob' 
    });
  } catch (error) {
    throw new Error(error.message || 'Failed to export provenance record');
  }
};

/**
 * Get provenance statistics for a dataset
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} Statistics about dataset provenance
 */
export const getProvenanceStats = async (datasetId) => {
  try {
    return await api.get(`${API_ENDPOINTS.PROVENANCE.DATASETS}/${datasetId}/stats`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch provenance statistics');
  }
};