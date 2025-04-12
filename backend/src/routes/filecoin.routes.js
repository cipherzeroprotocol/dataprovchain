/**
 * Filecoin routes
 */
const express = require('express');
const filecoinController = require('../controllers/filecoin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get(
  '/providers',
  filecoinController.findStorageProviders
);

router.post(
  '/cost-estimate',
  filecoinController.calculateStorageCost
);

router.get(
  '/deal/:dealId',
  filecoinController.checkDealStatus
);

// Protected routes
router.post(
  '/store',
  authMiddleware.authenticate,
  filecoinController.storeData
);

router.post(
  '/retrieve',
  authMiddleware.authenticateAny,
  filecoinController.retrieveData
);

router.post(
  '/deal',
  authMiddleware.authenticate,
  filecoinController.createStorageDeal
);

module.exports = router;