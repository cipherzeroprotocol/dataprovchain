import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchDatasets = createAsyncThunk(
  'dataset/fetchDatasets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/datasets');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDatasetById = createAsyncThunk(
  'dataset/fetchDatasetById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/datasets/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createDataset = createAsyncThunk(
  'dataset/createDataset',
  async (datasetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/datasets', datasetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  datasets: [],
  currentDataset: null,
  loading: false,
  error: null,
  createStatus: 'idle',
};

const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    clearCurrentDataset: (state) => {
      state.currentDataset = null;
    },
    resetCreateStatus: (state) => {
      state.createStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchDatasets
      .addCase(fetchDatasets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatasets.fulfilled, (state, action) => {
        state.datasets = action.payload;
        state.loading = false;
      })
      .addCase(fetchDatasets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle fetchDatasetById
      .addCase(fetchDatasetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatasetById.fulfilled, (state, action) => {
        state.currentDataset = action.payload;
        state.loading = false;
      })
      .addCase(fetchDatasetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle createDataset
      .addCase(createDataset.pending, (state) => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createDataset.fulfilled, (state, action) => {
        state.datasets.push(action.payload);
        state.createStatus = 'succeeded';
      })
      .addCase(createDataset.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCurrentDataset, resetCreateStatus } = datasetSlice.actions;

export default datasetSlice.reducer;
