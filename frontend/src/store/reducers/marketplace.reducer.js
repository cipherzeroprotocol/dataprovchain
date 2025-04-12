import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listings: [],
  listing: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  loading: false,
  purchasing: false,
  error: null
};

export const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPurchasing: (state, action) => {
      state.purchasing = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setListings: (state, action) => {
      state.listings = action.payload;
    },
    setListing: (state, action) => {
      state.listing = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    addListing: (state, action) => {
      state.listings = [action.payload, ...state.listings];
    },
    updateListing: (state, action) => {
      if (state.listing && state.listing.id === action.payload.id) {
        state.listing = action.payload;
      }
      
      state.listings = state.listings.map(listing => 
        listing.id === action.payload.id ? action.payload : listing
      );
    },
    removeListing: (state, action) => {
      state.listings = state.listings.filter(listing => listing.id !== action.payload);
    }
  }
});

export const {
  setLoading,
  setPurchasing,
  setError,
  setListings,
  setListing,
  setPagination,
  addListing,
  updateListing,
  removeListing
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
