import { create } from 'ipfs-http-client';

// Default IPFS gateway for retrieving content
const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

/**
 * Create an IPFS client instance
 * @param {object} options Configuration options
 * @returns {object} IPFS client instance
 */
export const createIPFSClient = (options = {}) => {
  const {
    host = 'ipfs.infura.io',
    port = 5001,
    protocol = 'https',
    apiPath = '/api/v0',
    authorization = null
  } = options;

  const clientOptions = {
    host,
    port,
    protocol,
    apiPath
  };

  // Add authorization if provided
  if (authorization) {
    clientOptions.headers = {
      authorization
    };
  }

  try {
    return create(clientOptions);
  } catch (error) {
    console.error('Error creating IPFS client:', error);
    throw new Error('Failed to create IPFS client');
  }
};

/**
 * Upload content to IPFS
 * @param {object} ipfsClient IPFS client instance
 * @param {File|Blob|string|Buffer} content Content to upload
 * @param {object} options Upload options
 * @returns {Promise<string>} Content identifier (CID)
 */
export const uploadToIPFS = async (ipfsClient, content, options = {}) => {
  try {
    const result = await ipfsClient.add(content, options);
    return result.path; // CID of the uploaded content
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload content to IPFS');
  }
};

/**
 * Upload multiple files to IPFS as a directory
 * @param {object} ipfsClient IPFS client instance
 * @param {Array<{path: string, content: File|Blob|string|Buffer}>} files Files to upload
 * @param {object} options Upload options
 * @returns {Promise<string>} Directory CID
 */
export const uploadDirectoryToIPFS = async (ipfsClient, files, options = {}) => {
  try {
    // Prepare files with path information
    const fileObjects = files.map(file => ({
      path: file.path,
      content: file.content
    }));

    // Add all files as a directory
    const results = await ipfsClient.addAll(fileObjects, options);
    
    // The last result is the directory CID
    let dirCID = null;
    for (const result of results) {
      dirCID = result.cid.toString();
    }
    
    return dirCID;
  } catch (error) {
    console.error('Error uploading directory to IPFS:', error);
    throw new Error('Failed to upload directory to IPFS');
  }
};

/**
 * Get IPFS gateway URL for a CID
 * @param {string} cid Content identifier
 * @param {string} gateway IPFS gateway URL
 * @returns {string} Full gateway URL for the content
 */
export const getIPFSGatewayURL = (cid, gateway = DEFAULT_IPFS_GATEWAY) => {
  if (!cid) return '';
  
  // Remove trailing slash from gateway if present
  const baseGateway = gateway.endsWith('/') ? gateway.slice(0, -1) : gateway;
  
  // Remove ipfs:// prefix if present
  const normalizedCID = cid.startsWith('ipfs://') ? cid.substring(7) : cid;
  
  return `${baseGateway}/${normalizedCID}`;
};

/**
 * Normalize an IPFS CID or URL to a standard format
 * @param {string} cidOrUrl IPFS CID or URL
 * @returns {string} Normalized CID in ipfs:// format
 */
export const normalizeIPFSUrl = (cidOrUrl) => {
  if (!cidOrUrl) return '';
  
  // Already in ipfs:// format
  if (cidOrUrl.startsWith('ipfs://')) {
    return cidOrUrl;
  }
  
  // Extract CID from gateway URL
  if (cidOrUrl.includes('/ipfs/')) {
    const parts = cidOrUrl.split('/ipfs/');
    return `ipfs://${parts[1]}`;
  }
  
  // Assume it's a raw CID
  return `ipfs://${cidOrUrl}`;
};

/**
 * Pin content to an IPFS node to ensure persistence
 * @param {object} ipfsClient IPFS client instance
 * @param {string} cid Content identifier to pin
 * @returns {Promise<boolean>} Success status
 */
export const pinToIPFS = async (ipfsClient, cid) => {
  try {
    await ipfsClient.pin.add(cid);
    return true;
  } catch (error) {
    console.error('Error pinning content to IPFS:', error);
    return false;
  }
};

/**
 * Fetch JSON metadata from IPFS
 * @param {string} cid Content identifier
 * @param {string} gateway IPFS gateway URL
 * @returns {Promise<object>} Fetched JSON data
 */
export const fetchJSONFromIPFS = async (cid, gateway = DEFAULT_IPFS_GATEWAY) => {
  try {
    const url = getIPFSGatewayURL(cid, gateway);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON from IPFS:', error);
    throw new Error('Failed to fetch JSON from IPFS');
  }
};