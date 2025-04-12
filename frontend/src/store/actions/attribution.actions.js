import { createAsyncThunk } from '@reduxjs/toolkit';
import * as attributionService from '../../services/attribution';
import { 
  setLoading, 
  setDistributingRoyalties, 
  setError, 
  setAttributions, 
  setRoyalties, 
  setSelectedAttributionId, 
  setSelectedDatasetId, 
  addAttribution, 
  updateAttribution, 
  removeAttribution,
  updateRoyaltyForDataset,
  distributeRoyalty,
  addRoyaltyContributor,
  updateRoyaltyContributor
} from '../reducers/attribution.reducer';

// Get all attributions
export const getAttributions = createAsyncThunk(
  'attribution/getAttributions',
  async (filters = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await attributionService.getAttributions(filters);
      
      dispatch(setAttributions(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get dataset attributions
export const getDatasetAttributions = createAsyncThunk(
  'attribution/getDatasetAttributions',
  async (datasetId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setSelectedDatasetId(datasetId));
      
      const result = await attributionService.getDatasetAttributions(datasetId);
      
      dispatch(setAttributions(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get attribution by ID
export const getAttributionById = createAsyncThunk(
  'attribution/getAttributionById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setSelectedAttributionId(id));
      
      const result = await attributionService.getAttribution(id);
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Create attribution
export const createAttribution = createAsyncThunk(
  'attribution/createAttribution',
  async (attributionData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await attributionService.createAttribution(attributionData);
      
      dispatch(addAttribution(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update attribution
export const updateAttributionById = createAsyncThunk(
  'attribution/updateAttributionById',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await attributionService.updateAttribution(id, data);
      
      dispatch(updateAttribution(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete attribution
export const deleteAttribution = createAsyncThunk(
  'attribution/deleteAttribution',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      await attributionService.deleteAttribution(id);
      
      dispatch(removeAttribution(id));
      
      return id;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Verify attribution
export const verifyAttribution = createAsyncThunk(
  'attribution/verifyAttribution',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await attributionService.verifyAttribution(id);
      
      dispatch(updateAttribution(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get royalties
export const getRoyalties = createAsyncThunk(
  'attribution/getRoyalties',
  async (filters = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await attributionService.getRoyalties(filters);
      
      dispatch(setRoyalties(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get royalties by dataset
export const getDatasetRoyalties = createAsyncThunk(
  'attribution/getDatasetRoyalties',
  async (datasetId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await attributionService.getDatasetRoyalties(datasetId);
      
      dispatch(updateRoyaltyForDataset({
        datasetId,
        royaltyData: result
      }));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Distribute royalties
export const distributeRoyalties = createAsyncThunk(
  'attribution/distributeRoyalties',
  async ({ datasetId, amount }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setDistributingRoyalties(true));
      
      const result = await attributionService.distributeRoyalties(datasetId, amount);
      
      dispatch(distributeRoyalty({
        datasetId,
        amount,
        timestamp: new Date().toISOString()
      }));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setDistributingRoyalties(false));
    }
  }
);

// Add contributor
export const addContributor = createAsyncThunk(
  'attribution/addContributor',
  async ({ datasetId, contributor }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await attributionService.addContributor(datasetId, contributor);
      
      dispatch(addRoyaltyContributor({
        datasetId,
        contributor: result
      }));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update contributor
export const updateContributor = createAsyncThunk(
  'attribution/updateContributor',
  async ({ datasetId, contributorId, updates }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await attributionService.updateContributor(datasetId, contributorId, updates);
      
      dispatch(updateRoyaltyContributor({
        datasetId,
        contributorId,
        updates: result
      }));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);