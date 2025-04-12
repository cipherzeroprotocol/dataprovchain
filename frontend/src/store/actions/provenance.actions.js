import { createAsyncThunk } from '@reduxjs/toolkit';
import * as provenanceService from '../../services/provenance';
import { 
  setLoading, 
  setGraphLoading, 
  setError, 
  setRecords, 
  setGraph, 
  setSelectedDatasetId, 
  setSelectedRecord, 
  setVerificationStatus, 
  setVerificationResult, 
  addRecord, 
  updateRecord, 
  removeRecord 
} from '../reducers/provenance.reducer';

// Get provenance records
export const getProvenanceRecords = createAsyncThunk(
  'provenance/getProvenanceRecords',
  async (filters = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await provenanceService.getProvenanceRecords(filters);
      
      dispatch(setRecords(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get provenance for dataset
export const getDatasetProvenance = createAsyncThunk(
  'provenance/getDatasetProvenance',
  async (datasetId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setSelectedDatasetId(datasetId));
      
      const result = await provenanceService.getDatasetProvenance(datasetId);
      
      dispatch(setRecords(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get provenance record by ID
export const getProvenanceRecord = createAsyncThunk(
  'provenance/getProvenanceRecord',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await provenanceService.getProvenanceRecord(id);
      
      dispatch(setSelectedRecord(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Create provenance record
export const createProvenanceRecord = createAsyncThunk(
  'provenance/createProvenanceRecord',
  async (recordData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await provenanceService.createProvenanceRecord(recordData);
      
      dispatch(addRecord(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update provenance record
export const updateProvenanceRecord = createAsyncThunk(
  'provenance/updateProvenanceRecord',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await provenanceService.updateProvenanceRecord(id, data);
      
      dispatch(updateRecord(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete provenance record
export const deleteProvenanceRecord = createAsyncThunk(
  'provenance/deleteProvenanceRecord',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      await provenanceService.deleteProvenanceRecord(id);
      
      dispatch(removeRecord(id));
      
      return id;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Verify provenance
export const verifyProvenance = createAsyncThunk(
  'provenance/verifyProvenance',
  async (datasetId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setVerificationStatus('verifying'));
      
      const result = await provenanceService.verifyProvenance(datasetId);
      
      dispatch(setVerificationResult(result));
      dispatch(setVerificationStatus('completed'));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setVerificationStatus('failed'));
      return rejectWithValue(error.message);
    }
  }
);

// Get provenance graph
export const getProvenanceGraph = createAsyncThunk(
  'provenance/getProvenanceGraph',
  async (datasetId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setGraphLoading(true));
      
      const result = await provenanceService.getProvenanceGraph(datasetId);
      
      dispatch(setGraph(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setGraphLoading(false));
    }
  }
);

// Export provenance record
export const exportProvenanceRecord = createAsyncThunk(
  'provenance/exportProvenanceRecord',
  async ({ id, format = 'json' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await provenanceService.exportProvenanceRecord(id, format);
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);