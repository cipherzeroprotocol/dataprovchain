/**
 * DAO governance service
 */
const { v4: uuidv4 } = require('uuid');
const contractsService = require('./contracts.service');
const logger = require('../utils/logger');
const DB = require('../models');

/**
 * Create a governance proposal
 * @param {Object} proposal - Proposal data
 * @param {string} proposal.title - Proposal title
 * @param {string} proposal.description - Proposal description
 * @param {string} proposal.proposalType - Type of proposal (e.g., "parameter_change", "funds_allocation")
 * @param {Object} proposal.parameters - Proposal-specific parameters
 * @param {string} proposal.proposer - Address of the proposer
 * @param {number} proposal.votingPeriod - Voting period in seconds
 * @returns {Promise<Object>} - Created proposal
 */
const createProposal = async (proposal) => {
  try {
    // Create transaction data for on-chain proposal
    const proposalData = {
      proposalId: uuidv4(),
      title: proposal.title,
      description: proposal.description,
      proposalType: proposal.proposalType,
      parameters: proposal.parameters,
      proposer: proposal.proposer
    };
    
    // Create proposal on blockchain
    let onChainId = null;
    let txHash = null;
    
    try {
      const encodedData = JSON.stringify(proposalData);
      const contract = contractsService.getContract('DataDAO');
      
      const votingPeriod = proposal.votingPeriod || 604800; // 7 days in seconds
      
      const tx = await contract.createProposal(
        proposal.title,
        proposal.description,
        encodedData,
        votingPeriod
      );
      
      const receipt = await tx.wait();
      
      // Get event data to extract on-chain ID
      const event = receipt.events.find(e => e.event === 'ProposalCreated');
      onChainId = event.args.proposalId.toString();
      txHash = receipt.transactionHash;
      
      logger.info('Proposal created on blockchain', { 
        onChainId, 
        txHash 
      });
    } catch (blockchainError) {
      logger.error('Error creating proposal on blockchain', { 
        error: blockchainError.message
      });
      // Continue with database record even if blockchain fails
    }
    
    // Save proposal to database
    const dbProposal = await DB.Proposal.create({
      id: proposalData.proposalId,
      title: proposal.title,
      description: proposal.description,
      proposalType: proposal.proposalType,
      parameters: proposal.parameters,
      proposer: proposal.proposer,
      votingPeriod: proposal.votingPeriod || 604800,
      onChainId,
      transactionHash: txHash,
      status: 'active',
      startTime: new Date(),
      endTime: new Date(Date.now() + (proposal.votingPeriod || 604800) * 1000)
    });
    
    logger.info('Proposal created', { id: dbProposal.id });
    
    return {
      id: dbProposal.id,
      title: dbProposal.title,
      description: dbProposal.description,
      proposalType: dbProposal.proposalType,
      parameters: dbProposal.parameters,
      proposer: dbProposal.proposer,
      votingPeriod: dbProposal.votingPeriod,
      onChainId: dbProposal.onChainId,
      transactionHash: dbProposal.transactionHash,
      status: dbProposal.status,
      startTime: dbProposal.startTime,
      endTime: dbProposal.endTime,
      createdAt: dbProposal.createdAt
    };
  } catch (error) {
    logger.error('Error creating proposal', { error: error.message });
    throw error;
  }
};

/**
 * Cast a vote on a proposal
 * @param {string} proposalId - Proposal ID
 * @param {Object} vote - Vote data
 * @param {string} vote.voter - Address of the voter
 * @param {boolean} vote.support - Whether to support the proposal
 * @param {string} [vote.reason] - Reason for the vote
 * @returns {Promise<Object>} - Vote information
 */
