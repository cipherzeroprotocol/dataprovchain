import { useState, useCallback } from 'react';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { getContract } from '../utils/web3';

export const useAttribution = (signer) => {
  const [attributions, setAttributions] = useState([]);
  const [royalties, setRoyalties] = useState(null);
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState(null);

  // Get attributions for a dataset
  const getAttributions = useCallback(async (datasetId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.ATTRIBUTION.BY_DATASET(datasetId));
      setAttributions(response);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get royalties for a dataset
  const getRoyalties = useCallback(async (datasetId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.ATTRIBUTION.ROYALTIES(datasetId));
      setRoyalties(response);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Distribute royalties for a dataset
  const distributeRoyalties = useCallback(async (datasetId, amount) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setDistributing(true);
      setError(null);
      
      // Get contract instance
      const attributionContract = getContract('AttributionManager', signer);
      
      // Distribute royalties on blockchain
      const tx = await attributionContract.distributeRoyalties(datasetId, {
        value: amount
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Record distribution on backend
      const response = await api.post(`${API_ENDPOINTS.ATTRIBUTION.ROYALTIES(datasetId)}/distribute`, {
        transactionHash: receipt.transactionHash,
        amount
      });
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setDistributing(false);
    }
  }, [signer]);

  return {
    attributions,
    royalties,
    loading,
    distributing,
    error,
    getAttributions,
    getRoyalties,
    distributeRoyalties
  };
};
