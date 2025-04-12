// filecoin/src/car/generator.js

const { packToBlob } = require('ipfs-car/pack/blob');
const { unpackStream } = require('ipfs-car/unpack');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const CidUtils = require('../utils/cid');

/**
 * Utility for generating Content Addressable aRchives (CAR) files
 */
class CarGenerator {
  /**
   * Generate a CAR file from a file or directory
   * @param {string} inputPath - Path to the file or directory
   * @param {string} outputPath - Path where the CAR file will be saved
   * @returns {Promise<{rootCid: string, carSize: number}>} - Root CID and CAR file size
   */
  static async generateCarFile(inputPath, outputPath) {
    try {
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input path does not exist: ${inputPath}`);
      }
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      let input;
      const stat = fs.statSync(inputPath);
      
      if (stat.isDirectory()) {
        // Directory input
        const files = [];
        const collectFiles = (dir) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              collectFiles(fullPath);
            } else {
              const fileContent = fs.readFileSync(fullPath);
              const relativePath = path.relative(inputPath, fullPath);
              files.push({ path: relativePath, content: fileContent });
            }
          }
        };
        
        collectFiles(inputPath);
        input = files;
      } else {
        // Single file input
        const fileName = path.basename(inputPath);
        const fileContent = fs.readFileSync(inputPath);
        input = [{ path: fileName, content: fileContent }];
      }
      
      // Pack the input into a CAR blob
      const { car, root } = await packToBlob({ input });
      
      // Convert car blob to buffer
      const chunks = [];
      const reader = car.stream().getReader();
      
      let chunk;
      while (!(chunk = await reader.read()).done) {
        chunks.push(chunk.value);
      }
      
      const carBuffer = Buffer.concat(chunks);
      
      // Write CAR file
      fs.writeFileSync(outputPath, carBuffer);
      
      // Get file size
      const carSize = fs.statSync(outputPath).size;
      
      return {
        rootCid: root.toString(),
        carSize
      };
    } catch (error) {
      throw new Error(`Failed to generate CAR file: ${error.message}`);
    }
  }

  /**
   * Generate a CAR file from a buffer or string
   * @param {Buffer|string} data - Data to pack
   * @param {string} fileName - Name to give the file
   * @param {string} outputPath - Path where the CAR file will be saved
   * @returns {Promise<{rootCid: string, carSize: number}>} - Root CID and CAR file size
   */
  static async generateCarFileFromData(data, fileName, outputPath) {
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Prepare input
      const input = [{ path: fileName, content: Buffer.from(data) }];
      
      // Pack the input into a CAR blob
      const { car, root } = await packToBlob({ input });
      
      // Convert car blob to buffer
      const chunks = [];
      const reader = car.stream().getReader();
      
      let chunk;
      while (!(chunk = await reader.read()).done) {
        chunks.push(chunk.value);
      }
      
      const carBuffer = Buffer.concat(chunks);
      
      // Write CAR file
      fs.writeFileSync(outputPath, carBuffer);
      
      // Get file size
      const carSize = fs.statSync(outputPath).size;
      
      return {
        rootCid: root.toString(),
        carSize
      };
    } catch (error) {
      throw new Error(`Failed to generate CAR file from data: ${error.message}`);
    }
  }

  /**
   * Get information about a CAR file
   * @param {string} carFilePath - Path to the CAR file
   * @returns {Promise<{rootCid: string, carSize: number}>} - CAR file info
   */
  static async getCarInfo(carFilePath) {
    try {
      if (!fs.existsSync(carFilePath)) {
        throw new Error(`CAR file does not exist: ${carFilePath}`);
      }
      
      // Read CAR file
      const carBuffer = fs.readFileSync(carFilePath);
      
      // Create readable stream from buffer
      const carStream = Readable.from(carBuffer);
      
      // Unpack the stream to get the root CID
      const { root } = await unpackStream(carStream);
      
      // Get file size
      const carSize = fs.statSync(carFilePath).size;
      
      return {
        rootCid: root.toString(),
        carSize
      };
    } catch (error) {
      throw new Error(`Failed to get CAR info: ${error.message}`);
    }
  }
}

module.exports = CarGenerator;