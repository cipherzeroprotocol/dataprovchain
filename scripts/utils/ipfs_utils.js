// scripts/utils/ipfs_utils.js

const { create } = require('ipfs-http-client');
const { Web3Storage } = require('web3.storage');

/**
 * Creates an IPFS client
 * @returns {Object} - IPFS client
 */
function createIpfsClient() {
  // Try to use the IPFS API endpoint from environment variables, or use default
  const ipfsApiEndpoint = process.env.IPFS_API_ENDPOINT || 'http://localhost:5001';
  
  try {
    return create({ url: ipfsApiEndpoint });
  } catch (error) {
    console.error('Failed to create IPFS client:', error);
    return null;
  }
}

/**
 * Creates a Web3.Storage client
 * @returns {Object} - Web3.Storage client
 */
function createWeb3StorageClient() {
  // API token for Web3.Storage
  const token = process.env.WEB3_STORAGE_API_TOKEN;
  
  if (!token) {
    console.warn('WEB3_STORAGE_API_TOKEN not found in environment variables');
    return null;
  }
  
  return new Web3Storage({ token });
}

/**
 * Uploads a file to IPFS
 * @param {Buffer|String} data - File data
 * @param {String} filename - Name of the file
 * @returns {Promise<String>} - IPFS CID
 */
async function uploadToIpfs(data, filename) {
  const ipfs = createIpfsClient();
  if (!ipfs) throw new Error('IPFS client not available');
  
  const result = await ipfs.add({
    path: filename,
    content: data
  });
  
  return result.cid.toString();
}

/**
 * Uploads a file to Web3.Storage
 * @param {Buffer|String} data - File data
 * @param {String} filename - Name of the file
 * @returns {Promise<String>} - CID
 */
async function uploadToWeb3Storage(data, filename) {
  const client = createWeb3StorageClient();
  if (!client) throw new Error('Web3.Storage client not available');
  
  const file = new File([data], filename);
  const cid = await client.put([file]);
  
  return cid;
}

module.exports = {
  createIpfsClient,
  createWeb3StorageClient,
  uploadToIpfs,
  uploadToWeb3Storage
};