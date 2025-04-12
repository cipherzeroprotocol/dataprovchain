import config from '../config/app';

const API_BASE_URL = config.apiBaseUrl;

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
    PROFILE: `${API_BASE_URL}/auth/profile`
  },
  
  // Dataset endpoints
  DATASETS: {
    BASE: `${API_BASE_URL}/datasets`,
    BY_ID: (id) => `${API_BASE_URL}/datasets/${id}`,
    VERIFY: (id) => `${API_BASE_URL}/datasets/${id}/verify`,
    UPLOAD: `${API_BASE_URL}/datasets/upload`
  },
  
  // Provenance endpoints
  PROVENANCE: {
    BASE: `${API_BASE_URL}/provenance`,
    GRAPH: (datasetId) => `${API_BASE_URL}/provenance/graph/${datasetId}`,
    USAGE: `${API_BASE_URL}/provenance/usage`
  },
  
  // Marketplace endpoints
  MARKETPLACE: {
    LISTINGS: `${API_BASE_URL}/marketplace/listings`,
    LISTING_BY_ID: (id) => `${API_BASE_URL}/marketplace/listings/${id}`,
    PURCHASE: (id) => `${API_BASE_URL}/marketplace/listings/${id}/purchase`
  },
  
  // Attribution endpoints
  ATTRIBUTION: {
    BASE: `${API_BASE_URL}/attribution`,
    BY_DATASET: (datasetId) => `${API_BASE_URL}/attribution/dataset/${datasetId}`,
    ROYALTIES: (datasetId) => `${API_BASE_URL}/attribution/royalties/${datasetId}`
  },
  
  // DAO endpoints
  DAO: {
    PROPOSALS: `${API_BASE_URL}/dao/proposals`,
    PROPOSAL_BY_ID: (id) => `${API_BASE_URL}/dao/proposals/${id}`,
    VOTE: (id) => `${API_BASE_URL}/dao/proposals/${id}/vote`
  }
};

export default API_ENDPOINTS;
