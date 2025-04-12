/**
 * Validation utilities
 */
const { CID } = require('multiformats/cid');
const web3Utils = require('./web3');

/**
 * Check if a string is a valid JSON string
 * @param {string} str - The string to check
 * @returns {boolean} - Whether the string is valid JSON
 */
const isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a string is a valid IPFS CID
 * @param {string} cid - The CID to check
 * @returns {boolean} - Whether the CID is valid
 */
const isValidCid = (cid) => {
  try {
    CID.parse(cid);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a value is a valid URL
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL is valid
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a string is a valid email address
 * @param {string} email - The email address to check
 * @returns {boolean} - Whether the email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a value is a valid Ethereum address
 * @param {string} address - The address to check
 * @returns {boolean} - Whether the address is valid
 */
const isValidEthAddress = (address) => {
  return web3Utils.isValidAddress(address);
};

/**
 * Check if a value is a valid Ethereum transaction hash
 * @param {string} hash - The hash to check
 * @returns {boolean} - Whether the hash is valid
 */
const isValidTxHash = (hash) => {
  return /^0x([A-Fa-f0-9]{64})$/.test(hash);
};

/**
 * Check if a value is a valid Filecoin address
 * @param {string} address - The address to check
 * @returns {boolean} - Whether the address is valid
 */
const isValidFilecoinAddress = (address) => {
  // Simple Filecoin address validation: starts with 'f' followed by digits or
  // starts with 't' followed by digits (for testnet)
  return /^[ft][0-9]+$/.test(address);
};

/**
 * Validate required fields in an object
 * @param {Object} obj - The object to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {Array<string>} - List of missing field names
 */
const validateRequiredFields = (obj, requiredFields) => {
  return requiredFields.filter(field => {
    return obj[field] === undefined || obj[field] === null || obj[field] === '';
  });
};

/**
 * Sanitize an object by removing specified fields
 * @param {Object} obj - The object to sanitize
 * @param {Array<string>} fieldsToRemove - List of field names to remove
 * @returns {Object} - The sanitized object
 */
const sanitizeObject = (obj, fieldsToRemove) => {
  const sanitized = { ...obj };
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  return sanitized;
};

module.exports = {
  isValidJson,
  isValidCid,
  isValidUrl,
  isValidEmail,
  isValidEthAddress,
  isValidTxHash,
  isValidFilecoinAddress,
  validateRequiredFields,
  sanitizeObject
};