import { ethers } from 'ethers';
import networks, { defaultNetwork } from '../config/networks';
import contracts from '../constants/contracts';

/**
 * Connect to Web3 provider and return provider and signer
 * @returns {Promise<{provider: ethers.providers.Web3Provider, signer: ethers.Signer, address: string}>}
 */
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('No Web3 provider detected. Please install MetaMask or another Web3 wallet.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create ethers provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = accounts[0];
    
    // Check if on the correct network
    const { chainId } = await provider.getNetwork();
    const requiredChainId = networks[defaultNetwork].chainId;
    
    if (chainId !== requiredChainId) {
      try {
        // Try to switch to the correct network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${requiredChainId.toString(16)}` }]
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          const network = networks[defaultNetwork];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${requiredChainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.currency,
                symbol: network.currency,
                decimals: 18
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer]
            }]
          });
        } else {
          throw switchError;
        }
      }
      
      // Refresh provider after network switch
      const updatedProvider = new ethers.providers.Web3Provider(window.ethereum);
      const updatedSigner = updatedProvider.getSigner();
      
      return { provider: updatedProvider, signer: updatedSigner, address };
    }
    
    return { provider, signer, address };
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

/**
 * Get contract instance
 * @param {string} contractName Name of the contract
 * @param {ethers.providers.Web3Provider|ethers.Signer} providerOrSigner Provider or signer
 * @returns {ethers.Contract} Contract instance
 */
export const getContract = (contractName, providerOrSigner) => {
  const { address, abi } = contracts[contractName];
  return new ethers.Contract(address, abi, providerOrSigner);
};

/**
 * Sign a message with the user's wallet
 * @param {string} message Message to sign
 * @param {ethers.Signer} signer Signer
 * @returns {Promise<string>} Signature
 */
export const signMessage = async (message, signer) => {
  return await signer.signMessage(message);
};

/**
 * Format an address for display
 * @param {string} address Ethereum address
 * @returns {string} Formatted address (e.g., 0x1234...5678)
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Check if the provided address is valid
 * @param {string} address Ethereum address
 * @returns {boolean} Whether the address is valid
 */
export const isValidAddress = (address) => {
  return ethers.utils.isAddress(address);
};