const castVote = async (proposalId, vote) => {
  try {
    // Check if proposal exists
    const proposal = await DB.Proposal.findByPk(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }
    
    // Check if proposal is active
    if (proposal.status !== 'active') {
      throw new Error(`Proposal is not active: ${proposalId}`);
    }
    
    // Check if voting period has ended
    if (proposal.endTime < new Date()) {
      // Update proposal status
      await proposal.update({ status: 'closed' });
      throw new Error(`Voting period has ended for proposal: ${proposalId}`);
    }
    
    // Check if voter has already voted
    const existingVote = await DB.Vote.findOne({
      where: {
        proposalId,
        voter: vote.voter
      }
    });
    
    if (existingVote) {
      throw new Error(`Voter has already voted on this proposal: ${vote.voter}`);
    }
    
    // Cast vote on blockchain if on-chain ID is available
    let txHash = null;
    if (proposal.onChainId) {
      try {
        const contract = contractsService.getContract('DataDAO');
        
        const tx = await contract.castVote(
          proposal.onChainId,
          vote.support
        );
        
        const receipt = await tx.wait();
        txHash = receipt.transactionHash;
        
        logger.info('Vote cast on blockchain', { 
          proposalId, 
          voter: vote.voter, 
          txHash 
        });
      } catch (blockchainError) {
        logger.error('Error casting vote on blockchain', { 
          error: blockchainError.message, 
          proposalId 
        });
        // Continue with database record even if blockchain fails
      }
    }
    
    // Save vote to database
    const dbVote = await DB.Vote.create({
      id: uuidv4(),
      proposalId,
      voter: vote.voter,
      support: vote.support,
      reason: vote.reason || null,
      transactionHash: txHash
    });
    
    logger.info('Vote cast', { 
      id: dbVote.id, 
      proposalId, 
      voter: vote.voter 
    });
    
    return {
      id: dbVote.id,
      proposalId,
      voter: dbVote.voter,
      support: dbVote.support,
      reason: dbVote.reason,
      transactionHash: dbVote.transactionHash,
      createdAt: dbVote.createdAt
    };
  } catch (error) {
    logger.error('Error casting vote', { error: error.message, proposalId });
    throw error;
  }
};

/**
 * Get proposal details
 * @param {string} proposalId - Proposal ID
 * @returns {Promise<Object>} - Proposal details
 */
const getProposal = async (proposalId) => {
  try {
    // Get proposal from database
    const proposal = await DB.Proposal.findByPk(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }
    
    // Get vote counts
    const votes = await DB.Vote.findAll({
      where: { proposalId }
    });
    
    const forVotes = votes.filter(v => v.support).length;
    const againstVotes = votes.filter(v => !v.support).length;
    
    // Check if voting period has ended and update status if needed
    if (proposal.status === 'active' && proposal.endTime < new Date()) {
      // Update proposal status
      await proposal.update({ status: 'closed' });
      proposal.status = 'closed';
    }
    
    return {
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      proposalType: proposal.proposalType,
      parameters: proposal.parameters,
      proposer: proposal.proposer,
      votingPeriod: proposal.votingPeriod,
      onChainId: proposal.onChainId,
      transactionHash: proposal.transactionHash,
      status: proposal.status,
      startTime: proposal.startTime,
      endTime: proposal.endTime,
      votes: {
        for: forVotes,
        against: againstVotes,
        total: votes.length
      },
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt
    };
  } catch (error) {
    logger.error('Error getting proposal', { error: error.message, proposalId });
    throw error;
  }
};

/**
 * List proposals
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.status] - Filter by status
 * @param {string} [filters.proposalType] - Filter by proposal type
 * @param {string} [filters.proposer] - Filter by proposer
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Items per page
 * @returns {Promise<Object>} - Paginated proposals
 */
