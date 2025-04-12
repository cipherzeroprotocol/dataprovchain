import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { WalletContext } from '../../contexts/WalletContext';
import MainLayout from './MainLayout';
import Sidebar from './Sidebar';

const AuthLayout = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const { isConnected } = useContext(WalletContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && (!isConnected || !isAuthenticated)) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isConnected, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  // Only render the content if authenticated
  if (!isAuthenticated || !isConnected) {
    return null;
  }

  return (
    <MainLayout>
      <div className="flex h-screen">
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar />
          </div>
        </div>
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthLayout;
