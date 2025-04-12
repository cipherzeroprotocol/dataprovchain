/**
 * Validation middleware
 */
const { body, param, query, validationResult } = require('express-validator');
const validationUtils = require('../utils/validation');
const web3Utils = require('../utils/web3');

/**
 * Generic validation result checker middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User registration validation rules
 */
const userRegistrationRules = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Must be a valid email address'),
  
  body('walletAddress')
    .notEmpty().withMessage('Wallet address is required')
    .custom(value => {
      if (!web3Utils.isValidAddress(value)) {
        throw new Error('Invalid wallet address');
      }
      return true;
    })
];

/**
 * Wallet authentication validation rules
 */
const walletAuthRules = [
  body('address')
    .notEmpty().withMessage('Wallet address is required')
    .custom(value => {
      if (!web3Utils.isValidAddress(value)) {
        throw new Error('Invalid wallet address');
      }
      return true;
    }),
  
  body('signature')
    .notEmpty().withMessage('Signature is required')
];

/**
 * Dataset creation validation rules
 */
const datasetCreationRules = [
  body('name')
    .notEmpty().withMessage('Dataset name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  
  body('dataType')
    .notEmpty().withMessage('Data type is required')
    .isIn(['text', 'image', 'audio', 'video', 'tabular', 'other']).withMessage('Invalid data type'),
  
  body('license')
    .notEmpty().withMessage('License is required'),
  
  body('contributors')
    .isArray().withMessage('Contributors must be an array')
    .custom(value => {
      if (value.length === 0) {
        throw new Error('At least one contributor is required');
      }
      
      // Check each contributor
      for (const contributor of value) {
        if (!contributor.id) {
          throw new Error('Each contributor must have an id');
        }
        
        if (!web3Utils.isValidAddress(contributor.id)) {
          throw new Error(`Invalid contributor address: ${contributor.id}`);
        }
        
        if (contributor.share === undefined || contributor.share === null) {
          throw new Error('Each contributor must have a share percentage');
        }
        
        if (typeof contributor.share !== 'number' || 
            contributor.share <= 0 || 
            contributor.share > 100) {
          throw new Error('Share percentage must be a number between 0 and 100');
        }
      }
      
      // Check if shares add up to 100
      const totalShare = value.reduce((sum, contributor) => sum + contributor.share, 0);
      if (totalShare !== 100) {
        throw new Error('Contributor shares must add up to 100%');
      }
      
      return true;
    }),
  
  body('tags')
    .isArray().withMessage('Tags must be an array')
    .custom(value => {
      if (value.length > 20) {
        throw new Error('Maximum 20 tags allowed');
      }
      
      for (const tag of value) {
        if (typeof tag !== 'string') {
          throw new Error('Tags must be strings');
        }
        
        if (tag.length > 30) {
          throw new Error('Tags must be less than 30 characters');
        }
      }
      
      return true;
    })
];

/**
 * Market listing validation rules
 */
const listingCreationRules = [
  body('datasetId')
    .notEmpty().withMessage('Dataset ID is required'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .custom(value => {
      try {
        const price = BigInt(value);
        if (price <= 0) {
          throw new Error('Price must be greater than 0');
        }
        return true;
      } catch (error) {
        throw new Error('Invalid price format');
      }
    }),
  
  body('licenseType')
    .notEmpty().withMessage('License type is required')
    .isIn(['research', 'commercial', 'educational', 'personal']).withMessage('Invalid license type'),
  
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 86400 }).withMessage('Duration must be at least 1 day (86400 seconds)')
];

/**
 * Usage recording validation rules
 */
const usageRecordingRules = [
  body('datasetId')
    .notEmpty().withMessage('Dataset ID is required'),
  
  body('modelId')
    .notEmpty().withMessage('Model ID is required'),
  
  body('usageType')
    .notEmpty().withMessage('Usage type is required')
    .isIn(['training', 'validation', 'testing', 'inference']).withMessage('Invalid usage type'),
  
  body('usedBy')
    .notEmpty().withMessage('Used by address is required')
    .custom(value => {
      if (!web3Utils.isValidAddress(value)) {
        throw new Error('Invalid wallet address');
      }
      return true;
    }),
  
  body('impactScore')
    .notEmpty().withMessage('Impact score is required')
    .isInt({ min: 1, max: 100 }).withMessage('Impact score must be between 1 and 100'),
  
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
];

/**
 * Provenance record validation rules
 */
const provenanceRecordRules = [
  body('datasetId')
    .notEmpty().withMessage('Dataset ID is required'),
  
  body('actionType')
    .notEmpty().withMessage('Action type is required')
    .isIn(['creation', 'modification', 'derivation', 'usage', 'verification', 'transfer']).withMessage('Invalid action type'),
  
  body('performedBy')
    .notEmpty().withMessage('Performed by address is required')
    .custom(value => {
      if (!web3Utils.isValidAddress(value)) {
        throw new Error('Invalid wallet address');
      }
      return true;
    }),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
];

/**
 * ID parameter validation
 */
const validateUUID = [
  param('id')
    .isUUID().withMessage('Invalid ID format')
];

/**
 * Dataset ID parameter validation
 */
const validateDatasetId = [
  param('datasetId')
    .isUUID().withMessage('Invalid dataset ID format')
];

/**
 * Pagination validation rules
 */
const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

/**
 * CID validation
 */
const validateCID = (value) => {
  if (!validationUtils.isValidCid(value)) {
    throw new Error('Invalid CID format');
  }
  return true;
};

module.exports = {
  validateRequest,
  userRegistrationRules,
  walletAuthRules,
  datasetCreationRules,
  listingCreationRules,
  usageRecordingRules,
  provenanceRecordRules,
  validateUUID,
  validateDatasetId,
  paginationRules,
  validateCID
};