// Auth selectors
// These selectors help access authentication state throughout the application

import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectAuthState = state => state.auth;
export const selectUser = state => selectAuthState(state).user;
export const selectToken = state => selectAuthState(state).token;
export const selectLoading = state => selectAuthState(state).loading;
export const selectError = state => selectAuthState(state).error;
export const selectIsAuthenticated = state => !!selectToken(state);
export const selectAuthenticating = state => selectAuthState(state).authenticating;
export const selectRegistering = state => selectAuthState(state).registering;

// User data selectors
export const selectUserId = createSelector(
  [selectUser],
  user => user?.id || null
);

export const selectUsername = createSelector(
  [selectUser],
  user => user?.username || null
);

export const selectUserWalletAddress = createSelector(
  [selectUser],
  user => user?.walletAddress || null
);

export const selectUserRole = createSelector(
  [selectUser],
  user => user?.role || 'user'
);

export const selectUserEmail = createSelector(
  [selectUser],
  user => user?.email || null
);

export const selectUserProfile = createSelector(
  [selectUser],
  user => user?.profile || null
);

// Status selectors
export const selectIsAdmin = createSelector(
  [selectUserRole],
  role => role === 'admin'
);

export const selectIsVerified = createSelector(
  [selectUser],
  user => user?.emailVerified || false
);

export const selectHasWallet = createSelector(
  [selectUserWalletAddress],
  address => !!address
);

export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectLoading, selectError],
  (isAuthenticated, loading, error) => ({
    isAuthenticated,
    loading,
    error,
    initialized: !loading || isAuthenticated || !!error
  })
);