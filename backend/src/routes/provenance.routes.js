/**
 * Provenance routes
 */
const express = require('express');
const provenanceController = require('../controllers/provenance.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get(
  '/dataset/:datasetId',
  validationMiddleware.validateDatasetId,
  validationMiddleware.validateRequest,
  provenanceController.getProvenanceHistory
);

router.get(
  '/dataset/:datasetId/graph',
  validationMiddleware.validateDatasetId,
  validationMiddleware.validateRequest,
  provenanceController.getProvenanceGraph
);

router.get(
  '/dataset/:datasetId/verify',
  validationMiddleware.validateDatasetId,
  validationMiddleware.validateRequest,
  provenanceController.verifyProvenanceChain
);

// Protected routes
router.post(
  '/',
  authMiddleware.authenticate,
  validationMiddleware.provenanceRecordRules,
  validationMiddleware.validateRequest,
  provenanceController.addProvenanceRecord
);

module.exports = router;