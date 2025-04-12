/**
 * Dataset routes
 */
const express = require('express');
const datasetController = require('../controllers/dataset.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const rateLimitMiddleware = require('../middleware/rate-limit.middleware');

const router = express.Router();

// Public routes
router.get(
  '/',
  validationMiddleware.paginationRules,
  validationMiddleware.validateRequest,
  datasetController.listDatasets
);

router.get(
  '/:id',
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  datasetController.getDataset
);

router.get(
  '/token/:tokenId',
  datasetController.getDatasetByTokenId
);

// Protected routes
router.post(
  '/',
  authMiddleware.authenticate,
  rateLimitMiddleware.apiLimiter,
  datasetController.createDataset
);

router.post(
  '/:id/verify',
  authMiddleware.authenticate,
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  datasetController.verifyDataset
);

router.get(
  '/:id/download',
  authMiddleware.authenticateAny,
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  datasetController.downloadDataset
);

module.exports = router;