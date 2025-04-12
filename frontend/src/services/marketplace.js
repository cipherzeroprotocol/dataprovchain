import api from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get marketplace listings
 * @param {Object} filters - Filter parameters for listings
 * @param {string} [filters.dataType] - Filter by data type
 * @param {boolean} [filters.verified] - Filter by verification status
 * @param {string} [filters.creator] - Filter by creator
 * @param {Array} [filters.tags] - Filter by tags
 * @param {Object} [filters.price] - Filter by price range
 * @param {number} [filters.price.min] - Minimum price
 * @param {number} [filters.price.max] - Maximum price
 * @param {number} [filters.page=1] - Page number
 * @param {number} [filters.limit=10] - Items per page
 * @param {string} [filters.sortBy='createdAt'] - Sort field
 * @param {string} [filters.sortOrder='desc'] - Sort order
 * @returns {Promise<Object>} Listings and pagination data
 */
export const getListings = async (filters = {}) => {
  try {
    return await api.get(API_ENDPOINTS.MARKETPLACE.LISTINGS, { params: filters });
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch marketplace listings');
  }
};

/**
 * Get a specific listing by ID
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Listing details
 */
export const getListing = async (id) => {
  try {
    return await api.get(`${API_ENDPOINTS.MARKETPLACE.LISTINGS}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch listing details');
  }
};

/**
 * Create a new marketplace listing
 * @param {Object} listingData - Listing data
 * @param {string} listingData.datasetId - Dataset ID
 * @param {string} listingData.title - Listing title
 * @param {string} listingData.description - Listing description
 * @param {number} listingData.price - Listing price
 * @param {string} listingData.currency - Currency (ETH, USDC, etc.)
 * @param {Array} listingData.tags - Tags for the listing
 * @param {Object} listingData.license - License details
 * @returns {Promise<Object>} Created listing
 */
export const createListing = async (listingData) => {
  try {
    return await api.post(API_ENDPOINTS.MARKETPLACE.LISTINGS, listingData);
  } catch (error) {
    throw new Error(error.message || 'Failed to create marketplace listing');
  }
};

/**
 * Update an existing listing
 * @param {string} id - Listing ID
 * @param {Object} data - Updated listing data
 * @returns {Promise<Object>} Updated listing
 */
export const updateListing = async (id, data) => {
  try {
    return await api.put(`${API_ENDPOINTS.MARKETPLACE.LISTINGS}/${id}`, data);
  } catch (error) {
    throw new Error(error.message || 'Failed to update listing');
  }
};

/**
 * Delete a listing
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Result of the deletion
 */
export const deleteListing = async (id) => {
  try {
    return await api.delete(`${API_ENDPOINTS.MARKETPLACE.LISTINGS}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to delete listing');
  }
};

/**
 * Purchase a marketplace listing
 * @param {string} id - Listing ID
 * @param {Object} paymentDetails - Payment details
 * @param {number} paymentDetails.price - Payment amount
 * @param {string} paymentDetails.signature - Transaction signature
 * @returns {Promise<Object>} Purchase confirmation and updated listing
 */
export const purchaseListing = async (id, paymentDetails) => {
  try {
    return await api.post(`${API_ENDPOINTS.MARKETPLACE.LISTINGS}/${id}/purchase`, paymentDetails);
  } catch (error) {
    throw new Error(error.message || 'Failed to purchase dataset');
  }
};

/**
 * Get user's purchased listings
 * @returns {Promise<Array>} List of purchased datasets
 */
export const getPurchasedListings = async () => {
  try {
    return await api.get(API_ENDPOINTS.MARKETPLACE.PURCHASED);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch purchased datasets');
  }
};

/**
 * Get featured listings for homepage
 * @param {number} [limit=5] - Number of featured listings to fetch
 * @returns {Promise<Array>} List of featured listings
 */
export const getFeaturedListings = async (limit = 5) => {
  try {
    return await api.get(`${API_ENDPOINTS.MARKETPLACE.FEATURED}?limit=${limit}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch featured listings');
  }
};

/**
 * Get top-selling listings
 * @param {number} [limit=5] - Number of top sellers to fetch
 * @returns {Promise<Array>} List of top-selling listings
 */
export const getTopSellingListings = async (limit = 5) => {
  try {
    return await api.get(`${API_ENDPOINTS.MARKETPLACE.TOP_SELLING}?limit=${limit}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch top-selling listings');
  }
};

/**
 * Get related listings for a specific listing
 * @param {string} id - Listing ID
 * @param {number} [limit=3] - Number of related listings to fetch
 * @returns {Promise<Array>} List of related listings
 */
export const getRelatedListings = async (id, limit = 3) => {
  try {
    return await api.get(`${API_ENDPOINTS.MARKETPLACE.LISTINGS}/${id}/related?limit=${limit}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch related listings');
  }
};