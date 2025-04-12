// filecoin/src/utils/cid.js

const { CID } = require('multiformats/cid');
const { base58btc } = require('multiformats/bases/base58');
const { base32 } = require('multiformats/bases/base32');
const uint8arrays = require('uint8arrays');

/**
 * Utility functions for working with Content Identifiers (CIDs)
 */
class CidUtils {
  /**
   * Checks if a string is a valid CID
   * @param {string} cidString - The CID string to check
   * @returns {boolean} - True if valid, false otherwise
   */
  static isValidCid(cidString) {
    try {
      // Try to parse the CID
      CID.parse(cidString);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Converts a CID v0 to CID v1
   * @param {string} cidv0String - CID v0 string
   * @returns {string} - CID v1 string
   */
  static convertCidV0ToV1(cidv0String) {
    try {
      const cidv0 = CID.parse(cidv0String);
      if (cidv0.version === 0) {
        // Convert to v1
        const cidv1 = CID.createV1(cidv0.code, cidv0.multihash);
        return cidv1.toString();
      }
      return cidv0String; // Already v1
    } catch (e) {
      throw new Error(`Invalid CID: ${e.message}`);
    }
  }

  /**
   * Converts a CID v1 to CID v0 if possible
   * @param {string} cidv1String - CID v1 string
   * @returns {string} - CID v0 string
   */
  static convertCidV1ToV0(cidv1String) {
    try {
      const cidv1 = CID.parse(cidv1String);
      if (cidv1.version === 1 && cidv1.code === 0x70) { // 0x70 is dag-pb
        // Convert to v0 (only possible for dag-pb codec)
        const cidv0 = CID.createV0(cidv1.multihash);
        return cidv0.toString();
      }
      throw new Error('Cannot convert to CIDv0: only dag-pb codec can be encoded as CIDv0');
    } catch (e) {
      throw new Error(`CID conversion error: ${e.message}`);
    }
  }

  /**
   * Formats a CID for use with Filecoin
   * @param {string} cidString - CID string
   * @returns {string} - Formatted CID for Filecoin
   */
  static formatCidForFilecoin(cidString) {
    try {
      // Filecoin typically works with CID v1 in base32
      const cid = CID.parse(cidString);
      const cidv1 = cid.version === 0 ? 
                    CID.createV1(cid.code, cid.multihash) : 
                    cid;
      
      return cidv1.toString(base32);
    } catch (e) {
      throw new Error(`CID formatting error: ${e.message}`);
    }
  }

  /**
   * Convert bytes to CID
   * @param {Uint8Array} bytes - Bytes representing a CID
   * @returns {string} - CID string
   */
  static bytesToCid(bytes) {
    try {
      const cid = CID.decode(bytes);
      return cid.toString();
    } catch (e) {
      throw new Error(`Failed to convert bytes to CID: ${e.message}`);
    }
  }

  /**
   * Convert CID to bytes
   * @param {string} cidString - CID string
   * @returns {Uint8Array} - CID bytes
   */
  static cidToBytes(cidString) {
    try {
      const cid = CID.parse(cidString);
      return cid.bytes;
    } catch (e) {
      throw new Error(`Failed to convert CID to bytes: ${e.message}`);
    }
  }
}

module.exports = CidUtils;