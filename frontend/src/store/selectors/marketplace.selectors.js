// Marketplace selectors
// These selectors help extract and compute data from the marketplace state

import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectMarketplaceState = state => state.marketplace;
export const selectListings = state => selectMarketplaceState(state).listings || [];
export const selectCurrentListing = state => selectMarketplaceState(state).listing;
export const selectLoading = state => selectMarketplaceState(state).loading;
export const selectError = state => selectMarketplaceState(state).error;
export const selectPurchasing = state => selectMarketplaceState(state).purchasing;
export const selectPagination = state => selectMarketplaceState(state).pagination;

// Computed selectors
export const selectListingById = createSelector(
  [selectListings, (_, id) => id],
  (listings, id) => listings.find(listing => listing.id === id) || null
);

export const selectListingsByType = createSelector(
  [selectListings, (_, dataType) => dataType],
  (listings, dataType) => listings.filter(listing => listing.dataType === dataType)
);

export const selectVerifiedListings = createSelector(
  [selectListings],
  (listings) => listings.filter(listing => listing.verified)
);

export const selectListingsByCreator = createSelector(
  [selectListings, (_, creator) => creator],
  (listings, creator) => listings.filter(listing => listing.creator?.walletAddress === creator)
);

export const selectListingsByPriceRange = createSelector(
  [selectListings, (_, { min, max }) => ({ min, max })],
  (listings, { min, max }) => listings.filter(listing => {
    const price = parseFloat(listing.price);
    if (min !== undefined && price < min) return false;
    if (max !== undefined && price > max) return false;
    return true;
  })
);

export const selectListingsWithTags = createSelector(
  [selectListings, (_, tags) => tags],
  (listings, tags) => {
    if (!tags || !tags.length) return listings;
    return listings.filter(listing => {
      if (!listing.tags) return false;
      return tags.some(tag => listing.tags.includes(tag));
    });
  }
);

// Count selectors
export const selectTotalListings = createSelector(
  [selectListings],
  listings => listings.length
);

export const selectTotalVerifiedListings = createSelector(
  [selectVerifiedListings],
  listings => listings.length
);

export const selectDataTypes = createSelector(
  [selectListings],
  listings => [...new Set(listings.map(listing => listing.dataType))]
    .filter(Boolean)
    .sort()
);

export const selectAllTags = createSelector(
  [selectListings],
  listings => {
    const tagSet = new Set();
    listings.forEach(listing => {
      if (listing.tags && Array.isArray(listing.tags)) {
        listing.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }
);

export const selectPriceRange = createSelector(
  [selectListings],
  listings => {
    if (!listings.length) return { min: 0, max: 0 };
    
    const prices = listings.map(listing => parseFloat(listing.price) || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
);