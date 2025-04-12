/**
 * Web3 utilities for blockchain interactions
 */
const { ethers } = require('ethers');
const logger = require('./logger');

/**
 * Create an ethers provider based on the RPC URL
 * @param {string} rpcUrl - The RPC URL to connect to
 * @returns {ethers.providers.JsonRpcProvider} - An ethers provider
 */
const createProvider = (rpcUrl) => {
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

/**
 * Create a wallet instance from a private key
 * @param {string} privateKey - Private key for the wallet
 * @param {ethers.providers.Provider} provider - An ethers provider
 * @returns {ethers.Wallet} - An ethers wallet
 */
const createWallet = (privateKey, provider) => {
  return new ethers.Wallet(privateKey, provider);
};

/**
 * Verify an EIP-712 signature
 * @param {string} address - The address that supposedly signed the message
 * @param {Object} typedData - The EIP-712 typed data that was signed
 * @param {string} signature - The signature to verify
 * @returns {boolean} - Whether the signature is valid
 */
const verifyTypedDataSignature = (address, typedData, signature) => {
  try {
    const recoveredAddress = ethers.utils.verifyTypedData(
      typedData.domain,
      { [typedData.primaryType]: typedData.types[typedData.primaryType] },
      typedData.message,
      signature
    );
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    logger.error('Error verifying typed data signature', { error: error.message });
    return false;
  }
};

/**
 * Verify a personal signature
 * @param {string} address - The address that supposedly signed the message
 * @param {string} message - The message that was signed
 * @param {string} signature - The signature to verify
 * @returns {boolean} - Whether the signature is valid
 */
const verifyPersonalSignature = (address, message, signature) => {
  try {
    const msgHash = ethers.utils.hashMessage(message);
    const recoveredAddress = ethers.utils.recoverAddress(msgHash, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    logger.error('Error verifying personal signature', { error: error.message });
    return false;
  }
};

/**
 * Format an Ethereum address for display
 * @param {string} address - The Ethereum address to format
 * @returns {string} - The formatted address (e.g., 0x1234...5678)
 */
const formatAddress = (address) => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Check if an address is valid
 * @param {string} address - The address to check
 * @returns {boolean} - Whether the address is valid
 */
const isValidAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

/**
 * Convert wei to ether
 * @param {string|number} wei - The amount in wei
 * @returns {string} - The amount in ether
 */
const weiToEther = (wei) => {
  return ethers.utils.formatEther(wei);
};

/**
 * Convert ether to wei
 * @param {string|number} ether - The amount in ether
 * @returns {ethers.BigNumber} - The amount in wei as a BigNumber
 */
const etherToWei = (ether) => {
  return ethers.utils.parseEther(ether.toString());
};

module.exports = {
  createProvider,
  createWallet,
  verifyTypedDataSignature,
  verifyPersonalSignature,
  formatAddress,
  isValidAddress,
  weiToEther,
  etherToWei
};