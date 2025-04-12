/**
 * Validate email format
 * @param {string} email Email address to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate password strength
 * @param {string} password Password to validate
 * @param {object} options Options for validation
 * @returns {object} Validation results with reason
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true
  } = options;

  if (!password || password.length < minLength) {
    return { 
      valid: false, 
      reason: `Password must be at least ${minLength} characters long` 
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      reason: 'Password must contain at least one uppercase letter' 
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { 
      valid: false, 
      reason: 'Password must contain at least one lowercase letter' 
    };
  }

  if (requireNumbers && !/\d/.test(password)) {
    return { 
      valid: false, 
      reason: 'Password must contain at least one number' 
    };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { 
      valid: false, 
      reason: 'Password must contain at least one special character' 
    };
  }

  return { valid: true };
};

/**
 * Validate URL format
 * @param {string} url URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate CID (Content Identifier) format for IPFS
 * @param {string} cid CID to validate
 * @returns {boolean} Whether the CID is valid
 */
export const isValidCID = (cid) => {
  // Basic validation for CIDv0 and CIDv1
  const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidv1Regex = /^b[a-z2-7]{58}$/i;
  
  return cidv0Regex.test(cid) || cidv1Regex.test(cid);
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array or object)
 * @param {any} value Value to check
 * @returns {boolean} Whether the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Validate a file based on constraints
 * @param {File} file File to validate
 * @param {object} constraints Constraints for validation
 * @returns {object} Validation results with reason
 */
export const validateFile = (file, constraints = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = [],
  } = constraints;

  if (!file) {
    return { valid: false, reason: 'No file provided' };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      reason: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  // Check file type if specified
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      reason: `File type ${file.type} is not allowed. Accepted types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};