import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { DATASET_TYPES } from '../constants/ui';
import { API_ROUTES } from '../constants/routes';
import api from '../services/api';

export const DatasetContext = createContext();

export const DatasetProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    dataType: '',
    searchQuery: '',
    creator: '',
    verified: null
  });

  // Load user's datasets when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDatasets();
    } else {
      setDatasets([]);
      setSelectedDataset(null);
    }
  }, [isAuthenticated]);

  // Fetch user's datasets
  const fetchUserDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ROUTES.DATASET.LIST);
      setDatasets(response.data.data);
      
      return response.data.data;
    } catch (err) {
      setError(`Error fetching datasets: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all publicly available datasets
  const fetchPublicDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`${API_ROUTES.DATASET.LIST}?public=true`);
      setDatasets(response.data.data);
      
      return response.data.data;
    } catch (err) {
      setError(`Error fetching public datasets: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single dataset by ID
  const fetchDataset = async (datasetId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ROUTES.DATASET.GET_BY_ID(datasetId));
      const dataset = response.data.data;
      
      setSelectedDataset(dataset);
      
      return dataset;
    } catch (err) {
      setError(`Error fetching dataset: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new dataset
  const createDataset = async (datasetData) => {
    if (!isAuthenticated) {
      setError('You must be authenticated to create a dataset');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(API_ROUTES.DATASET.CREATE, datasetData);
      const newDataset = response.data.data;
      
      // Update local state with the new dataset
      setDatasets(prev => [newDataset, ...prev]);
      setSelectedDataset(newDataset);
      
      return newDataset;
    } catch (err) {
      setError(`Error creating dataset: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing dataset
  const updateDataset = async (datasetId, datasetData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(API_ROUTES.DATASET.UPDATE(datasetId), datasetData);
      const updatedDataset = response.data.data;
      
      // Update local state
      setDatasets(prev => 
        prev.map(dataset => 
          dataset.id === updatedDataset.id ? updatedDataset : dataset
        )
      );
      
      if (selectedDataset?.id === updatedDataset.id) {
        setSelectedDataset(updatedDataset);
      }
      
      return updatedDataset;
    } catch (err) {
      setError(`Error updating dataset: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a dataset
  const deleteDataset = async (datasetId) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(API_ROUTES.DATASET.DELETE(datasetId));
      
      // Update local state
      setDatasets(prev => prev.filter(dataset => dataset.id !== datasetId));
      
      if (selectedDataset?.id === datasetId) {
        setSelectedDataset(null);
      }
      
      return true;
    } catch (err) {
      setError(`Error deleting dataset: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload dataset files
  const uploadDatasetFiles = async (datasetId, files, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);
      
      const formData = new FormData();
      
      // Append multiple files
      if (Array.isArray(files)) {
        files.forEach(file => {
          formData.append('files', file);
        });
      } else {
        // Single file
        formData.append('files', files);
      }
      
      // Append additional options
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }
      
      const response = await api.post(
        API_ROUTES.DATASET.UPLOAD(datasetId), 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      // Refresh dataset data
      fetchDataset(datasetId);
      
      return response.data.data;
    } catch (err) {
      setError(`Error uploading dataset files: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search datasets
  const searchDatasets = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`${API_ROUTES.DATASET.LIST}?search=${query}`);
      setDatasets(response.data.data);
      
      return response.data.data;
    } catch (err) {
      setError(`Error searching datasets: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get filtered datasets
  const getFilteredDatasets = () => {
    if (!datasets || datasets.length === 0) {
      return [];
    }
    
    return datasets.filter(dataset => {
      // Filter by data type
      if (filters.dataType && dataset.dataType !== filters.dataType) {
        return false;
      }
      
      // Filter by creator
      if (filters.creator && dataset.creator?.toLowerCase() !== filters.creator.toLowerCase()) {
        return false;
      }
      
      // Filter by verification status
      if (filters.verified !== null && dataset.verified !== filters.verified) {
        return false;
      }
      
      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const nameMatch = dataset.name?.toLowerCase().includes(query);
        const descriptionMatch = dataset.description?.toLowerCase().includes(query);
        
        if (!nameMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Check if user has access to a dataset
  const hasDatasetAccess = (datasetId) => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    const dataset = datasets.find(d => d.id === datasetId);
    
    if (!dataset) {
      return false;
    }
    
    // User is the creator
    if (dataset.creator === user.walletAddress) {
      return true;
    }
    
    // User has purchased the dataset
    if (dataset.purchases && dataset.purchases.includes(user.walletAddress)) {
      return true;
    }
    
    return false;
  };

  return (
    <DatasetContext.Provider
      value={{
        // State
        datasets: getFilteredDatasets(),
        allDatasets: datasets,
        selectedDataset,
        loading,
        uploadProgress,
        error,
        filters,
        datasetTypes: DATASET_TYPES,
        
        // Setters
        setSelectedDataset,
        setFilters,
        
        // Actions
        fetchUserDatasets,
        fetchPublicDatasets,
        fetchDataset,
        createDataset,
        updateDataset,
        deleteDataset,
        uploadDatasetFiles,
        searchDatasets,
        hasDatasetAccess
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

DatasetProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the DatasetContext
export const useDatasetContext = () => useContext(DatasetContext);