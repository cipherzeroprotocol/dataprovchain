/**
 * Marketplace routes
 */
const express = require('express');
const marketplaceController = require('../controllers/marketplace.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get(
  '/listings',
  validationMiddleware.paginationRules,
  validationMiddleware.validateRequest,
  marketplaceController.listListings
);

router.get(
  '/listings/:id',
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  marketplaceController.getListing
);

// Protected routes
router.post(
  '/listings',
  authMiddleware.authenticate,
  validationMiddleware.listingCreationRules,
  validationMiddleware.validateRequest,
  marketplaceController.createListing
);

router.put(
  '/listings/:id',
  authMiddleware.authenticate,
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  marketplaceController.updateListing
);

router.post(
  '/listings/:id/purchase',
  authMiddleware.authenticate,
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  marketplaceController.purchaseListing
);

router.get(
  '/purchases',
  authMiddleware.authenticate,
  validationMiddleware.paginationRules,
  validationMiddleware.validateRequest,
  marketplaceController.getUserPurchases
);

router.post(
  '/verify-access',
  marketplaceController.verifyAccess
);

module.exports = router;