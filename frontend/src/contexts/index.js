import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from './AuthContext';
import { WalletContext, WalletProvider } from './WalletContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { ContractProvider } from './ContractContext';
import { DatasetProvider } from './DatasetContext';
import { ProvenanceProvider } from './ProvenanceContext';
import { MarketplaceProvider } from './MarketplaceContext';

// Re-export all contexts for easy imports
export * from './AuthContext';
export * from './WalletContext';
export * from './ThemeContext';
export * from './NotificationContext';
export * from './ContractContext';
export * from './DatasetContext';
export * from './ProvenanceContext';
export * from './MarketplaceContext';

// Main context provider that wraps all other providers
const AppContextProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <WalletProvider>
          <AuthProvider>
            <ContractProvider>
              <DatasetProvider>
                <ProvenanceProvider>
                  <MarketplaceProvider>
                    {children}
                  </MarketplaceProvider>
                </ProvenanceProvider>
              </DatasetProvider>
            </ContractProvider>
          </AuthProvider>
        </WalletProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hooks for consuming contexts
export { useContext as useContextHook } from 'react';
export { WalletContext };

export default AppContextProvider;