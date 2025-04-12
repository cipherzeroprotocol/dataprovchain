// filecoin/src/utils/conversion.js

const { FilecoinNumber } = require('@glif/filecoin-number');
const { fromFil, toFil } = require('@glif/filecoin-number/dist/utils');
const { FilecoinAddress } = require('@glif/filecoin-address');
const uint8arrays = require('uint8arrays');

/**
 * Utilities for data conversion in Filecoin
 */
class ConversionUtils {
  /**
   * Convert Filecoin address to bytes
   * @param {string} address - Filecoin address (f1, f2, f3, etc.)
   * @returns {Uint8Array} - Address bytes
   */
  static addressToBytes(address) {
    try {
      const filecoinAddress = new FilecoinAddress(address);
      return filecoinAddress.bytes();
    } catch (e) {
      throw new Error(`Invalid Filecoin address: ${e.message}`);
    }
  }

  /**
   * Convert bytes to Filecoin address
   * @param {Uint8Array} bytes - Address bytes
   * @returns {string} - Filecoin address
   */
  static bytesToAddress(bytes) {
    try {
      const filecoinAddress = new FilecoinAddress(bytes);
      return filecoinAddress.toString();
    } catch (e) {
      throw new Error(`Invalid address bytes: ${e.message}`);
    }
  }

  /**
   * Convert Ethereum address to Filecoin address
   * @param {string} ethAddress - Ethereum address (0x...)
   * @returns {string} - Filecoin address
   */
  static ethAddressToFilecoinAddress(ethAddress) {
    try {
      if (!ethAddress.startsWith('0x')) {
        throw new Error('Ethereum address must start with 0x');
      }
      
      // Remove 0x prefix and convert to bytes
      const addressHex = ethAddress.slice(2);
      const addressBytes = uint8arrays.fromString(addressHex, 'hex');
      
      // Create f4 address (delegated address type)
      const filecoinAddress = new FilecoinAddress(addressBytes, 'f4');
      return filecoinAddress.toString();
    } catch (e) {
      throw new Error(`Address conversion error: ${e.message}`);
    }
  }

  /**
   * Convert FIL to attoFIL
   * @param {string|number} fil - FIL amount
   * @returns {string} - attoFIL amount (10^-18 FIL)
   */
  static filToAttoFil(fil) {
    try {
      const filecoinNumber = new FilecoinNumber(fil, 'fil');
      return filecoinNumber.toAttoFil();
    } catch (e) {
      throw new Error(`FIL conversion error: ${e.message}`);
    }
  }

  /**
   * Convert attoFIL to FIL
   * @param {string|number} attoFil - attoFIL amount
   * @returns {string} - FIL amount
   */
  static attoFilToFil(attoFil) {
    try {
      const filecoinNumber = new FilecoinNumber(attoFil, 'attofil');
      return filecoinNumber.toFil();
    } catch (e) {
      throw new Error(`attoFIL conversion error: ${e.message}`);
    }
  }

  /**
   * Calculate padded piece size
   * @param {number} size - Original size in bytes
   * @returns {number} - Padded piece size in bytes (power of 2)
   */
  static calculatePaddedPieceSize(size) {
    // Find the next power of 2 that is >= size
    let paddedSize = 1;
    while (paddedSize < size) {
      paddedSize *= 2;
    }
    return paddedSize;
  }

  /**
   * Convert bytes to hex string
   * @param {Uint8Array} bytes - Bytes to convert
   * @returns {string} - Hex string
   */
  static bytesToHex(bytes) {
    return uint8arrays.toString(bytes, 'hex');
  }

  /**
   * Convert hex string to bytes
   * @param {string} hex - Hex string
   * @returns {Uint8Array} - Bytes
   */
  static hexToBytes(hex) {
    // Ensure hex string has 0x prefix
    const hexStr = hex.startsWith('0x') ? hex.slice(2) : hex;
    return uint8arrays.fromString(hexStr, 'hex');
  }
}

module.exports = ConversionUtils;