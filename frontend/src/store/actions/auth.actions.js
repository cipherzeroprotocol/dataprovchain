import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/auth';
import { 
  setLoading, 
  setAuthenticating, 
  setRegistering, 
  setError, 
  setUser, 
  setToken, 
  updateUser, 
  logout as logoutAction, 
  clearError 
} from '../reducers/auth.reducer';

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthenticating(true));
      dispatch(clearError());
      
      const result = await authService.login(credentials);
      
      dispatch(setUser(result.user));
      dispatch(setToken(result.token));
      
      // Store token in local storage
      localStorage.setItem('token', result.token);
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setAuthenticating(false));
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setRegistering(true));
      dispatch(clearError());
      
      const result = await authService.register(userData);
      
      dispatch(setUser(result.user));
      dispatch(setToken(result.token));
      
      // Store token in local storage
      localStorage.setItem('token', result.token);
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setRegistering(false));
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    // Clear token from local storage
    localStorage.removeItem('token');
    
    // Clear user from state
    dispatch(logoutAction());
    
    return true;
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      const result = await authService.getCurrentUser();
      
      dispatch(setUser(result));
      dispatch(setToken(token));
      
      return result;
    } catch (error) {
      // If getting current user fails, clear token and user
      localStorage.removeItem('token');
      dispatch(logoutAction());
      
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await authService.updateProfile(profileData);
      
      dispatch(updateUser(result));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Connect wallet
export const connectWallet = createAsyncThunk(
  'auth/connectWallet',
  async (walletAddress, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await authService.connectWallet(walletAddress);
      
      dispatch(updateUser({ walletAddress: result.walletAddress }));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Verify email
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verificationToken, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await authService.verifyEmail(verificationToken);
      
      dispatch(updateUser({ emailVerified: true }));
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Request password reset
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await authService.requestPasswordReset(email);
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      const result = await authService.resetPassword(token, newPassword);
      
      return result;
    } catch (error) {
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);