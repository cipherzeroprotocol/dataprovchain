import axios from 'axios';
import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';
import { IPFS_CONFIG } from '../constants/ipfs';

// Create IPFS client with the configured endpoint
const ipfs = create({
  host: IPFS_CONFIG.host,
  port: IPFS_CONFIG.port,
  protocol: IPFS_CONFIG.protocol
});

/**
 * Upload a file to IPFS
 * @param {File} file - File to upload
 * @param {Function} [onProgress] - Optional progress callback
 * @returns {Promise<string>} IPFS content identifier (CID)
 */
export const uploadFile = async (file, onProgress = null) => {
  try {
    const fileData = await file.arrayBuffer();
    const buffer = Buffer.from(fileData);
    
    // If progress callback is provided, create a wrapper for progress tracking
    if (onProgress) {
      let loaded = 0;
      const fileSize = file.size;
      const onChunkCallback = (chunk) => {
        loaded += chunk.length;
        const progress = Math.round((loaded / fileSize) * 100);
        onProgress(progress);
      };
      
      const result = await ipfs.add(
        { path: file.name, content: buffer },
        { progress: onChunkCallback }
      );
      
      return result.cid.toString();
    } else {
      const result = await ipfs.add({ path: file.name, content: buffer });
      return result.cid.toString();
    }
  } catch (error) {
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};

/**
 * Upload multiple files to IPFS
 * @param {Array<File>} files - Array of files to upload
 * @param {Function} [onProgress] - Optional progress callback with file index and progress percentage
 * @returns {Promise<Array<{name: string, cid: string}>>} Array of uploaded file information
 */
export const uploadFiles = async (files, onProgress = null) => {
  try {
    const results = [];
    let totalProgress = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Create progress callback for this file
      const fileProgressCallback = onProgress ? (progress) => {
        onProgress(i, progress);
      } : null;
      
      const cid = await uploadFile(file, fileProgressCallback);
      results.push({
        name: file.name,
        cid: cid
      });
      
      // Update total progress
      totalProgress = Math.round(((i + 1) / files.length) * 100);
      if (onProgress) onProgress('total', totalProgress);
    }
    
    return results;
  } catch (error) {
    throw new Error(`Failed to upload files to IPFS: ${error.message}`);
  }
};

/**
 * Upload JSON metadata to IPFS
 * @param {Object} metadata - Metadata object to upload
 * @returns {Promise<string>} IPFS content identifier (CID)
 */
export const uploadMetadata = async (metadata) => {
  try {
    const metadataString = JSON.stringify(metadata);
    const buffer = Buffer.from(metadataString);
    
    const result = await ipfs.add(buffer);
    return result.cid.toString();
  } catch (error) {
    throw new Error(`Failed to upload metadata to IPFS: ${error.message}`);
  }
};

/**
 * Create a directory with multiple files on IPFS
 * @param {string} directoryName - Name of the directory
 * @param {Array<{name: string, content: Buffer}>} files - Array of files to add to the directory
 * @returns {Promise<string>} IPFS content identifier (CID) of the directory
 */
export const createDirectory = async (directoryName, files) => {
  try {
    const fileObjects = files.map(file => ({
      path: `${directoryName}/${file.name}`,
      content: file.content
    }));
    
    // Add the directory to IPFS
    const results = await ipfs.add(fileObjects);
    
    // Find the directory CID (the last item in results)
    let dirCid = null;
    for await (const result of results) {
      if (result.path === directoryName) {
        dirCid = result.cid.toString();
      }
    }
    
    if (!dirCid) {
      throw new Error('Failed to get directory CID');
    }
    
    return dirCid;
  } catch (error) {
    throw new Error(`Failed to create directory on IPFS: ${error.message}`);
  }
};

/**
 * Get a file from IPFS
 * @param {string} cid - IPFS content identifier
 * @returns {Promise<Blob>} File blob
 */
export const getFile = async (cid) => {
  try {
    // First try to get from local IPFS node
    try {
      const chunks = [];
      for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      return new Blob(chunks);
    } catch (localError) {
      // If local node fails, try public gateway
      const response = await axios.get(`${IPFS_CONFIG.gateway}/ipfs/${cid}`, {
        responseType: 'blob'
      });
      return response.data;
    }
  } catch (error) {
    throw new Error(`Failed to get file from IPFS: ${error.message}`);
  }
};

/**
 * Get JSON metadata from IPFS
 * @param {string} cid - IPFS content identifier
 * @returns {Promise<Object>} JSON metadata
 */
export const getMetadata = async (cid) => {
  try {
    // First try to get from local IPFS node
    try {
      let data = '';
      for await (const chunk of ipfs.cat(cid)) {
        data += Buffer.from(chunk).toString();
      }
      return JSON.parse(data);
    } catch (localError) {
      // If local node fails, try public gateway
      const response = await axios.get(`${IPFS_CONFIG.gateway}/ipfs/${cid}`);
      return response.data;
    }
  } catch (error) {
    throw new Error(`Failed to get metadata from IPFS: ${error.message}`);
  }
};

/**
 * Pin content to IPFS to ensure persistence
 * @param {string} cid - IPFS content identifier
 * @returns {Promise<boolean>} Success status
 */
export const pinContent = async (cid) => {
  try {
    await ipfs.pin.add(cid);
    return true;
  } catch (error) {
    throw new Error(`Failed to pin content to IPFS: ${error.message}`);
  }
};

/**
 * Generate IPFS URL for a CID
 * @param {string} cid - IPFS content identifier
 * @param {boolean} [useGateway=true] - Whether to use public gateway
 * @returns {string} IPFS URL
 */
export const generateIpfsUrl = (cid, useGateway = true) => {
  if (useGateway) {
    return `${IPFS_CONFIG.gateway}/ipfs/${cid}`;
  } else {
    return `ipfs://${cid}`;
  }
};