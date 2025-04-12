import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { CONTRACT_ADDRESSES } from '../constants/contracts';

// Contract ABIs
import DatasetRegistryABI from '../assets/abis/DatasetRegistry.json';
import MarketplaceABI from '../assets/abis/Marketplace.json';
import AttributionManagerABI from '../assets/abis/AttributionManager.json';
import DataDAOABI from '../assets/abis/DataDAO.json';
import RoyaltyDistributorABI from '../assets/abis/RoyaltyDistributor.json';
import FilecoinDealClientABI from '../assets/abis/FilecoinDealClient.json';
import DataProvChainABI from '../assets/abis/DataProvChain.json';

// Contract types
const CONTRACTS = {
  DATASET_REGISTRY: 'DatasetRegistry',
  MARKETPLACE: 'Marketplace',
  ATTRIBUTION_MANAGER: 'AttributionManager',
  DATA_DAO: 'DataDAO',
  ROYALTY_DISTRIBUTOR: 'RoyaltyDistributor',
  FILECOIN_DEAL_CLIENT: 'FilecoinDealClient',
  DATA_PROV_CHAIN: 'DataProvChain'
};

// ABI mapping
const CONTRACT_ABIS = {
  [CONTRACTS.DATASET_REGISTRY]: DatasetRegistryABI,
  [CONTRACTS.MARKETPLACE]: MarketplaceABI,
  [CONTRACTS.ATTRIBUTION_MANAGER]: AttributionManagerABI,
  [CONTRACTS.DATA_DAO]: DataDAOABI,
  [CONTRACTS.ROYALTY_DISTRIBUTOR]: RoyaltyDistributorABI,
  [CONTRACTS.FILECOIN_DEAL_CLIENT]: FilecoinDealClientABI,
  [CONTRACTS.DATA_PROV_CHAIN]: DataProvChainABI
};

export const useContract = (contractType, readOnly = false) => {
  const { provider, signer, chainId } = useWeb3();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the contract instance
  const getContract = useCallback(async () => {
    if (!contractType || !CONTRACT_ABIS[contractType]) {
      setError('Invalid contract type');
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if we have contract addresses for this chain
      if (!chainId || !CONTRACT_ADDRESSES[chainId]) {
        setError(`Contract not deployed on current network (Chain ID: ${chainId})`);
        setLoading(false);
        return null;
      }

      // Get contract address for this chain
      const contractAddress = CONTRACT_ADDRESSES[chainId][contractType];
      
      if (!contractAddress) {
        setError(`Contract address not found for ${contractType} on chain ${chainId}`);
        setLoading(false);
        return null;
      }

      // Get contract ABI
      const abi = CONTRACT_ABIS[contractType];
      
      // Create contract instance
      let contractInstance;
      if (readOnly || !signer) {
        // Use provider for read-only operations
        contractInstance = new ethers.Contract(contractAddress, abi, provider);
      } else {
        // Use signer for transactions
        contractInstance = new ethers.Contract(contractAddress, abi, signer);
      }

      setContract(contractInstance);
      setLoading(false);
      return contractInstance;
    } catch (err) {
      console.error(`Error initializing ${contractType} contract:`, err);
      setError(err.message || `Failed to initialize ${contractType} contract`);
      setLoading(false);
      return null;
    }
  }, [contractType, provider, signer, chainId, readOnly]);

  // Initialize contract when dependencies change
  useEffect(() => {
    if ((provider || signer)) {
      getContract();
    } else {
      setContract(null);
      setLoading(false);
    }
  }, [provider, signer, chainId, contractType, readOnly, getContract]);

  // Reinitialize contract on demand
  const refreshContract = useCallback(() => {
    return getContract();
  }, [getContract]);

  return {
    contract,
    loading,
    error,
    refreshContract,
    contractAddress: chainId && CONTRACT_ADDRESSES[chainId]?.[contractType]
  };
};

// Export contract types for easy access
export { CONTRACTS };
export default useContract;