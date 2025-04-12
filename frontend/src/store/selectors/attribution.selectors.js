// Attribution selectors
// These selectors help access and compute data from the attribution state

import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectAttributionState = state => state.attribution;
export const selectAttributions = state => selectAttributionState(state).attributions || [];
export const selectRoyalties = state => selectAttributionState(state).royalties || {};
export const selectLoading = state => selectAttributionState(state).loading;
export const selectError = state => selectAttributionState(state).error;
export const selectSelectedAttributionId = state => selectAttributionState(state).selectedAttributionId;
export const selectSelectedDatasetId = state => selectAttributionState(state).selectedDatasetId;
export const selectDistributingRoyalties = state => selectAttributionState(state).distributingRoyalties;
export const selectFilters = state => selectAttributionState(state).filters || {};

// Computed selectors
export const selectAttributionById = createSelector(
  [selectAttributions, (_, id) => id],
  (attributions, id) => attributions.find(attr => attr.id === id) || null
);

export const selectAttributionsByDatasetId = createSelector(
  [selectAttributions, (_, datasetId) => datasetId],
  (attributions, datasetId) => attributions.filter(attr => attr.datasetId === datasetId)
);

export const selectAttributionsByModelId = createSelector(
  [selectAttributions, (_, modelId) => modelId],
  (attributions, modelId) => attributions.filter(attr => attr.modelId === modelId)
);

export const selectAttributionsByCreator = createSelector(
  [selectAttributions, (_, creator) => creator],
  (attributions, creator) => attributions.filter(attr => attr.creator === creator)
);

export const selectAttributionsByUsageType = createSelector(
  [selectAttributions, (_, usageType) => usageType],
  (attributions, usageType) => attributions.filter(attr => attr.usageType === usageType)
);

export const selectVerifiedAttributions = createSelector(
  [selectAttributions],
  (attributions) => attributions.filter(attr => attr.verified)
);

export const selectPendingAttributions = createSelector(
  [selectAttributions],
  (attributions) => attributions.filter(attr => !attr.verified)
);

// Timeline and organized attributions
export const selectTimelineSortedAttributions = createSelector(
  [selectAttributions],
  (attributions) => [...attributions].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA; // Most recent first
  })
);

export const selectGroupedAttributionsByDataset = createSelector(
  [selectAttributions],
  (attributions) => {
    const grouped = {};
    attributions.forEach(attr => {
      if (!grouped[attr.datasetId]) {
        grouped[attr.datasetId] = [];
      }
      grouped[attr.datasetId].push(attr);
    });
    
    // Sort each group by timestamp
    Object.keys(grouped).forEach(datasetId => {
      grouped[datasetId].sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });
    });
    
    return grouped;
  }
);

// Royalty-related selectors
export const selectRoyaltiesByDatasetId = createSelector(
  [selectRoyalties, (_, datasetId) => datasetId],
  (royalties, datasetId) => royalties[datasetId] || null
);

export const selectTotalRoyalties = createSelector(
  [selectRoyalties],
  (royalties) => {
    let total = 0;
    Object.values(royalties).forEach(datasetRoyalty => {
      total += parseFloat(datasetRoyalty.totalEarned || 0);
    });
    return total;
  }
);

export const selectPendingRoyalties = createSelector(
  [selectRoyalties],
  (royalties) => {
    let pending = 0;
    Object.values(royalties).forEach(datasetRoyalty => {
      pending += parseFloat(datasetRoyalty.pendingDistribution || 0);
    });
    return pending;
  }
);

export const selectContributorRoyalties = createSelector(
  [selectRoyalties, (_, contributorId) => contributorId],
  (royalties, contributorId) => {
    let total = 0;
    Object.values(royalties).forEach(datasetRoyalty => {
      const contributor = (datasetRoyalty.contributors || [])
        .find(c => c.id === contributorId);
      
      if (contributor) {
        total += parseFloat(contributor.earned || 0);
      }
    });
    return total;
  }
);

// Aggregation and statistics selectors
export const selectUsageTypes = createSelector(
  [selectAttributions],
  (attributions) => [...new Set(attributions.map(attr => attr.usageType))]
    .filter(Boolean)
    .sort()
);

export const selectUsageTypeCounts = createSelector(
  [selectAttributions],
  (attributions) => {
    const counts = {};
    attributions.forEach(attr => {
      const type = attr.usageType || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }
);

export const selectAverageImpactScore = createSelector(
  [selectAttributions],
  (attributions) => {
    if (attributions.length === 0) return 0;
    const sum = attributions.reduce((acc, attr) => acc + (attr.impactScore || 0), 0);
    return sum / attributions.length;
  }
);

export const selectVerificationRate = createSelector(
  [selectAttributions],
  (attributions) => {
    if (attributions.length === 0) return 0;
    const verifiedCount = attributions.filter(attr => attr.verified).length;
    return (verifiedCount / attributions.length) * 100;
  }
);

// Selected attribution
export const selectCurrentAttribution = createSelector(
  [selectAttributions, selectSelectedAttributionId],
  (attributions, selectedId) => {
    if (!selectedId) return null;
    return attributions.find(attr => attr.id === selectedId) || null;
  }
);

// Current dataset attributions
export const selectCurrentDatasetAttributions = createSelector(
  [selectAttributions, selectSelectedDatasetId],
  (attributions, datasetId) => {
    if (!datasetId) return [];
    return attributions.filter(attr => attr.datasetId === datasetId)
      .sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });
  }
);

// Filtered attributions
export const selectFilteredAttributions = createSelector(
  [selectAttributions, selectFilters],
  (attributions, filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return attributions;
    }
    
    return attributions.filter(attr => {
      // Filter by status
      if (filters.status !== 'all') {
        const isVerified = filters.status === 'verified';
        if (attr.verified !== isVerified) return false;
      }

      // Filter by usage type
      if (filters.usageType !== 'all' && attr.usageType !== filters.usageType) {
        return false;
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          attr.modelName?.toLowerCase().includes(query) ||
          attr.modelId?.toLowerCase().includes(query) ||
          (attr.creator && attr.creator.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }
);