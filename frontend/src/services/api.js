import axios from 'axios';
import { getStorageItem } from '../utils/storage';

// Create axios instance
const api = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getStorageItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with an error status
      const { status, data } = error.response;
      
      // Unauthorized - token expired or invalid
      if (status === 401) {
        // Clear session and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
      }
      
      // Use the error message from the server if available
      const errorMessage = data.message || data.error || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server. Please check your internet connection.'));
    } else {
      // Something else caused the error
      return Promise.reject(error);
    }
  }
);

export default api;
