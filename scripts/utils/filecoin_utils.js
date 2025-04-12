// scripts/utils/filecoin_utils.js

const { ethers } = require('hardhat');

/**
 * Gets the Filecoin RPC URL for the current network
 * @returns {string} - Filecoin RPC URL
 */
function getFilecoinRpcUrl() {
  let rpcUrl;
  
  // Use RPC URL based on the network
  const network = process.env.HARDHAT_NETWORK || 'localhost';
  
  if (network === 'calibrationnet') {
    rpcUrl = process.env.FILECOIN_CALIBRATION_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1';
  } else if (network === 'mainnet') {
    rpcUrl = process.env.FILECOIN_MAINNET_RPC_URL;
  } else {
    // Local development network
    rpcUrl = 'http://localhost:8545';
  }
  
  return rpcUrl;
}

/**
 * Checks if a Filecoin address is valid
 * @param {string} address - Filecoin address to check
 * @returns {boolean} - Whether the address is valid
 */
function isValidFilecoinAddress(address) {
  // Simple validation for f0, f1, f2, f3 addresses
  return /^f[0-3][a-z0-9]{7,}$/i.test(address);
}

/**
 * Converts a Filecoin address to an Ethereum address
 * @param {string} filecoinAddress - Filecoin address
 * @returns {string} - Ethereum address
 */
function filecoinToEthAddress(filecoinAddress) {
  // This is a simplified implementation
  // In a real implementation, you'd use proper conversion libraries
  if (filecoinAddress.startsWith('f410')) {
    // f410 addresses can be directly converted to Ethereum addresses
    const hex = filecoinAddress.slice(4);
    return `0x${hex}`;
  }
  
  throw new Error('Non-f410 addresses cannot be directly converted to Ethereum addresses');
}

module.exports = {
  getFilecoinRpcUrl,
  isValidFilecoinAddress,
  filecoinToEthAddress
};