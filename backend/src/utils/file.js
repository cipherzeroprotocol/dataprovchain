/**
 * File handling utilities
 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');
const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const appConfig = require('../config/app');
const logger = require('./logger');

// Promisify fs functions
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const pipelineAsync = util.promisify(pipeline);

/**
 * Ensure a directory exists
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<void>}
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await stat(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
};

/**
 * Generate a unique filename
 * @param {string} originalName - Original file name
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const basename = path.basename(originalName, extension);
  
  return `${basename}-${timestamp}-${randomString}${extension}`;
};

/**
 * Save a file to disk
 * @param {Buffer|string} fileData - File data or path to the file
 * @param {string} destPath - Destination path
 * @returns {Promise<string>} - Path to the saved file
 */
const saveFile = async (fileData, destPath) => {
  await ensureDirectoryExists(path.dirname(destPath));
  
  if (typeof fileData === 'string' && fs.existsSync(fileData)) {
    // Copy file if fileData is a path
    const readStream = fs.createReadStream(fileData);
    const writeStream = fs.createWriteStream(destPath);
    await pipelineAsync(readStream, writeStream);
  } else {
    // Write buffer or string directly
    await writeFile(destPath, fileData);
  }
  
  return destPath;
};

/**
 * Save and compress a file
 * @param {Buffer|string} fileData - File data or path to the file
 * @param {string} destPath - Destination path
 * @returns {Promise<string>} - Path to the compressed file
 */
const saveAndCompressFile = async (fileData, destPath) => {
  await ensureDirectoryExists(path.dirname(destPath));
  const compressedPath = `${destPath}.gz`;
  
  if (typeof fileData === 'string' && fs.existsSync(fileData)) {
    // Compress file if fileData is a path
    const readStream = fs.createReadStream(fileData);
    const writeStream = fs.createWriteStream(compressedPath);
    await pipelineAsync(readStream, createGzip(), writeStream);
  } else {
    // Write and compress buffer or string directly
    const writeStream = fs.createWriteStream(compressedPath);
    const gzip = createGzip();
    gzip.end(fileData);
    await pipelineAsync(gzip, writeStream);
  }
  
  return compressedPath;
};

/**
 * Get file size
 * @param {string} filePath - Path to the file
 * @returns {Promise<number>} - File size in bytes
 */
const getFileSize = async (filePath) => {
  const stats = await stat(filePath);
  return stats.size;
};

/**
 * Calculate file hash (SHA-256)
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - File hash
 */
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

/**
 * Get a temporary file path
 * @param {string} [prefix='tmp'] - File prefix
 * @param {string} [extension=''] - File extension
 * @returns {Promise<string>} - Temporary file path
 */
const getTempFilePath = async (prefix = 'tmp', extension = '') => {
  const tempDir = appConfig.tempDir;
  await ensureDirectoryExists(tempDir);
  
  const filename = `${prefix}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
  return path.join(tempDir, filename);
};

/**
 * Clean up temporary files older than a certain age
 * @param {number} [maxAgeMs=86400000] - Maximum age in milliseconds (default: 1 day)
 * @returns {Promise<number>} - Number of files deleted
 */
const cleanupTempFiles = async (maxAgeMs = 86400000) => {
  const tempDir = appConfig.tempDir;
  try {
    const files = await util.promisify(fs.readdir)(tempDir);
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      try {
        const filePath = path.join(tempDir, file);
        const stats = await stat(filePath);
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAgeMs) {
          await util.promisify(fs.unlink)(filePath);
          deletedCount++;
        }
      } catch (error) {
        logger.error(`Error processing temp file: ${file}`, { error: error.message });
      }
    }
    
    return deletedCount;
  } catch (error) {
    logger.error('Error cleaning up temp files', { error: error.message });
    return 0;
  }
};

module.exports = {
  ensureDirectoryExists,
  generateUniqueFilename,
  saveFile,
  saveAndCompressFile,
  getFileSize,
  calculateFileHash,
  getTempFilePath,
  cleanupTempFiles,
  readFile
};