const listProposals = async (filters = {}, page = 1, limit = 10) => {
  try {
    // Build query
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.proposalType) {
      where.proposalType = filters.proposalType;
    }
    
    if (filters.proposer) {
      where.proposer = filters.proposer;
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get proposals
    const { count, rows } = await DB.Proposal.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Update status of any proposals whose voting period has ended
    const now = new Date();
    for (const proposal of rows) {
      if (proposal.status === 'active' && proposal.endTime < now) {
        await proposal.update({ status: 'closed' });
        proposal.status = 'closed';
      }
    }
    
    // Get vote counts for each proposal
    const proposalIds = rows.map(p => p.id);
    const votes = await DB.Vote.findAll({
      where: { proposalId: proposalIds },
      attributes: ['proposalId', 'support']
    });
    
    // Group votes by proposal
    const votesByProposal = {};
    for (const vote of votes) {
      if (!votesByProposal[vote.proposalId]) {
        votesByProposal[vote.proposalId] = { for: 0, against: 0 };
      }
      if (vote.support) {
        votesByProposal[vote.proposalId].for++;
      } else {
        votesByProposal[vote.proposalId].against++;
      }
    }
    
    // Format proposals
    const proposals = rows.map(proposal => ({
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      proposalType: proposal.proposalType,
      proposer: proposal.proposer,
      status: proposal.status,
      startTime: proposal.startTime,
      endTime: proposal.endTime,
      votes: votesByProposal[proposal.id] ? {
        for: votesByProposal[proposal.id].for,
        against: votesByProposal[proposal.id].against,
        total: votesByProposal[proposal.id].for + votesByProposal[proposal.id].against
      } : {
        for: 0,
        against: 0,
        total: 0
      },
      createdAt: proposal.createdAt
    }));
    
    return {
      proposals,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error listing proposals', { error: error.message });
    throw error;
  }
};

/**
 * Get votes for a proposal
 * @param {string} proposalId - Proposal ID
 * @param {number} [page=1] - Page number
 * @param {number} [limit=50] - Items per page
 * @returns {Promise<Object>} - Paginated votes
 */
const getProposalVotes = async (proposalId, page = 1, limit = 50) => {
  try {
    // Check if proposal exists
    const proposal = await DB.Proposal.findByPk(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get votes
    const { count, rows } = await DB.Vote.findAndCountAll({
      where: { proposalId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Format votes
    const votes = rows.map(vote => ({
      id: vote.id,
      voter: vote.voter,
      support: vote.support,
      reason: vote.reason,
      transactionHash: vote.transactionHash,
      createdAt: vote.createdAt
    }));
    
    return {
      votes,
      summary: {
        for: rows.filter(v => v.support).length,
        against: rows.filter(v => !v.support).length,
        total: count
      },
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting proposal votes', { error: error.message, proposalId });
    throw error;
  }
};

/**
 * Execute a proposal
 * @param {string} proposalId - Proposal ID
 * @param {string} executor - Address of the executor
 * @returns {Promise<Object>} - Execution result
 */
const executeProposal = async (proposalId, executor) => {
  try {
    // Get proposal from database
    const proposal = await DB.Proposal.findByPk(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }
    
    // Check if proposal can be executed
    if (proposal.status !== 'closed') {
      throw new Error(`Proposal is not ready for execution: ${proposalId}`);
    }
    
    // Get vote counts
    const votes = await DB.Vote.findAll({
      where: { proposalId }
    });
    
    const forVotes = votes.filter(v => v.support).length;
    const againstVotes = votes.filter(v => !v.support).length;
    
    // Check if proposal has passed
    if (forVotes <= againstVotes) {
      throw new Error(`Proposal did not pass: ${proposalId}`);
    }
    
    // Execute proposal on blockchain if on-chain ID is available
    let txHash = null;
    if (proposal.onChainId) {
      try {
        const contract = contractsService.getContract('DataDAO');
        
        const tx = await contract.executeProposal(proposal.onChainId);
        const receipt = await tx.wait();
        txHash = receipt.transactionHash;
        
        logger.info('Proposal executed on blockchain', { 
          proposalId, 
          executor, 
          txHash 
        });
      } catch (blockchainError) {
        logger.error('Error executing proposal on blockchain', { 
          error: blockchainError.message, 
          proposalId 
        });
        throw blockchainError;
      }
    }
    
    // Update proposal status
    await proposal.update({ 
      status: 'executed', 
      executedAt: new Date(),
      executor,
      executionTransactionHash: txHash
    });
    
    logger.info('Proposal executed', { 
      id: proposal.id, 
      executor 
    });
    
    return {
      id: proposal.id,
      title: proposal.title,
      status: 'executed',
      executedAt: proposal.executedAt,
      executor,
      executionTransactionHash: txHash,
      votes: {
        for: forVotes,
        against: againstVotes,
        total: votes.length
      }
    };
  } catch (error) {
    logger.error('Error executing proposal', { error: error.message, proposalId });
    throw error;
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