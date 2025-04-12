import { useState, useCallback } from 'react';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { getContract } from '../utils/web3';

export const useProvenance = (signer) => {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);

  // Get provenance graph for a dataset
  const getProvenanceGraph = useCallback(async (datasetId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.PROVENANCE.GRAPH(datasetId));
      setGraph(response);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Record dataset usage in an AI model
  const recordUsage = useCallback(async (usageData) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setRecording(true);
      setError(null);
      
      // Get contract instance
      const attributionContract = getContract('AttributionManager', signer);
      
      // Record attribution on blockchain
      const tx = await attributionContract.recordAttribution(
        usageData.datasetId,
        usageData.modelId,
        usageData.usageType,
        usageData.impactScore
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Record detailed usage information on backend
      const response = await api.post(API_ENDPOINTS.PROVENANCE.USAGE, {
        ...usageData,
        transactionHash: receipt.transactionHash
      });
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setRecording(false);
    }
  }, [signer]);

  // Verify a provenance claim
  const verifyProvenance = useCallback(async (provenanceId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`${API_ENDPOINTS.PROVENANCE.BASE}/${provenanceId}/verify`);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    graph,
    loading,
    recording,
    error,
    getProvenanceGraph,
    recordUsage,
    verifyProvenance
  };
};
