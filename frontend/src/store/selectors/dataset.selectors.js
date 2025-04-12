// Dataset selectors
// These selectors help extract and compute data from the dataset state

import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectDatasetState = state => state.dataset;
export const selectDatasets = state => selectDatasetState(state).datasets || [];
export const selectCurrentDataset = state => selectDatasetState(state).currentDataset;
export const selectLoading = state => selectDatasetState(state).loading;
export const selectError = state => selectDatasetState(state).error;
export const selectSubmitting = state => selectDatasetState(state).submitting;
export const selectFilters = state => selectDatasetState(state).filters || {};

// Computed selectors
export const selectDatasetById = createSelector(
  [selectDatasets, (_, id) => id],
  (datasets, id) => datasets.find(dataset => dataset.id === id) || null
);

export const selectDatasetsByType = createSelector(
  [selectDatasets, (_, dataType) => dataType],
  (datasets, dataType) => datasets.filter(dataset => dataset.dataType === dataType)
);

export const selectVerifiedDatasets = createSelector(
  [selectDatasets],
  (datasets) => datasets.filter(dataset => dataset.verified)
);

export const selectUserOwnedDatasets = createSelector(
  [selectDatasets, (_, userId) => userId],
  (datasets, userId) => datasets.filter(dataset => dataset.creator?.id === userId)
);

export const selectDatasetsByLicense = createSelector(
  [selectDatasets, (_, license) => license],
  (datasets, license) => datasets.filter(dataset => dataset.license === license)
);

export const selectDatasetsByTags = createSelector(
  [selectDatasets, (_, tags) => tags],
  (datasets, tags) => {
    if (!tags || !tags.length) return datasets;
    return datasets.filter(dataset => {
      if (!dataset.tags) return false;
      return tags.some(tag => dataset.tags.includes(tag));
    });
  }
);

// Count and aggregate selectors
export const selectTotalDatasets = createSelector(
  [selectDatasets],
  datasets => datasets.length
);

export const selectTotalVerifiedDatasets = createSelector(
  [selectVerifiedDatasets],
  datasets => datasets.length
);

export const selectDatasetTypes = createSelector(
  [selectDatasets],
  datasets => [...new Set(datasets.map(dataset => dataset.dataType))]
    .filter(Boolean)
    .sort()
);

export const selectAllDatasetTags = createSelector(
  [selectDatasets],
  datasets => {
    const tagSet = new Set();
    datasets.forEach(dataset => {
      if (dataset.tags && Array.isArray(dataset.tags)) {
        dataset.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }
);

export const selectAllLicenses = createSelector(
  [selectDatasets],
  datasets => [...new Set(datasets.map(dataset => dataset.license))]
    .filter(Boolean)
    .sort()
);

// Filtered datasets selector
export const selectFilteredDatasets = createSelector(
  [selectDatasets, selectFilters],
  (datasets, filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return datasets;
    }
    
    return datasets.filter(dataset => {
      // Filter by data type
      if (filters.dataType && dataset.dataType !== filters.dataType) {
        return false;
      }
      
      // Filter by creator
      if (filters.creator && dataset.creator?.id !== filters.creator) {
        return false;
      }
      
      // Filter by verification status
      if (filters.verified !== undefined && dataset.verified !== filters.verified) {
        return false;
      }
      
      // Filter by license
      if (filters.license && dataset.license !== filters.license) {
        return false;
      }
      
      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        if (!dataset.tags) return false;
        if (!filters.tags.some(tag => dataset.tags.includes(tag))) {
          return false;
        }
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
  }
);