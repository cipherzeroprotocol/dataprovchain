import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  records: [],
  graph: {},
  selectedDatasetId: null,
  selectedRecord: null,
  loading: false,
  graphLoading: false,
  verificationStatus: null,
  verificationResult: null,
  error: null,
  filters: {
    actionType: null,
    startDate: null,
    endDate: null,
    actor: null,
    searchQuery: ''
  }
};

export const provenanceSlice = createSlice({
  name: 'provenance',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setGraphLoading: (state, action) => {
      state.graphLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setRecords: (state, action) => {
      state.records = action.payload;
    },
    setGraph: (state, action) => {
      state.graph = action.payload;
    },
    setSelectedDatasetId: (state, action) => {
      state.selectedDatasetId = action.payload;
    },
    setSelectedRecord: (state, action) => {
      state.selectedRecord = action.payload;
    },
    setVerificationStatus: (state, action) => {
      state.verificationStatus = action.payload;
    },
    setVerificationResult: (state, action) => {
      state.verificationResult = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    addRecord: (state, action) => {
      state.records = [action.payload, ...state.records];
    },
    updateRecord: (state, action) => {
      if (state.selectedRecord && state.selectedRecord.id === action.payload.id) {
        state.selectedRecord = action.payload;
      }
      
      state.records = state.records.map(record => 
        record.id === action.payload.id ? action.payload : record
      );
    },
    removeRecord: (state, action) => {
      state.records = state.records.filter(record => record.id !== action.payload);
      
      if (state.selectedRecord && state.selectedRecord.id === action.payload) {
        state.selectedRecord = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setGraphLoading,
  setError,
  setRecords,
  setGraph,
  setSelectedDatasetId,
  setSelectedRecord,
  setVerificationStatus,
  setVerificationResult,
  setFilters,
  resetFilters,
  addRecord,
  updateRecord,
  removeRecord,
  clearError
} = provenanceSlice.actions;

export default provenanceSlice.reducer;