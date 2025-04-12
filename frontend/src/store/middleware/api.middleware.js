import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// API middleware to handle API requests
const apiMiddleware = store => next => action => {
  // If the action doesn't have the API flag, pass it to the next middleware
  if (!action.meta || !action.meta.api) {
    return next(action);
  }

  const { 
    endpoint, 
    method = 'GET', 
    data = null, 
    headers = {}, 
    onSuccess, 
    onError,
    onStart,
    onEnd
  } = action.meta.api;

  // Get the URL for the endpoint
  const url = typeof endpoint === 'function' 
    ? endpoint(API_ENDPOINTS) 
    : endpoint;

  // Get auth token from state
  const token = store.getState().auth.token;

  // Set auth header if token exists
  const apiHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (token) {
    apiHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Dispatch the original action
  next(action);

  // Dispatch the start action if provided
  if (onStart) {
    store.dispatch({ type: onStart });
  }

  // Make the API request
  return axios({
    method,
    url,
    data,
    headers: apiHeaders
  })
    .then(response => {
      // Dispatch the success action if provided
      if (onSuccess) {
        store.dispatch({
          type: onSuccess,
          payload: response.data
        });
      }
      
      // Return the response data
      return response.data;
    })
    .catch(error => {
      // Extract the error message
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'An error occurred';
      
      // Dispatch the error action if provided
      if (onError) {
        store.dispatch({
          type: onError,
          payload: message,
          error: true
        });
      }
      
      // Return a rejected promise
      return Promise.reject(message);
    })
    .finally(() => {
      // Dispatch the end action if provided
      if (onEnd) {
        store.dispatch({ type: onEnd });
      }
    });
};

export default apiMiddleware;
