/**
 * Dataset controller
 */
const datasetService = require('../services/dataset.service');
const provenanceService = require('../services/provenance.service');
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
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types, but you could add restrictions here
    cb(null, true);
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
 * Create a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDataset = async (req, res) => {
  try {
    // Handle file upload first
    await uploadAsync(req, res);
    
    const { name, description, dataType, license, contributors, tags } = req.body;
    
    // Validate contributors JSON if it's a string
    let parsedContributors;
    try {
      parsedContributors = typeof contributors === 'string' ? 
        JSON.parse(contributors) : contributors;
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid contributors format'
      });
    }
    
    // Validate tags JSON if it's a string
    let parsedTags;
    try {
      parsedTags = typeof tags === 'string' ? 
        JSON.parse(tags) : tags;
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid tags format'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    
    // Create dataset
    const dataset = await datasetService.createDataset({
      name,
      description,
      dataType,
      license,
      contributors: parsedContributors,
      tags: parsedTags,
      file: req.file.path,
      creator: req.user.walletAddress
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
    
    // Add initial provenance record
    await provenanceService.addProvenanceRecord({
      datasetId: dataset.id,
      actionType: 'creation',
      performedBy: req.user.walletAddress,
      description: 'Dataset created'
    });
    
    return res.status(201).json({
      status: 'success',
      data: dataset
    });
  } catch (error) {
    logger.error('Error creating dataset', { error: error.message });
    
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
 * Get a dataset by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await datasetService.getDataset(id);
    
    return res.status(200).json({
      status: 'success',
      data: dataset
    });
  } catch (error) {
    logger.error('Error getting dataset', { error: error.message, id: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * List datasets
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const listDatasets = async (req, res) => {
  try {
    const { creator, dataType, verified, tag, page, limit } = req.query;
    
    const filters = {
      creator,
      dataType,
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
      tag
    };
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const result = await datasetService.listDatasets(filters, pageNum, limitNum);
    
    return res.status(200).json({
      status: 'success',
      data: result.datasets,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error listing datasets', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Verify a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyDataset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can verify datasets
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only admins can verify datasets'
      });
    }
    
    const result = await datasetService.verifyDataset(id, req.user.walletAddress);
    
    // Add provenance record for verification
    await provenanceService.addProvenanceRecord({
      datasetId: id,
      actionType: 'verification',
      performedBy: req.user.walletAddress,
      description: 'Dataset verified by admin'
    });
    
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Error verifying dataset', { error: error.message, id: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Download a dataset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const downloadDataset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Download dataset content
    const result = await datasetService.downloadDataset(id);
    
    // Check if content is a file path or buffer
    if (result.isPath) {
      return res.download(result.data, result.name, async (err) => {
        if (err) {
          logger.error('Error sending file', { error: err.message, id });
          
          if (!res.headersSent) {
            return res.status(500).json({
              status: 'error',
              message: 'Error sending file'
            });
          }
        }
        
        // Delete temporary file after sending
        try {
          await unlinkAsync(result.data);
        } catch (unlinkError) {
          logger.warn('Error deleting temporary file', { 
            error: unlinkError.message, 
            path: result.data 
          });
        }
      });
    } else {
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename=${result.name}`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', result.data.length);
      
      return res.send(result.data);
    }
  } catch (error) {
    logger.error('Error downloading dataset', { error: error.message, id: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get dataset by token ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDatasetByTokenId = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const dataset = await datasetService.getDatasetByTokenId(tokenId);
    
    return res.status(200).json({
      status: 'success',
      data: dataset
    });
  } catch (error) {
    logger.error('Error getting dataset by token ID', { 
      error: error.message, 
      tokenId: req.params.tokenId 
    });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  createDataset,
  getDataset,
  listDatasets,
  verifyDataset,
  downloadDataset,
  getDatasetByTokenId
};