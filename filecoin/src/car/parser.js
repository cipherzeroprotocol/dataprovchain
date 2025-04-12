// filecoin/src/car/parser.js

const { CarReader } = require('@ipld/car');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const CidUtils = require('../utils/cid');

/**
 * Utility for parsing Content Addressable aRchive (CAR) files
 */
class CarParser {
  /**
   * Extract files from a CAR file
   * @param {string} carFilePath - Path to the CAR file
   * @param {string} outputDir - Directory to extract files to
   * @returns {Promise<Array<{path: string, cid: string, size: number}>>} - Extracted file info
   */
  static async extractFiles(carFilePath, outputDir) {
    try {
      if (!fs.existsSync(carFilePath)) {
        throw new Error(`CAR file does not exist: ${carFilePath}`);
      }
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Read CAR file
      const carBuffer = fs.readFileSync(carFilePath);
      
      // Create CAR reader
      const reader = await CarReader.fromBytes(carBuffer);
      
      // Get root CID
      const [rootCid] = await reader.getRoots();
      
      // Process blocks and extract files
      const results = [];
      for await (const block of reader.blocks()) {
        // Convert CID to string
        const cid = block.cid.toString();
        
        // Skip non-file blocks
        if (block.cid.equals(rootCid)) continue;
        
        // Create file path
        const filePath = path.join(outputDir, cid);
        
        // Write block data to file
        fs.writeFileSync(filePath, block.bytes);
        
        // Record file info
        results.push({
          path: filePath,
          cid,
          size: block.bytes.length
        });
      }
      
      return results;
    } catch (error) {
      throw new Error(`Failed to extract files from CAR: ${error.message}`);
    }
  }

  /**
   * Get the root CID of a CAR file
   * @param {string} carFilePath - Path to the CAR file
   * @returns {Promise<string>} - Root CID
   */
  static async getRootCid(carFilePath) {
    try {
      if (!fs.existsSync(carFilePath)) {
        throw new Error(`CAR file does not exist: ${carFilePath}`);
      }
      
      // Read CAR file
      const carBuffer = fs.readFileSync(carFilePath);
      
      // Create CAR reader
      const reader = await CarReader.fromBytes(carBuffer);
      
      // Get root CID
      const [rootCid] = await reader.getRoots();
      
      return rootCid.toString();
    } catch (error) {
      throw new Error(`Failed to get root CID: ${error.message}`);
    }
  }

  /**
   * List all blocks in a CAR file
   * @param {string} carFilePath - Path to the CAR file
   * @returns {Promise<Array<{cid: string, size: number}>>} - Block info
   */
  static async listBlocks(carFilePath) {
    try {
      if (!fs.existsSync(carFilePath)) {
        throw new Error(`CAR file does not exist: ${carFilePath}`);
      }
      
      // Read CAR file
      const carBuffer = fs.readFileSync(carFilePath);
      
      // Create CAR reader
      const reader = await CarReader.fromBytes(carBuffer);
      
      // Process blocks
      const blocks = [];
      for await (const block of reader.blocks()) {
        blocks.push({
          cid: block.cid.toString(),
          size: block.bytes.length
        });
      }
      
      return blocks;
    } catch (error) {
      throw new Error(`Failed to list blocks: ${error.message}`);
    }
  }

  /**
   * Verify the integrity of a CAR file
   * @param {string} carFilePath - Path to the CAR file
   * @returns {Promise<boolean>} - True if valid, false otherwise
   */
  static async verifyIntegrity(carFilePath) {
    try {
      if (!fs.existsSync(carFilePath)) {
        throw new Error(`CAR file does not exist: ${carFilePath}`);
      }
      
      // Read CAR file
      const carBuffer = fs.readFileSync(carFilePath);
      
      // Create CAR reader
      const reader = await CarReader.fromBytes(carBuffer);
      
      // Check if we can get roots and iterate blocks
      const roots = await reader.getRoots();
      if (roots.length === 0) {
        return false;
      }
      
      // Count blocks
      let blockCount = 0;
      for await (const block of reader.blocks()) {
        blockCount++;
      }
      
      return blockCount > 0;
    } catch (error) {
      console.error(`CAR verification error: ${error.message}`);
      return false;
    }
  }
}

module.exports = CarParser;