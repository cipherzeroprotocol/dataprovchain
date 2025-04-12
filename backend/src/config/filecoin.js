/**
 * Filecoin configuration
 */
const config = {
    network: process.env.FILECOIN_NETWORK || 'calibrationnet',
    rpcUrl: process.env.FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1',
    privateKey: process.env.FILECOIN_PRIVATE_KEY,
    dealDuration: parseInt(process.env.FILECOIN_DEAL_DURATION || '518400', 10), // ~180 days in epochs
    replicationFactor: parseInt(process.env.FILECOIN_REPLICATION_FACTOR || '3', 10),
    verifiedDeals: process.env.FILECOIN_VERIFIED_DEALS === 'true',
    
    // Web3.Storage for simplified Filecoin/IPFS storage
    web3StorageToken: process.env.WEB3_STORAGE_TOKEN,
    
    // Lotus API for direct interactions
    lotusApiUrl: process.env.LOTUS_API_URL || 'https://api.calibration.node.glif.io',
    lotusAuthToken: process.env.LOTUS_AUTH_TOKEN,
    
    // Deal monitoring intervals
    dealCheckIntervalMinutes: parseInt(process.env.FILECOIN_DEAL_CHECK_INTERVAL || '30', 10),
    
    // Maximum file size for direct uploads (20MB)
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10)
  };
  
  module.exports = config;