/**
 * DAO governance controller
 */
const daoService = require('../services/dao.service');
const logger = require('../utils/logger');

/**
 * Create a governance proposal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createProposal = async (req, res) => {
  try {
    const { title, description, proposalType, parameters, votingPeriod } = req.body;
    
    if (!title || !description || !proposalType) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, description, and proposalType are required'
      });
    }
    
    const proposal = await daoService.createProposal({
      title,
      description,
      proposalType,
      parameters: parameters || {},
      proposer: req.user.walletAddress,
      votingPeriod: votingPeriod ? parseInt(votingPeriod) : undefined
    });
    
    return res.status(201).json({
      status: 'success',
      data: proposal
    });
  } catch (error) {
    logger.error('Error creating proposal', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Cast a vote on a proposal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const castVote = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { support, reason } = req.body;
    
    if (support === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Support parameter is required'
      });
    }
    
    const vote = await daoService.castVote(proposalId, {
      voter: req.user.walletAddress,
      support: support === true || support === 'true',
      reason
    });
    
    return res.status(200).json({
      status: 'success',
      data: vote
    });
  } catch (error) {
    logger.error('Error casting vote', { error: error.message, proposalId: req.params.proposalId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    if (error.message.includes('not active') || 
        error.message.includes('has ended') ||
        error.message.includes('already voted')) {
      return res.status(400).json({
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
 * Get proposal details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    
    const proposal = await daoService.getProposal(proposalId);
    
    return res.status(200).json({
      status: 'success',
      data: proposal
    });
  } catch (error) {
    logger.error('Error getting proposal', { error: error.message, proposalId: req.params.proposalId });
    
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
 * List proposals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const listProposals = async (req, res) => {
  try {
    const { status, proposalType, proposer, page, limit } = req.query;
    
    const filters = {
      status,
      proposalType,
      proposer
    };
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const result = await daoService.listProposals(filters, pageNum, limitNum);
    
    return res.status(200).json({
      status: 'success',
      data: result.proposals,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error listing proposals', { error: error.message });
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get votes for a proposal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProposalVotes = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { page, limit } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    
    const result = await daoService.getProposalVotes(proposalId, pageNum, limitNum);
    
    return res.status(200).json({
      status: 'success',
      data: result.votes,
      summary: result.summary,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error getting proposal votes', { error: error.message, proposalId: req.params.proposalId });
    
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
 * Execute a proposal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const executeProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    
    const result = await daoService.executeProposal(proposalId, req.user.walletAddress);
    
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Error executing proposal', { error: error.message, proposalId: req.params.proposalId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    if (error.message.includes('not ready') || 
        error.message.includes('did not pass')) {
      return res.status(400).json({
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
  createProposal,
  castVote,
  getProposal,
  listProposals,
  getProposalVotes,
  executeProposal
};