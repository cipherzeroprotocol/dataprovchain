import { useState, useEffect, useCallback } from 'react';
import { useProvenanceContext } from '../contexts/ProvenanceContext';
import { useNotificationContext } from '../contexts/NotificationContext';

/**
 * Custom hook for working with provenance components
 * Provides integrated functionality for TimelineView, FilterControls, and NodeDetail
 */
export const useProvenanceUI = (datasetId = null) => {
  const {
    selectedDatasetId,
    setSelectedDatasetId,
    provenanceRecords,
    loading,
    error,
    filters,
    setFilters,
    selectedRecord,
    setSelectedRecord,
    fetchProvenanceHistory,
    verifyProvenance,
    verifying,
    verificationResult,
    actionTypes
  } = useProvenanceContext();

  const { success, error: showError } = useNotificationContext();
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Initialize with provided datasetId
  useEffect(() => {
    if (datasetId && datasetId !== selectedDatasetId) {
      setSelectedDatasetId(datasetId);
    }
  }, [datasetId, selectedDatasetId, setSelectedDatasetId]);

  // Handle record selection
  const handleSelectRecord = useCallback((record) => {
    setSelectedRecord(record);
  }, [setSelectedRecord]);

  // Toggle filters panel visibility
  const toggleFilters = useCallback(() => {
    setIsFiltersOpen(prev => !prev);
  }, []);

  // Apply filters to records
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  // Reset filters to default values
  const resetFilters = useCallback(() => {
    setFilters({
      actionType: '',
      startDate: null,
      endDate: null,
      actor: '',
      searchQuery: ''
    });
  }, [setFilters]);

  // Verify record on blockchain
  const verifyRecord = useCallback(async (recordId) => {
    try {
      const result = await verifyProvenance(recordId);
      
      if (result && result.verified) {
        success('Provenance record verified successfully!');
      } else {
        showError(result?.reason || 'Verification failed.');
      }
      
      return result;
    } catch (err) {
      showError(`Error verifying record: ${err.message}`);
      return null;
    }
  }, [verifyProvenance, success, showError]);

  // Refresh provenance data
  const refreshData = useCallback(() => {
    if (selectedDatasetId) {
      fetchProvenanceHistory(selectedDatasetId);
    }
  }, [selectedDatasetId, fetchProvenanceHistory]);

  return {
    // State
    datasetId: selectedDatasetId,
    records: provenanceRecords,
    loading,
    error,
    filters,
    selectedRecord,
    isFiltersOpen,
    verifying,
    verificationResult,
    actionTypes,
    
    // Actions
    setDatasetId: setSelectedDatasetId,
    selectRecord: handleSelectRecord,
    toggleFilters,
    applyFilters,
    resetFilters,
    verifyRecord,
    refreshData
  };
};

export default useProvenanceUI;