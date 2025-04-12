import { createAsyncThunk } from '@reduxjs/toolkit';
import * as datasetService from '../../services/dataset';
import { 
  setLoading, 
  setSubmitting, 
  setError, 
  setDatasets, 
  setCurrentDataset, 
  addDataset, 
  updateDataset, 
  removeDataset 
} from '../reducers/dataset.reducer';

// Get all datasets
export const getDatasets = createAsyncThunk(
  'dataset/getDatasets',
  async (filters = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await datasetService.getDatasets(filters);
      
      dispatch(setDatasets(result.datasets));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get dataset by ID
export const getDatasetById = createAsyncThunk(
  'dataset/getDatasetById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await datasetService.getDataset(id);
      
      dispatch(setCurrentDataset(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Create dataset
export const createDataset = createAsyncThunk(
  'dataset/createDataset',
  async (datasetData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const result = await datasetService.createDataset(datasetData);
      
      dispatch(addDataset(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

// Update dataset
export const updateDatasetById = createAsyncThunk(
  'dataset/updateDatasetById',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const result = await datasetService.updateDataset(id, data);
      
      dispatch(updateDataset(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

// Delete dataset
export const deleteDataset = createAsyncThunk(
  'dataset/deleteDataset',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      await datasetService.deleteDataset(id);
      
      dispatch(removeDataset(id));
      
      return id;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

// Publish dataset to marketplace
export const publishDataset = createAsyncThunk(
  'dataset/publishDataset',
  async ({ id, marketplaceData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const result = await datasetService.publishDataset(id, marketplaceData);
      
      dispatch(updateDataset(result.dataset));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

// Upload dataset files
export const uploadDatasetFiles = createAsyncThunk(
  'dataset/uploadDatasetFiles',
  async ({ id, files }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const result = await datasetService.uploadDatasetFiles(id, files);
      
      dispatch(updateDataset(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

// Verify dataset
export const verifyDataset = createAsyncThunk(
  'dataset/verifyDataset',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSubmitting(true));
      
      const result = await datasetService.verifyDataset(id);
      
      dispatch(updateDataset(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);