import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { getUserProfile, loginWithWallet, logout, isAuthenticated } from '../services/auth';
import { WalletContext } from './WalletContext';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { account, signer, isConnected } = useContext(WalletContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile if authenticated
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated()) {
        try {
          setLoading(true);
          const profile = await getUserProfile();
          setUser(profile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          // If token is invalid, logout
          logout();
          setError('Your session has expired. Please log in again.');
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
    }
    
    AuthProvider.propTypes = {
      children: PropTypes.node.isRequired,
    };
    };

    loadUserProfile();
  }, []);

  // Login with wallet
  const login = async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await loginWithWallet(account, signer);
      setUser(response.user);
      
      return response.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        error,
        login,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
