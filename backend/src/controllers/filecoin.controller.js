/**
 * Filecoin controller
 */
const filecoinService = require('../services/filecoin.service');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const util = require('util');
const unlinkAsync = fs.promises.unlink;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
}).single('file');

// Promisify the multer middleware
const uploadAsync = util.promisify((req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error (e.g., file too large)
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    } else if (err) {
      // Unknown error
      return res.status(500).json({
        status: 'error',
        message: 'File upload failed'
      });
    }
    
    // No error
    next();
  });
});

/**
 * Store data on Filecoin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const storeData = async (req, res) => {
  try {
    // Handle file upload first
    await uploadAsync(req, res);
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    
    const { name, metadata } = req.body;
    
    // Parse metadata if it's a string
    let parsedMetadata;
    try {
      parsedMetadata = typeof metadata === 'string' ? 
        JSON.parse(metadata) : metadata || {};
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid metadata format'
      });
    }
    
    // Store data on Filecoin
    const result = await filecoinService.storeDataset({
      data: req.file.path,
      metadata: parsedMetadata,
      name: name || req.file.originalname
    });
    
    // Clean up the uploaded file
    try {
      await unlinkAsync(req.file.path);
    } catch (unlinkError) {
      logger.warn('Error deleting temporary file', { 
        error: unlinkError.message, 
        path: req.file.path 
      });
    }
    
    return res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Error storing data on Filecoin', { error: error.message });
    
    // Clean up the uploaded file if it exists
    if (req.file) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        logger.warn('Error deleting temporary file', { 
          error: unlinkError.message, 
          path: req.file.path 
        });
      }
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Create a storage deal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStorageDeal = async (req, res) => {
  try {
    const { cid, size, minerId, verifiedDeal } = req.body;
    
    if (!cid || !size) {
      return res.status(400).json({
        status: 'error',
        message: 'CID and size are required'
      });
    }
    
    const dealInfo = await filecoinService.createStorageDeal({
      cid,
      size: parseInt(size),
      minerId,
      verifiedDeal: verifiedDeal === true
    });
    
    return res.status(201).json({
      status: 'success',
      data: dealInfo
    });
  } catch (error) {
    logger.error('Error creating storage deal', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Check deal status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkDealStatus = async (req, res) => {
  try {
    const { dealId } = req.params;
    
    if (!dealId) {
      return res.status(400).json({
        status: 'error',
        message: 'Deal ID is required'
      });
    }
    
    const status = await filecoinService.checkDealStatus(dealId);
    
    return res.status(200).json({
      status: 'success',
      data: status
    });
  } catch (error) {
    logger.error('Error checking deal status', { 
      error: error.message, 
      dealId: req.params.dealId 
    });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Retrieve data from Filecoin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const retrieveData = async (req, res) => {
  try {
    const { cid } = req.body;
    
    if (!cid) {
      return res.status(400).json({
        status: 'error',
        message: 'CID is required'
      });
    }
    
    const retrievedData = await filecoinService.retrieveDataset(cid);
    
    // Check if data is a file path or buffer
    if (retrievedData.isPath) {
      return res.download(retrievedData.data, retrievedData.name, async (err) => {
        if (err) {
          logger.error('Error sending file', { error: err.message, cid });
          
          if (!res.headersSent) {
            return res.status(500).json({
              status: 'error',
              message: 'Error sending file'
            });
          }
        }
        
        // Delete temporary file after sending
        try {
          await unlinkAsync(retrievedData.data);
          
          // Also clean up output directory if it exists
          if (retrievedData.outputDir) {
            await fs.promises.rm(retrievedData.outputDir, { recursive: true, force: true });
          }
        } catch (unlinkError) {
          logger.warn('Error deleting temporary file', { 
            error: unlinkError.message, 
            path: retrievedData.data 
          });
        }
      });
    } else {
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename=${retrievedData.name}`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', retrievedData.data.length);
      
      return res.send(retrievedData.data);
    }
  } catch (error) {
    logger.error('Error retrieving data from Filecoin', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Calculate storage cost
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateStorageCost = async (req, res) => {
  try {
    const { sizeBytes, durationEpochs, verifiedDeal } = req.body;
    
    if (!sizeBytes || !durationEpochs) {
      return res.status(400).json({
        status: 'error',
        message: 'Size and duration are required'
      });
    }
    
    const costEstimate = await filecoinService.calculateStorageCost(
      parseInt(sizeBytes),
      parseInt(durationEpochs),
      verifiedDeal === true
    );
    
    return res.status(200).json({
      status: 'success',
      data: costEstimate
    });
  } catch (error) {
    logger.error('Error calculating storage cost', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Find storage providers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const findStorageProviders = async (req, res) => {
  try {
    const { minFreeSpace, region, maxPrice } = req.query;
    
    const criteria = {
      minFreeSpace: minFreeSpace ? parseInt(minFreeSpace) : undefined,
      region,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    };
    
    const providers = await filecoinService.findStorageProviders(criteria);
    
    return res.status(200).json({
      status: 'success',
      data: providers
    });
  } catch (error) {
    logger.error('Error finding storage providers', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  storeData,
  createStorageDeal,
  checkDealStatus,
  retrieveData,
  calculateStorageCost,
  findStorageProviders
};