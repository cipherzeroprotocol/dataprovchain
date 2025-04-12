// filecoin/src/utils/config.js

/**
 * Configuration utilities for Filecoin integration
 */
class ConfigUtils {
    /**
     * Get the Filecoin API endpoint based on the network
     * @param {string} network - Network name (e.g., 'mainnet', 'calibrationnet')
     * @returns {string} - Filecoin API endpoint URL
     */
    static getFilecoinApiEndpoint(network = 'calibrationnet') {
      const endpoints = {
        mainnet: process.env.FILECOIN_MAINNET_API || 'https://api.node.glif.io/rpc/v1',
        calibrationnet: process.env.FILECOIN_CALIBRATION_API || 'https://api.calibration.node.glif.io/rpc/v1',
        localnet: process.env.FILECOIN_LOCALNET_API || 'http://localhost:1234/rpc/v1',
      };
      
      if (!endpoints[network]) {
        throw new Error(`Unknown network: ${network}`);
      }
      
      return endpoints[network];
    }
  
    /**
     * Get IPFS configuration
     * @returns {Object} - IPFS configuration
     */
    static getIpfsConfig() {
      return {
        endpoint: process.env.IPFS_API_ENDPOINT || 'https://ipfs.infura.io:5001',
        gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
        timeout: parseInt(process.env.IPFS_TIMEOUT || '60000', 10),
      };
    }
  
    /**
     * Get Web3.Storage configuration
     * @returns {Object} - Web3.Storage configuration
     */
    static getWeb3StorageConfig() {
      return {
        token: process.env.WEB3_STORAGE_TOKEN,
        endpoint: process.env.WEB3_STORAGE_ENDPOINT || 'https://api.web3.storage',
      };
    }
  
    /**
     * Get deal making configuration
     * @returns {Object} - Deal configuration
     */
    static getDealConfig() {
      return {
        defaultDuration: parseInt(process.env.DEFAULT_DEAL_DURATION || '525600', 10), // Default to ~1 year in minutes
        defaultPrice: process.env.DEFAULT_DEAL_PRICE || '0',
        minDuration: parseInt(process.env.MIN_DEAL_DURATION || '10080', 10), // Minimum 1 week
        maxRetries: parseInt(process.env.DEAL_MAX_RETRIES || '3', 10),
        retryDelay: parseInt(process.env.DEAL_RETRY_DELAY || '5000', 10), // 5 seconds
      };
    }
  
    /**
     * Get verification configuration
     * @returns {Object} - Verification configuration
     */
    static getVerificationConfig() {
      return {
        enabled: process.env.VERIFICATION_ENABLED === 'true',
        verifiers: process.env.VERIFICATION_VERIFIERS ? 
                  process.env.VERIFICATION_VERIFIERS.split(',') : 
                  [],
        minVerifications: parseInt(process.env.MIN_VERIFICATIONS || '1', 10),
      };
    }
  }
  
  module.exports = ConfigUtils;