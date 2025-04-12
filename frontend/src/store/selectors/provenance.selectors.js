// Provenance selectors
// These selectors help extract and compute data from the provenance state

import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectProvenanceState = state => state.provenance;
export const selectProvenanceRecords = state => selectProvenanceState(state).records || [];
export const selectProvenanceGraph = state => selectProvenanceState(state).graph || {};
export const selectLoading = state => selectProvenanceState(state).loading;
export const selectGraphLoading = state => selectProvenanceState(state).graphLoading;
export const selectError = state => selectProvenanceState(state).error;
export const selectFilters = state => selectProvenanceState(state).filters || {};
export const selectSelectedDatasetId = state => selectProvenanceState(state).selectedDatasetId;
export const selectSelectedRecord = state => selectProvenanceState(state).selectedRecord;
export const selectVerificationStatus = state => selectProvenanceState(state).verificationStatus;
export const selectVerificationResult = state => selectProvenanceState(state).verificationResult;

// Computed selectors
export const selectRecordById = createSelector(
  [selectProvenanceRecords, (_, id) => id],
  (records, id) => records.find(record => record.id === id) || null
);

export const selectRecordsByDatasetId = createSelector(
  [selectProvenanceRecords, (_, datasetId) => datasetId],
  (records, datasetId) => records.filter(record => record.datasetId === datasetId)
);

export const selectRecordsByActionType = createSelector(
  [selectProvenanceRecords, (_, actionType) => actionType],
  (records, actionType) => records.filter(record => record.actionType === actionType)
);

export const selectRecordsByPerformer = createSelector(
  [selectProvenanceRecords, (_, performer) => performer],
  (records, performer) => records.filter(record => record.performedBy === performer)
);

export const selectVerifiedRecords = createSelector(
  [selectProvenanceRecords],
  (records) => records.filter(record => record.verified)
);

export const selectPendingRecords = createSelector(
  [selectProvenanceRecords],
  (records) => records.filter(record => !record.verified)
);

// Timeline and organized records
export const selectTimelineRecords = createSelector(
  [selectProvenanceRecords],
  (records) => [...records].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.createdAt);
    const dateB = new Date(b.timestamp || b.createdAt);
    return dateB - dateA; // Most recent first
  })
);

export const selectGroupedRecordsByDataset = createSelector(
  [selectProvenanceRecords],
  (records) => {
    const grouped = {};
    records.forEach(record => {
      if (!grouped[record.datasetId]) {
        grouped[record.datasetId] = [];
      }
      grouped[record.datasetId].push(record);
    });
    
    // Sort each group by timestamp
    Object.keys(grouped).forEach(datasetId => {
      grouped[datasetId].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt);
        const dateB = new Date(b.timestamp || b.createdAt);
        return dateB - dateA;
      });
    });
    
    return grouped;
  }
);

// Aggregation selectors
export const selectActionTypes = createSelector(
  [selectProvenanceRecords],
  (records) => [...new Set(records.map(record => record.actionType))]
    .filter(Boolean)
    .sort()
);

export const selectPerformers = createSelector(
  [selectProvenanceRecords],
  (records) => [...new Set(records.map(record => record.performedBy))]
    .filter(Boolean)
    .sort()
);

export const selectDatasetIds = createSelector(
  [selectProvenanceRecords],
  (records) => [...new Set(records.map(record => record.datasetId))]
    .filter(Boolean)
);

// Current dataset provenance
export const selectCurrentDatasetProvenance = createSelector(
  [selectProvenanceRecords, selectSelectedDatasetId],
  (records, datasetId) => {
    if (!datasetId) return [];
    return records.filter(record => record.datasetId === datasetId)
      .sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt);
        const dateB = new Date(b.timestamp || b.createdAt);
        return dateB - dateA;
      });
  }
);

// Filtered provenance records
export const selectFilteredProvenanceRecords = createSelector(
  [selectProvenanceRecords, selectFilters],
  (records, filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return records;
    }
    
    return records.filter(record => {
      // Filter by action type
      if (filters.actionType && record.actionType !== filters.actionType) {
        return false;
      }
      
      // Filter by date range
      if (filters.startDate && new Date(record.timestamp || record.createdAt) < filters.startDate) {
        return false;
      }
      
      if (filters.endDate) {
        // Add one day to include the end date fully
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        
        if (new Date(record.timestamp || record.createdAt) > endDate) {
          return false;
        }
      }
      
      // Filter by actor
      if (filters.actor && !record.performedBy?.toLowerCase().includes(filters.actor.toLowerCase())) {
        return false;
      }
      
      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const descriptionMatch = record.description?.toLowerCase().includes(query);
        const metadataMatch = record.metadata ? 
          JSON.stringify(record.metadata).toLowerCase().includes(query) : 
          false;
        
        if (!descriptionMatch && !metadataMatch) {
          return false;
        }
      }
      
      return true;
    });
  }
);