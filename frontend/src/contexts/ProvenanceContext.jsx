import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useProvenance } from '../hooks/useProvenance';
import { useAuth } from '../hooks/useAuth';
import { PROVENANCE_ACTION_TYPES } from '../constants/ui';

export const ProvenanceContext = createContext();

export const ProvenanceProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { 
    getProvenanceHistory, 
    getProvenanceGraph, 
    addProvenanceRecord, 
    recordUsage, 
    verifyProvenanceChain 
  } = useProvenance();

  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [provenanceRecords, setProvenanceRecords] = useState([]);
  const [provenanceGraph, setProvenanceGraph] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const [filters, setFilters] = useState({
    actionType: '',
    startDate: null,
    endDate: null,
    actor: '',
    searchQuery: ''
  });

  // Load provenance history when dataset changes
  useEffect(() => {
    if (selectedDatasetId) {
      fetchProvenanceHistory(selectedDatasetId);
      fetchProvenanceGraph(selectedDatasetId);
    } else {
      setProvenanceRecords([]);
      setProvenanceGraph(null);
      setSelectedRecord(null);
    }
  }, [selectedDatasetId, fetchProvenanceHistory, fetchProvenanceGraph]);

  // Fetch provenance history for a dataset
  const fetchProvenanceHistory = React.useCallback(async (datasetId) => {
    try {
      setLoading(true);
      setError(null);
      const records = await getProvenanceHistory(datasetId);
      setProvenanceRecords(records);
      return records;
    } catch (err) {
      setError(`Error fetching provenance history: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getProvenanceHistory]);

  // Fetch provenance graph for visualization
  const fetchProvenanceGraph = React.useCallback(async (datasetId) => {
    try {
      setGraphLoading(true);
      setError(null);
      const graph = await getProvenanceGraph(datasetId);
      setProvenanceGraph(graph);
      return graph;
    } catch (err) {
      setError(`Error fetching provenance graph: ${err.message}`);
      return null;
    } finally {
      setGraphLoading(false);
    }
  }, [getProvenanceGraph]);

  // Add a new provenance record
  const createProvenanceRecord = async (recordData) => {
    if (!isAuthenticated) {
      setError('You must be authenticated to create provenance records');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = {
        ...recordData,
        performedBy: user.walletAddress,
        datasetId: selectedDatasetId || recordData.datasetId
      };
      
      const newRecord = await addProvenanceRecord(data);
      
      // Update local state with the new record
      setProvenanceRecords(prev => [newRecord, ...prev]);
      
      // Refresh graph data
      if (selectedDatasetId) {
        fetchProvenanceGraph(selectedDatasetId);
      }
      
      return newRecord;
    } catch (err) {
      setError(`Error creating provenance record: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Record a usage of a dataset
  const recordDatasetUsage = async (usageData) => {
    if (!isAuthenticated) {
      setError('You must be authenticated to record dataset usage');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = {
        ...usageData,
        userId: user.id,
        datasetId: selectedDatasetId || usageData.datasetId
      };
      
      const result = await recordUsage(data);
      
      // Refresh provenance data
      if (selectedDatasetId) {
        fetchProvenanceHistory(selectedDatasetId);
        fetchProvenanceGraph(selectedDatasetId);
      }
      
      return result;
    } catch (err) {
      setError(`Error recording dataset usage: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verify the provenance chain for a dataset
  const verifyProvenance = async (datasetId) => {
    try {
      setVerifying(true);
      setError(null);
      
      const verificationData = await verifyProvenanceChain(datasetId || selectedDatasetId);
      setVerificationResult(verificationData);
      
      return verificationData;
    } catch (err) {
      setError(`Error verifying provenance chain: ${err.message}`);
      return null;
    } finally {
      setVerifying(false);
    }
  };

  // Apply filters to the provenance records
  const getFilteredRecords = () => {
    if (!provenanceRecords || provenanceRecords.length === 0) {
      return [];
    }
    
    return provenanceRecords.filter(record => {
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
  };

  return (
    <ProvenanceContext.Provider
      value={{
        // State
        selectedDatasetId,
        provenanceRecords: getFilteredRecords(),
        provenanceGraph,
        selectedRecord,
        loading,
        graphLoading,
        error,
        filters,
        verificationResult,
        verifying,
        actionTypes: PROVENANCE_ACTION_TYPES,
        
        // Setters
        setSelectedDatasetId,
        setSelectedRecord,
        setFilters,
        
        // Actions
        fetchProvenanceHistory,
        fetchProvenanceGraph,
        createProvenanceRecord,
        recordDatasetUsage,
        verifyProvenance
      }}
    >
      {children}
    </ProvenanceContext.Provider>
  );
};

ProvenanceProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the ProvenanceContext
export const useProvenanceContext = () => useContext(ProvenanceContext);