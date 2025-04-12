 import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { API_ROUTES } from '../constants/routes';
import api from '../services/api';

export const MarketplaceContext = createContext();

export const MarketplaceProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [userPurchases, setUserPurchases] = useState([]);
  const [userSales, setUserSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  
  const [filters, setFilters] = useState({
    dataType: '',
    priceMin: null,
    priceMax: null,
    searchQuery: '',
    creator: '',
    sortBy: 'newest'
  });

  // Load listings on mount
  useEffect(() => {
    fetchListings();
    
    if (isAuthenticated) {
      fetchUserPurchases();
      fetchUserSales();
    }
  }, [isAuthenticated]);

  // Fetch all marketplace listings
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ROUTES.MARKETPLACE.LISTINGS);
      setListings(response.data.data);
      
      return response.data.data;
    } catch (err) {
      setError(`Error fetching listings: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single listing by ID
  const fetchListing = async (listingId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ROUTES.MARKETPLACE.GET_LISTING(listingId));
      const listing = response.data.data;
      
      setSelectedListing(listing);
      
      return listing;
    } catch (err) {
      setError(`Error fetching listing: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new marketplace listing
  const createListing = async (listingData) => {
    if (!isAuthenticated) {
      setError('You must be authenticated to create a listing');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(API_ROUTES.MARKETPLACE.CREATE_LISTING, listingData);
      const newListing = response.data.data;
      
      // Update local state with the new listing
      setListings(prev => [newListing, ...prev]);
      setSelectedListing(newListing);
      
      return newListing;
    } catch (err) {
      setError(`Error creating listing: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing listing
  const updateListing = async (listingId, listingData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(API_ROUTES.MARKETPLACE.UPDATE_LISTING(listingId), listingData);
      const updatedListing = response.data.data;
      
      // Update local state
      setListings(prev => 
        prev.map(listing => 
          listing.id === updatedListing.id ? updatedListing : listing
        )
      );
      
      if (selectedListing?.id === updatedListing.id) {
        setSelectedListing(updatedListing);
      }
      
      return updatedListing;
    } catch (err) {
      setError(`Error updating listing: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a listing
  const deleteListing = async (listingId) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(API_ROUTES.MARKETPLACE.DELETE_LISTING(listingId));
      
      // Update local state
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      
      if (selectedListing?.id === listingId) {
        setSelectedListing(null);
      }
      
      return true;
    } catch (err) {
      setError(`Error deleting listing: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Purchase a dataset
  const purchaseDataset = async (listingId) => {
    if (!isAuthenticated) {
      setError('You must be authenticated to purchase a dataset');
      return null;
    }

    try {
      setPurchaseInProgress(true);
      setError(null);
      
      const response = await api.post(API_ROUTES.MARKETPLACE.PURCHASE(listingId));
      const purchase = response.data.data;
      
      // Update purchases list
      fetchUserPurchases();
      
      return purchase;
    } catch (err) {
      setError(`Error purchasing dataset: ${err.message}`);
      return null;
    } finally {
      setPurchaseInProgress(false);
    }
  };

  // Fetch user purchases
  const fetchUserPurchases = async () => {
    if (!isAuthenticated) {
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ROUTES.MARKETPLACE.USER_PURCHASES);
      setUserPurchases(response.data.data);
      
      return response.data.data;
    } catch (err) {
      setError(`Error fetching purchases: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch user sales
  const fetchUserSales = async () => {
    if (!isAuthenticated) {
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(API_ROUTES.MARKETPLACE.USER_SALES);
      setUserSales(response.data.data);
      
      return response.data.data;
    } catch (err) {
      setError(`Error fetching sales: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search listings
  const searchListings = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`${API_ROUTES.MARKETPLACE.LISTINGS}?search=${query}`);
      setListings(response.data.data);
      
      return response.data.data;
    } catch (err) {
      setError(`Error searching listings: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Check if user already owns a dataset
  const userOwnsDataset = (datasetId) => {
    if (!isAuthenticated || !userPurchases || userPurchases.length === 0) {
      return false;
    }
    
    return userPurchases.some(purchase => purchase.datasetId === datasetId);
  };

  // Get filtered listings
  const getFilteredListings = () => {
    if (!listings || listings.length === 0) {
      return [];
    }
    
    let filteredListings = [...listings];
    
    // Filter by data type
    if (filters.dataType) {
      filteredListings = filteredListings.filter(
        listing => listing.dataType === filters.dataType
      );
    }
    
    // Filter by price range
    if (filters.priceMin !== null) {
      filteredListings = filteredListings.filter(
        listing => parseFloat(listing.price) >= parseFloat(filters.priceMin)
      );
    }
    
    if (filters.priceMax !== null) {
      filteredListings = filteredListings.filter(
        listing => parseFloat(listing.price) <= parseFloat(filters.priceMax)
      );
    }
    
    // Filter by creator
    if (filters.creator) {
      filteredListings = filteredListings.filter(
        listing => listing.seller?.toLowerCase().includes(filters.creator.toLowerCase())
      );
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredListings = filteredListings.filter(listing => 
        listing.name?.toLowerCase().includes(query) || 
        listing.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filteredListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filteredListings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price_low_high':
        filteredListings.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_high_low':
        filteredListings.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      default:
        // Default is newest first
        filteredListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return filteredListings;
  };

  return (
    <MarketplaceContext.Provider
      value={{
        // State
        listings: getFilteredListings(),
        allListings: listings,
        selectedListing,
        userPurchases,
        userSales,
        loading,
        error,
        filters,
        purchaseInProgress,
        
        // Setters
        setSelectedListing,
        setFilters,
        
        // Actions
        fetchListings,
        fetchListing,
        createListing,
        updateListing,
        deleteListing,
        purchaseDataset,
        fetchUserPurchases,
        fetchUserSales,
        searchListings,
        userOwnsDataset
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

MarketplaceProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the MarketplaceContext
export const useMarketplaceContext = () => useContext(MarketplaceContext);