/**
 * IPFS configuration
 */
const config = {
    // IPFS gateway for retrieving content
    gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs',
    
    // IPFS node API
    apiUrl: process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001',
    
    // IPFS HTTP client authentication
    projectId: process.env.IPFS_PROJECT_ID,
    projectSecret: process.env.IPFS_PROJECT_SECRET,
    
    // Pinning services
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
    
    // Default timeout for IPFS operations (30 seconds)
    timeout: parseInt(process.env.IPFS_TIMEOUT || '30000', 10)
  };
  
  module.exports = config;