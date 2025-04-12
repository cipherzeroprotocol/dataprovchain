/**
 * Attribution routes
 */
const express = require('express');
const attributionController = require('../controllers/attribution.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get(
  '/dataset/:datasetId/usage',
  validationMiddleware.validateDatasetId,
  validationMiddleware.validateRequest,
  attributionController.getUsageHistory
);

router.get(
  '/dataset/:datasetId/royalties',
  validationMiddleware.validateDatasetId,
  validationMiddleware.validateRequest,
  attributionController.getRoyaltyDistribution
);

router.get(
  '/dataset/:datasetId/metrics',
  validationMiddleware.validateDatasetId,
  validationMiddleware.validateRequest,
  attributionController.getAttributionMetrics
);

// Protected routes
router.post(
  '/usage',
  authMiddleware.authenticate,
  validationMiddleware.usageRecordingRules,
  validationMiddleware.validateRequest,
  attributionController.recordUsage
);

router.post(
  '/dataset/:datasetId/royalties',
  authMiddleware.authenticate,
  validationMiddleware.validateDatasetId,
  validationMiddleware.validateRequest,
  attributionController.distributeRoyalties
);

module.exports = router;