const { Web3Storage, File } = require('web3.storage');
const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const config = require('../config');
const logger = require('../utils/logger');

class IpfsService {
  constructor() {
    // Web3.Storage client for Filecoin integration
    this.web3Storage = new Web3Storage({ token: config.web3StorageToken });
    
    // Local IPFS client (if configured)
    if (config.ipfs.localNode) {
      try {
        this.ipfs = create({
          host: config.ipfs.host || 'localhost',
          port: config.ipfs.port || 5001,
          protocol: config.ipfs.protocol || 'http'
        });
      } catch (error) {
        logger.error('Failed to connect to local IPFS node', { error });
      }
    }
  }

  /**
   * Upload a file to IPFS
   * @param {string} filePath - Path to the file to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - IPFS upload result with CID
   */
  async uploadFile(filePath, options = {}) {
    try {
      const file = await this._prepareFile(filePath);
      const cid = await this.web3Storage.put([file], {
        name: options.name || path.basename(filePath),
        wrapWithDirectory: options.wrapWithDirectory !== false
      });
      
      logger.info(`File uploaded to IPFS with CID: ${cid}`);
      
      return {
        cid,
        size: file.size,
        name: file.name,
        url: `https://${cid}.ipfs.dweb.link/${file.name}`
      };
    } catch (error) {
      logger.error('Error uploading file to IPFS', { error, filePath });
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }
  
  /**
   * Upload content directly to IPFS
   * @param {string|Buffer} content - Content to upload
   * @param {string} fileName - Name of the file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - IPFS upload result with CID
   */
  async uploadContent(content, fileName, options = {}) {
    try {
      const buffer = typeof content === 'string' ? Buffer.from(content) : content;
      const file = new File([buffer], fileName);
      
      const cid = await this.web3Storage.put([file], {
        name: fileName,
        wrapWithDirectory: options.wrapWithDirectory !== false
      });
      
      logger.info(`Content uploaded to IPFS with CID: ${cid}`);
      
      return {
        cid,
        size: buffer.length,
        name: fileName,
        url: `https://${cid}.ipfs.dweb.link/${fileName}`
      };
    } catch (error) {
      logger.error('Error uploading content to IPFS', { error });
      throw new Error(`Failed to upload content to IPFS: ${error.message}`);
    }
  }
  
  /**
   * Upload a directory to IPFS
   * @param {string} dirPath - Path to the directory to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - IPFS upload result with CID
   */
  async uploadDirectory(dirPath, options = {}) {
    try {
      const files = await this._prepareDirectory(dirPath);
      const cid = await this.web3Storage.put(files, {
        name: options.name || path.basename(dirPath),
        wrapWithDirectory: true
      });
      
      logger.info(`Directory uploaded to IPFS with CID: ${cid}`);
      
      return {
        cid,
        name: path.basename(dirPath),
        url: `https://${cid}.ipfs.dweb.link/`
      };
    } catch (error) {
      logger.error('Error uploading directory to IPFS', { error, dirPath });
      throw new Error(`Failed to upload directory to IPFS: ${error.message}`);
    }
  }
  
  /**
   * Retrieve a file from IPFS
   * @param {string} cid - Content ID to retrieve
   * @returns {Promise<Object>} - Retrieved content
   */
  async retrieveFile(cid) {
    try {
      const res = await this.web3Storage.get(cid);
      if (!res.ok) {
        throw new Error(`Failed to retrieve file: ${res.statusText}`);
      }
      
      const files = await res.files();
      
      if (files.length === 0) {
        throw new Error('No files found');
      }
      
      return {
        cid,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          url: `https://${cid}.ipfs.dweb.link/${file.name}`,
          cid: file.cid
        }))
      };
    } catch (error) {
      logger.error('Error retrieving file from IPFS', { error, cid });
      throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
    }
  }
  
  /**
   * Get status of a file stored on IPFS
   * @param {string} cid - Content ID to check
   * @returns {Promise<Object>} - Status information
   */
  async getStatus(cid) {
    try {
      const status = await this.web3Storage.status(cid);
      return {
        cid,
        created: status.created,
        dagSize: status.dagSize,
        pins: status.pins,
        deals: status.deals?.map(deal => ({
          dealId: deal.dealId,
          storageProvider: deal.storageProvider,
          status: deal.status,
          pieceCid: deal.pieceCid,
          dataCid: deal.dataCid,
          dataModelSelector: deal.dataModelSelector,
          activation: deal.activation,
          expiration: deal.expiration
        }))
      };
    } catch (error) {
      logger.error('Error getting status from IPFS', { error, cid });
      throw new Error(`Failed to get IPFS file status: ${error.message}`);
    }
  }

  /**
   * Check if a CID exists on IPFS
   * @param {string} cid - Content ID to check
   * @returns {Promise<boolean>} - Whether the CID exists
   */
  async exists(cid) {
    try {
      const status = await this.web3Storage.status(cid);
      return !!status;
    } catch (error) {
      return false;
    }
  }
  
  // Private helper methods
  
  /**
   * Prepare a file for IPFS upload
   * @param {string} filePath - Path to the file
   * @returns {Promise<File>} - Web3.Storage file object
   * @private
   */
  async _prepareFile(filePath) {
    const content = await readFileAsync(filePath);
    const fileName = path.basename(filePath);
    return new File([content], fileName);
  }
  
  /**
   * Prepare a directory for IPFS upload
   * @param {string} dirPath - Path to the directory
   * @returns {Promise<File[]>} - Array of Web3.Storage file objects
   * @private
   */
  async _prepareDirectory(dirPath) {
    const files = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isFile()) {
        const content = await readFileAsync(fullPath);
        const file = new File([content], entry.name);
        files.push(file);
      }
    }
    
    return files;
  }
}

module.exports = new IpfsService();
