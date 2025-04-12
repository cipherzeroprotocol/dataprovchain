// scripts/utils/verification_utils.js

/**
 * Verifies the integrity of a file using its hash
 * @param {Buffer|String} data - File data
 * @param {String} expectedHash - Expected hash
 * @returns {Boolean} - Whether the hash matches
 */
function verifyFileIntegrity(data, expectedHash) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash === expectedHash;
  }
  
  /**
   * Checks if a dataset meets verification requirements
   * @param {Object} dataset - Dataset metadata
   * @returns {Object} - Verification result with status and reason
   */
  function checkDatasetVerification(dataset) {
    const result = {
      isValid: true,
      reason: ''
    };
    
    // Check if dataset has a name
    if (!dataset.name || dataset.name.trim() === '') {
      result.isValid = false;
      result.reason += 'Dataset name is missing. ';
    }
    
    // Check if dataset has a valid CID
    if (!dataset.cid || !/^[a-z0-9]{46,59}$/i.test(dataset.cid)) {
      result.isValid = false;
      result.reason += 'Dataset CID is invalid. ';
    }
    
    // Check if dataset has a valid data type
    if (!dataset.dataType || dataset.dataType.trim() === '') {
      result.isValid = false;
      result.reason += 'Dataset data type is missing. ';
    }
    
    // Check if dataset has at least one contributor
    if (!dataset.contributors || dataset.contributors.length === 0) {
      result.isValid = false;
      result.reason += 'Dataset must have at least one contributor. ';
    } else {
      // Check if total contributor shares add up to 100%
      const totalShares = dataset.contributors.reduce((sum, contributor) => sum + contributor.share, 0);
      if (totalShares !== 100) {
        result.isValid = false;
        result.reason += `Total contributor shares must be 100% (currently ${totalShares}%). `;
      }
    }
    
    return result;
  }
  
  module.exports = {
    verifyFileIntegrity,
    checkDatasetVerification
  };