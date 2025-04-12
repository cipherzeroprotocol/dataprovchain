import { useState, useCallback } from 'react';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { getContract } from '../utils/web3';
import { ethers } from 'ethers';

export const useMarketplace = (signer) => {
  const [listings, setListings] = useState([]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Get marketplace listings with filters
  const getListings = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.MARKETPLACE.LISTINGS, { params: filters });
      
      setListings(response.listings);
      setPagination(response.pagination);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get listing details by ID
  const getListing = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ENDPOINTS.MARKETPLACE.LISTING_BY_ID(id));
      setListing(response);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new listing
  const createListing = useCallback(async (listingData) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // Get contract instance
      const marketplaceContract = getContract('Marketplace', signer);
      
      // Format price for blockchain (convert to wei)
      const price = ethers.utils.parseUnits(listingData.price.toString(), 'ether');
      
      // Calculate duration in seconds
      const duration = listingData.duration * 24 * 60 * 60; // Convert days to seconds
      
      // Create listing on blockchain
      const tx = await marketplaceContract.createListing(
        listingData.datasetId,
        price,
        listingData.licenseType,
        duration
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Get listing ID from event logs
      const event = receipt.events.find(e => e.event === 'ListingCreated');
      const listingId = event.args.listingId.toString();
      
      // Register listing on backend with additional details
      const response = await api.post(API_ENDPOINTS.MARKETPLACE.LISTINGS, {
        ...listingData,
        listingId,
        transactionHash: receipt.transactionHash
      });
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [signer]);

  // Purchase a listing
  const purchaseListing = useCallback(async (listingId, price) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setPurchasing(true);
      setError(null);
      
      // Get contract instance
      const marketplaceContract = getContract('Marketplace', signer);
      
      // Purchase listing on blockchain
      const tx = await marketplaceContract.purchaseListing(listingId, {
        value: price
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Record purchase on backend
      const response = await api.post(API_ENDPOINTS.MARKETPLACE.PURCHASE(listingId), {
        transactionHash: receipt.transactionHash
      });
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setPurchasing(false);
    }
  }, [signer]);

  return {
    listings,
    listing,
    loading,
    error,
    purchasing,
    creating,
    pagination,
    getListings,
    getListing,
    createListing,
    purchaseListing
  };
};
