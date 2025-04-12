import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  datasets: [],
  currentDataset: null,
  loading: false,
  submitting: false,
  error: null,
  filters: {
    dataType: null,
    verified: null,
    license: null,
    tags: [],
    searchQuery: ''
  }
};

export const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSubmitting: (state, action) => {
      state.submitting = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setDatasets: (state, action) => {
      state.datasets = action.payload;
    },
    setCurrentDataset: (state, action) => {
      state.currentDataset = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    addDataset: (state, action) => {
      state.datasets = [action.payload, ...state.datasets];
    },
    updateDataset: (state, action) => {
      if (state.currentDataset && state.currentDataset.id === action.payload.id) {
        state.currentDataset = action.payload;
      }
      
      state.datasets = state.datasets.map(dataset => 
        dataset.id === action.payload.id ? action.payload : dataset
      );
    },
    removeDataset: (state, action) => {
      state.datasets = state.datasets.filter(dataset => dataset.id !== action.payload);
      
      if (state.currentDataset && state.currentDataset.id === action.payload) {
        state.currentDataset = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setSubmitting,
  setError,
  setDatasets,
  setCurrentDataset,
  setFilters,
  resetFilters,
  addDataset,
  updateDataset,
  removeDataset,
  clearError
} = datasetSlice.actions;

export default datasetSlice.reducer;