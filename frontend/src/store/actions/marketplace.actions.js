import { createAsyncThunk } from '@reduxjs/toolkit';
import * as marketplaceService from '../../services/marketplace';
import { 
  setLoading, 
  setPurchasing, 
  setError, 
  setListings, 
  setListing, 
  setPagination, 
  addListing, 
  updateListing, 
  removeListing 
} from '../reducers/marketplace.reducer';

// Get marketplace listings
export const getListings = createAsyncThunk(
  'marketplace/getListings',
  async (filters = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await marketplaceService.getListings(filters);
      
      dispatch(setListings(result.listings));
      dispatch(setPagination(result.pagination));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get listing by ID
export const getListingById = createAsyncThunk(
  'marketplace/getListingById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await marketplaceService.getListing(id);
      
      dispatch(setListing(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Create listing
export const createListing = createAsyncThunk(
  'marketplace/createListing',
  async (listingData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await marketplaceService.createListing(listingData);
      
      dispatch(addListing(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update listing
export const updateListingById = createAsyncThunk(
  'marketplace/updateListingById',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await marketplaceService.updateListing(id, data);
      
      dispatch(updateListing(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete listing
export const deleteListing = createAsyncThunk(
  'marketplace/deleteListing',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      await marketplaceService.deleteListing(id);
      
      dispatch(removeListing(id));
      
      return id;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Purchase listing
export const purchaseListing = createAsyncThunk(
  'marketplace/purchaseListing',
  async ({ id, price, signature }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setPurchasing(true));
      
      const result = await marketplaceService.purchaseListing(id, {
        price,
        signature
      });
      
      dispatch(updateListing(result.listing));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setPurchasing(false));
    }
  }
);
