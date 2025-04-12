/**
 * DAO routes
 */
const express = require('express');
const daoController = require('../controllers/dao.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get(
  '/proposals',
  validationMiddleware.paginationRules,
  validationMiddleware.validateRequest,
  daoController.listProposals
);

router.get(
  '/proposals/:proposalId',
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  daoController.getProposal
);

router.get(
  '/proposals/:proposalId/votes',
  validationMiddleware.validateUUID,
  validationMiddleware.paginationRules,
  validationMiddleware.validateRequest,
  daoController.getProposalVotes
);

// Protected routes
router.post(
  '/proposals',
  authMiddleware.authenticate,
  daoController.createProposal
);

router.post(
  '/proposals/:proposalId/vote',
  authMiddleware.authenticate,
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  daoController.castVote
);

router.post(
  '/proposals/:proposalId/execute',
  authMiddleware.authenticate,
  validationMiddleware.validateUUID,
  validationMiddleware.validateRequest,
  daoController.executeProposal
);

module.exports = router;