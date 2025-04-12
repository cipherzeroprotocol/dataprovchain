import { useState, useCallback } from 'react';
import * as datasetService from '../services/dataset';

export const useDataset = () => {
  const [datasets, setDatasets] = useState([]);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Create a new dataset
  const createDataset = useCallback(async (datasetData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await datasetService.createDataset(datasetData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload dataset files
  const uploadFiles = useCallback(async (formData) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      const result = await datasetService.uploadDatasetFiles(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  // Get dataset by ID
  const getDataset = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await datasetService.getDataset(id);
      setDataset(result);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // List datasets with filters
  const listDatasets = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await datasetService.listDatasets(filters);
      setDatasets(result.datasets);
      setPagination({
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        pages: result.pagination.pages
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify a dataset
  const verifyDataset = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await datasetService.verifyDataset(id);
      
      // Update local dataset if it matches
      if (dataset && dataset.id === id) {
        setDataset(result);
      }
      
      // Update in datasets list if exists
      setDatasets((prevDatasets) => 
        prevDatasets.map((item) => 
          item.id === id ? result : item
        )
      );
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataset]);

  return {
    datasets,
    dataset,
    loading,
    uploading,
    uploadProgress,
    error,
    pagination,
    createDataset,
    uploadFiles,
    getDataset,
    listDatasets,
    verifyDataset
  };
};
