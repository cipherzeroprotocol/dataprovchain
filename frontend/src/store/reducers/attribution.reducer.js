import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  attributions: [],
  royalties: {},
  selectedAttributionId: null,
  selectedDatasetId: null,
  distributingRoyalties: false,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    usageType: 'all',
    searchQuery: ''
  }
};

export const attributionSlice = createSlice({
  name: 'attribution',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDistributingRoyalties: (state, action) => {
      state.distributingRoyalties = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setAttributions: (state, action) => {
      state.attributions = action.payload;
    },
    setRoyalties: (state, action) => {
      state.royalties = action.payload;
    },
    setSelectedAttributionId: (state, action) => {
      state.selectedAttributionId = action.payload;
    },
    setSelectedDatasetId: (state, action) => {
      state.selectedDatasetId = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    addAttribution: (state, action) => {
      state.attributions = [action.payload, ...state.attributions];
    },
    updateAttribution: (state, action) => {
      state.attributions = state.attributions.map(attr => 
        attr.id === action.payload.id ? action.payload : attr
      );
    },
    removeAttribution: (state, action) => {
      state.attributions = state.attributions.filter(attr => attr.id !== action.payload);
      
      if (state.selectedAttributionId === action.payload) {
        state.selectedAttributionId = null;
      }
    },
    updateRoyaltyForDataset: (state, action) => {
      const { datasetId, royaltyData } = action.payload;
      state.royalties = {
        ...state.royalties,
        [datasetId]: {
          ...(state.royalties[datasetId] || {}),
          ...royaltyData
        }
      };
    },
    distributeRoyalty: (state, action) => {
      const { datasetId, amount, timestamp } = action.payload;
      const datasetRoyalty = state.royalties[datasetId];
      
      if (datasetRoyalty) {
        state.royalties[datasetId] = {
          ...datasetRoyalty,
          pendingDistribution: datasetRoyalty.pendingDistribution 
            ? parseFloat(datasetRoyalty.pendingDistribution) - parseFloat(amount)
            : 0,
          totalDistributed: datasetRoyalty.totalDistributed 
            ? parseFloat(datasetRoyalty.totalDistributed) + parseFloat(amount)
            : parseFloat(amount),
          lastDistribution: timestamp || new Date().toISOString()
        };
      }
    },
    addRoyaltyContributor: (state, action) => {
      const { datasetId, contributor } = action.payload;
      const datasetRoyalty = state.royalties[datasetId];
      
      if (datasetRoyalty) {
        const contributors = datasetRoyalty.contributors || [];
        const existingContributorIndex = contributors.findIndex(c => c.id === contributor.id);
        
        if (existingContributorIndex >= 0) {
          contributors[existingContributorIndex] = {
            ...contributors[existingContributorIndex],
            ...contributor
          };
        } else {
          contributors.push(contributor);
        }
        
        state.royalties[datasetId] = {
          ...datasetRoyalty,
          contributors
        };
      }
    },
    updateRoyaltyContributor: (state, action) => {
      const { datasetId, contributorId, updates } = action.payload;
      const datasetRoyalty = state.royalties[datasetId];
      
      if (datasetRoyalty && datasetRoyalty.contributors) {
        const contributorIndex = datasetRoyalty.contributors.findIndex(c => c.id === contributorId);
        
        if (contributorIndex >= 0) {
          datasetRoyalty.contributors[contributorIndex] = {
            ...datasetRoyalty.contributors[contributorIndex],
            ...updates
          };
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setDistributingRoyalties,
  setError,
  setAttributions,
  setRoyalties,
  setSelectedAttributionId,
  setSelectedDatasetId,
  setFilters,
  resetFilters,
  addAttribution,
  updateAttribution,
  removeAttribution,
  updateRoyaltyForDataset,
  distributeRoyalty,
  addRoyaltyContributor,
  updateRoyaltyContributor,
  clearError
} = attributionSlice.actions;

export default attributionSlice.reducer;