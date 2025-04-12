import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import PropTypes from 'prop-types';
import { WalletContext } from './WalletContext';
import contractAddresses from '../config/contracts';

// Import ABI files
import DatasetRegistryABI from '../contracts/DatasetRegistry.json';
import MarketplaceABI from '../contracts/Marketplace.json';
import ProvenanceABI from '../contracts/Provenance.json';
import AttributionABI from '../contracts/Attribution.json';
import GovernanceABI from '../contracts/Governance.json';

export const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const { provider, chainId, account } = useContext(WalletContext);
  
  const [contracts, setContracts] = useState({
    datasetRegistry: null,
    marketplace: null,
    provenance: null,
    attribution: null,
    governance: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeContracts = async () => {
      if (!provider || !chainId) {
        setContracts({
          datasetRegistry: null,
          marketplace: null,
          provenance: null,
          attribution: null,
          governance: null,
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get contract addresses for the current network
        const addresses = contractAddresses[chainId] || contractAddresses['default'];
        
        if (!addresses) {
          throw new Error(`No contract addresses found for chain ID ${chainId}`);
        }

        // Create contract instances
        const signer = account ? provider.getSigner() : provider;
        
        const datasetRegistry = new ethers.Contract(
          addresses.datasetRegistry,
          DatasetRegistryABI.abi,
          signer
        );
        
        const marketplace = new ethers.Contract(
          addresses.marketplace,
          MarketplaceABI.abi,
          signer
        );
        
        const provenance = new ethers.Contract(
          addresses.provenance,
          ProvenanceABI.abi,
          signer
        );
        
        const attribution = new ethers.Contract(
          addresses.attribution,
          AttributionABI.abi,
          signer
        );
        
        const governance = new ethers.Contract(
          addresses.governance,
          GovernanceABI.abi,
          signer
        );

        setContracts({
          datasetRegistry,
          marketplace,
          provenance,
          attribution,
          governance,
        });
      } catch (err) {
        console.error('Failed to initialize contracts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
    }
    
    ContractProvider.propTypes = {
      children: PropTypes.node.isRequired,
    };
    };

    initializeContracts();
  }, [provider, chainId, account]);

  return (
    <ContractContext.Provider
      value={{
        contracts,
        loading,
        error,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
