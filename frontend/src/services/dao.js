import api from './api';
import { API_ENDPOINTS } from '../constants/api';
import * as contracts from './contracts';

/**
 * Get all proposals
 * @param {Object} filters - Filter parameters
 * @param {string} [filters.status] - Filter by status (active, passed, failed, executed)
 * @param {string} [filters.type] - Filter by proposal type
 * @param {string} [filters.creator] - Filter by creator address
 * @param {number} [filters.page=1] - Page number
 * @param {number} [filters.limit=10] - Items per page
 * @returns {Promise<Object>} Proposals and pagination data
 */
export const getProposals = async (filters = {}) => {
  try {
    return await api.get(API_ENDPOINTS.DAO.PROPOSALS, { params: filters });
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch proposals');
  }
};

/**
 * Get a specific proposal by ID
 * @param {string} id - Proposal ID
 * @returns {Promise<Object>} Proposal details
 */
export const getProposal = async (id) => {
  try {
    return await api.get(`${API_ENDPOINTS.DAO.PROPOSALS}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch proposal details');
  }
};

/**
 * Create a new proposal
 * @param {Object} proposalData - Proposal data
 * @param {string} proposalData.title - Proposal title
 * @param {string} proposalData.description - Proposal description
 * @param {string} proposalData.type - Proposal type (e.g., ADD_DATASET, MODIFY_PARAMETERS)
 * @param {Object} proposalData.actions - Actions to execute if passed
 * @param {number} proposalData.votingPeriod - Voting period in seconds
 * @returns {Promise<Object>} Created proposal
 */
export const createProposal = async (proposalData) => {
  try {
    return await api.post(API_ENDPOINTS.DAO.PROPOSALS, proposalData);
  } catch (error) {
    throw new Error(error.message || 'Failed to create proposal');
  }
};

/**
 * Submit a vote on a proposal
 * @param {string} proposalId - Proposal ID
 * @param {boolean} support - Whether to support the proposal
 * @param {string} [reason] - Optional reason for the vote
 * @returns {Promise<Object>} Vote result
 */
export const castVote = async (proposalId, support, reason = '') => {
  try {
    await contracts.initContracts(true);
    const tx = await contracts.dataDAO.castVote(proposalId, support, reason);
    const receipt = await tx.wait();
    
    // Return the vote event data
    const voteEvent = receipt.events.find(e => e.event === 'VoteCast');
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      vote: {
        proposalId,
        support,
        reason,
        voter: voteEvent.args.voter
      }
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to cast vote');
  }
};

/**
 * Execute a passed proposal
 * @param {string} proposalId - Proposal ID
 * @returns {Promise<Object>} Execution result
 */
export const executeProposal = async (proposalId) => {
  try {
    await contracts.initContracts(true);
    const tx = await contracts.dataDAO.execute(proposalId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      executedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to execute proposal');
  }
};

/**
 * Cancel a proposal (only creator can cancel)
 * @param {string} proposalId - Proposal ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelProposal = async (proposalId) => {
  try {
    await contracts.initContracts(true);
    const tx = await contracts.dataDAO.cancel(proposalId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      cancelledAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to cancel proposal');
  }
};

/**
 * Get user's voting power
 * @param {string} [address] - Address to check (defaults to connected wallet)
 * @returns {Promise<Object>} Voting power details
 */
export const getVotingPower = async (address = null) => {
  try {
    await contracts.initContracts();
    if (!address) {
      address = await contracts.getWalletAddress();
    }
    
    const votingPower = await contracts.dataDAO.getVotingPower(address);
    return {
      address,
      votingPower: votingPower.toString(),
      formattedVotingPower: parseInt(votingPower) / 1e18  // Assuming 18 decimals
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to get voting power');
  }
};

/**
 * Delegate voting power to another address
 * @param {string} delegatee - Address to delegate to
 * @returns {Promise<Object>} Delegation result
 */
export const delegateVotingPower = async (delegatee) => {
  try {
    await contracts.initContracts(true);
    const tx = await contracts.dataDAO.delegate(delegatee);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      delegatee
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to delegate voting power');
  }
};

/**
 * Get DAO governance parameters
 * @returns {Promise<Object>} DAO parameters
 */
export const getDAOParameters = async () => {
  try {
    return await api.get(API_ENDPOINTS.DAO.PARAMETERS);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch DAO parameters');
  }
};

/**
 * Get DAO statistics
 * @returns {Promise<Object>} DAO statistics
 */
export const getDAOStats = async () => {
  try {
    return await api.get(API_ENDPOINTS.DAO.STATS);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch DAO statistics');
  }
};

/**
 * Get voting history for a user
 * @param {string} [address] - User address (defaults to connected wallet)
 * @returns {Promise<Array>} Voting history
 */
export const getVotingHistory = async (address = null) => {
  try {
    if (!address) {
      address = await contracts.getWalletAddress();
    }
    
    return await api.get(`${API_ENDPOINTS.DAO.VOTERS}/${address}/history`);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch voting history');
  }
};