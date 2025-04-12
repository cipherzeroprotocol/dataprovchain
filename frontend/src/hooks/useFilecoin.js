import { useState, useCallback } from 'react';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { getContract } from '../utils/web3';

export const useFilecoin = (signer) => {
  const [deals, setDeals] = useState([]);
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storing, setStoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Get all Filecoin deals for the user
  const getDeals = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.FILECOIN.DEALS, { params: filters });
      setDeals(response.deals);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific deal by ID
  const getDeal = useCallback(async (dealId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.FILECOIN.DEAL_BY_ID(dealId));
      setDeal(response);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Store dataset in Filecoin
  const storeInFilecoin = useCallback(async (datasetId, dealConfig) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setStoring(true);
      setProgress(0);
      setError(null);
      
      // Prepare dataset for Filecoin (create CAR files, etc.)
      const prepResponse = await api.post(
        API_ENDPOINTS.FILECOIN.PREPARE(datasetId), 
        dealConfig,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted / 2); // First half is preparation
          }
        }
      );
      
      // Get the prepared deal info
      const { dealParams, dealCid } = prepResponse;
      
      // Get contract instance
      const filecoinClient = getContract('FilecoinDealClient', signer);
      
      // Make proposal on chain
      const tx = await filecoinClient.makeDealProposal(
        dealParams.provider,
        dealParams.dataCid,
        dealParams.pieceCid,
        dealParams.size,
        dealParams.duration,
        dealParams.price
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Get deal ID from event logs
      const event = receipt.events.find(e => e.event === 'DealProposalCreated');
      const dealId = event.args.dealId.toString();
      
      setProgress(75); // Update progress
      
      // Finalize deal on backend
      const dealResponse = await api.post(API_ENDPOINTS.FILECOIN.DEALS, {
        datasetId,
        dealId,
        dealCid,
        transactionHash: receipt.transactionHash,
        ...dealParams
      });
      
      setProgress(100);
      
      return dealResponse;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setStoring(false);
    }
  }, [signer]);

  // Check deal status
  const checkDealStatus = useCallback(async (dealId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.FILECOIN.STATUS(dealId));
      
      // If this is the current deal, update its status
      if (deal && deal.id === dealId) {
        setDeal({
          ...deal,
          status: response.status,
          ...response.metadata
        });
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deal]);

  // Retrieve data from Filecoin deal
  const retrieveData = useCallback(async (dealId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(API_ENDPOINTS.FILECOIN.RETRIEVE(dealId));
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify deal on chain
  const verifyDeal = useCallback(async (dealId) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get contract instance
      const filecoinClient = getContract('FilecoinDealClient', signer);
      
      // Get deal info from backend
      const dealInfo = await api.get(API_ENDPOINTS.FILECOIN.DEAL_BY_ID(dealId));
      
      // Verify on chain
      const isActive = await filecoinClient.isDealActive(
        dealInfo.provider,
        dealInfo.dealId
      );
      
      // Update verification status on backend
      const response = await api.post(API_ENDPOINTS.FILECOIN.VERIFY(dealId), {
        verified: isActive
      });
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return {
    deals,
    deal,
    loading,
    storing,
    progress,
    error,
    getDeals,
    getDeal,
    storeInFilecoin,
    checkDealStatus,
    retrieveData,
    verifyDeal
  };
};

export default useFilecoin;