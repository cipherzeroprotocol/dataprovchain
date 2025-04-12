import { useState, useCallback } from 'react';
import * as daoService from '../services/dao';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useWeb3 } from './useWeb3';

export const useDAO = () => {
  const [proposals, setProposals] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [votingPower, setVotingPower] = useState({
    address: null,
    votingPower: '0',
    formattedVotingPower: 0
  });
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  
  const { success, error: showError } = useNotificationContext();
  const { account } = useWeb3();

  // Get all proposals with filters
  const getProposals = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await daoService.getProposals(filters);
      
      setProposals(result.proposals);
      setPagination(result.pagination);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific proposal by ID
  const getProposal = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await daoService.getProposal(id);
      setProposal(result);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new proposal
  const createProposal = useCallback(async (proposalData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await daoService.createProposal(proposalData);
      
      success('Proposal created successfully');
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to create proposal: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  // Cast a vote on a proposal
  const castVote = useCallback(async (proposalId, support, reason = '') => {
    try {
      setVoting(true);
      setError(null);
      
      const result = await daoService.castVote(proposalId, support, reason);
      
      // Update proposal if we have it loaded
      if (proposal && proposal.id === proposalId) {
        // Refresh proposal to get updated votes
        const updatedProposal = await daoService.getProposal(proposalId);
        setProposal(updatedProposal);
      }
      
      success(`Vote cast successfully ${support ? 'in favor' : 'against'} the proposal`);
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to cast vote: ${err.message}`);
      throw err;
    } finally {
      setVoting(false);
    }
  }, [proposal, success, showError]);

  // Execute a passed proposal
  const executeProposal = useCallback(async (proposalId) => {
    try {
      setExecuting(true);
      setError(null);
      
      const result = await daoService.executeProposal(proposalId);
      
      // Update proposal if we have it loaded
      if (proposal && proposal.id === proposalId) {
        // Refresh proposal to get updated status
        const updatedProposal = await daoService.getProposal(proposalId);
        setProposal(updatedProposal);
      }
      
      success('Proposal executed successfully');
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to execute proposal: ${err.message}`);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, [proposal, success, showError]);

  // Cancel a proposal
  const cancelProposal = useCallback(async (proposalId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await daoService.cancelProposal(proposalId);
      
      // Update proposal if we have it loaded
      if (proposal && proposal.id === proposalId) {
        // Refresh proposal to get updated status
        const updatedProposal = await daoService.getProposal(proposalId);
        setProposal(updatedProposal);
      }
      
      success('Proposal cancelled successfully');
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to cancel proposal: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [proposal, success, showError]);

  // Get current user's voting power
  const getVotingPower = useCallback(async (address = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use connected wallet address if not provided
      const targetAddress = address || account;
      
      // If no address is available, return zero voting power
      if (!targetAddress) {
        setVotingPower({
          address: null,
          votingPower: '0',
          formattedVotingPower: 0
        });
        return {
          address: null,
          votingPower: '0',
          formattedVotingPower: 0
        };
      }
      
      const result = await daoService.getVotingPower(targetAddress);
      setVotingPower(result);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Delegate voting power to another address
  const delegateVotingPower = useCallback(async (delegatee) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await daoService.delegateVotingPower(delegatee);
      
      // Refresh voting power
      await getVotingPower();
      
      success(`Voting power delegated to ${delegatee}`);
      return result;
    } catch (err) {
      setError(err.message);
      showError(`Failed to delegate voting power: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getVotingPower, success, showError]);

  // Get DAO parameters
  const getDAOParameters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      return await daoService.getDAOParameters();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get DAO statistics
  const getDAOStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      return await daoService.getDAOStats();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's voting history
  const getUserVotingHistory = useCallback(async (address = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use connected wallet address if not provided
      const targetAddress = address || account;
      
      if (!targetAddress) {
        setVotingHistory([]);
        return [];
      }
      
      const result = await daoService.getVotingHistory(targetAddress);
      setVotingHistory(result);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Load user data (voting power and history) when account changes
  useState(() => {
    if (account) {
      getVotingPower();
      getUserVotingHistory();
    }
  }, [account, getVotingPower, getUserVotingHistory]);

  return {
    proposals,
    proposal,
    votingPower,
    votingHistory,
    loading,
    voting,
    executing,
    error,
    pagination,
    getProposals,
    getProposal,
    createProposal,
    castVote,
    executeProposal,
    cancelProposal,
    getVotingPower,
    delegateVotingPower,
    getDAOParameters,
    getDAOStats,
    getUserVotingHistory
  };
};

export default useDAO;