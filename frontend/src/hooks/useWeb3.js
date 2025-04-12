import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { CHAIN_IDS, NETWORKS, DEFAULT_NETWORK } from '../constants/chains';
import { getExplorerUrl } from '../utils/explorer';
import api from '../services/api';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        [CHAIN_IDS.ETHEREUM]: process.env.REACT_APP_ETHEREUM_RPC,
        [CHAIN_IDS.POLYGON]: process.env.REACT_APP_POLYGON_RPC,
        [CHAIN_IDS.FILECOIN]: process.env.REACT_APP_FILECOIN_RPC,
      },
    },
  },
};

export const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [web3Modal, setWeb3Modal] = useState(null);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [networkName, setNetworkName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [explorerUrl, setExplorerUrl] = useState('');

  // Initialize web3Modal
  useEffect(() => {
    const modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
      theme: 'dark',
    });
    setWeb3Modal(modal);
  }, []);

  // Auto-connect if cached provider exists
  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [connectWallet, web3Modal]);

  // Update network info when chainId changes
  useEffect(() => {
    if (chainId) {
      const network = NETWORKS[chainId] || { name: 'Unknown Network' };
      setNetworkName(network.name);
      setExplorerUrl(getExplorerUrl(chainId));
    }
  }, [chainId]);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    if (!web3Modal) return;
    
    try {
      setConnecting(true);
      setError(null);
      
      // Connect to Web3Modal
      const web3ModalProvider = await web3Modal.connect();
      
      // Create ethers provider
      const ethersProvider = new ethers.providers.Web3Provider(web3ModalProvider);
      setProvider(ethersProvider);
      
      // Get signer
      const signer = ethersProvider.getSigner();
      setSigner(signer);
      
      // Get address
      const address = await signer.getAddress();
      setAddress(address);
      
      // Get network
      const network = await ethersProvider.getNetwork();
      setChainId(network.chainId);
      
      // Set up event listeners
      web3ModalProvider.on('accountsChanged', (accounts) => {
        setAddress(accounts[0]);
        window.location.reload();
      });
      
      web3ModalProvider.on('chainChanged', () => {
        window.location.reload();
      });
      
      // Sync with backend
      await api.post('/auth/wallet', { address });
      
      return { provider: ethersProvider, signer, address, chainId: network.chainId };
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [web3Modal]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    if (web3Modal) {
      web3Modal.clearCachedProvider();
    }
    
    setProvider(null);
    setSigner(null);
    setAddress('');
    setChainId(null);
    setNetworkName('');
    
    // Clear auth on backend
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [web3Modal]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId) => {
    if (!provider) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Get the provider from the Web3Modal
      
      // Switch to the target chain
      await provider.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      // The page will reload due to the chainChanged event
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const network = NETWORKS[targetChainId];
          if (!network) {
            throw new Error('Unknown network');
          }
          
          await provider.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: network.currency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          setError(addError.message);
          throw addError;
        }
      } else {
        setError(switchError.message);
        throw switchError;
      }
    }
  }, [provider]);

  // Check if connected to the correct network
  const checkNetwork = useCallback((requiredChainId = DEFAULT_NETWORK) => {
    return chainId === requiredChainId;
  }, [chainId]);

  // Sign message for authentication
  const signMessage = useCallback(async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [signer]);

  // Send transaction
  const sendTransaction = useCallback(async (to, value, data = '0x') => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(value.toString()),
        data,
      });
      
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [signer]);

  return {
    provider,
    signer,
    address,
    chainId,
    networkName,
    explorerUrl,
    connecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    checkNetwork,
    signMessage,
    sendTransaction,
  };
};

export default useWeb3;