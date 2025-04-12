// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IDataDAO.sol";
import "./libraries/DataTypes.sol";

/**
 * @title DataDAO
 * @dev Contract for DAO governance of the DataProvChain platform
 */
contract DataDAO is IDataDAO, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Counter for proposal IDs
    Counters.Counter private _proposalIds;
    
    // Mapping from proposal ID to proposal
    mapping(uint256 => DataTypes.Proposal) private _proposals;
    
    // Mapping from proposal ID to voter to whether they have voted
    mapping(uint256 => mapping(address => bool)) private _hasVoted;
    
    // Mapping from address to voting power
    mapping(address => uint256) private _votingPower;
    
    // Total voting power
    uint256 private _totalVotingPower;
    
    // Minimum voting power required to create a proposal
    uint256 public minProposalPower;
    
    // Minimum quorum percentage required (in basis points, e.g., 3000 = 30%)
    uint256 public quorumPercentage;
    
    // Role for DAO administrators
    bytes32 public constant DAO_ADMIN_ROLE = keccak256("DAO_ADMIN_ROLE");
    
    /**
     * @dev Constructor for the DataDAO contract
     * @param _minProposalPower Minimum voting power required to create a proposal
     * @param _quorumPercentage Minimum quorum percentage required (in basis points)
     */
    constructor(uint256 _minProposalPower, uint256 _quorumPercentage) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DAO_ADMIN_ROLE, msg.sender);
        
        minProposalPower = _minProposalPower;
        quorumPercentage = _quorumPercentage;
        
        // Initialize the sender with some voting power
        _votingPower[msg.sender] = 100;
        _totalVotingPower = 100;
    }
    
    /**
     * @dev Set the minimum proposal power
     * @param _minProposalPower New minimum proposal power
     */
    function setMinProposalPower(uint256 _minProposalPower) external onlyRole(DAO_ADMIN_ROLE) {
        minProposalPower = _minProposalPower;
    }
    
    /**
     * @dev Set the quorum percentage
     * @param _quorumPercentage New quorum percentage (in basis points)
     */
    function setQuorumPercentage(uint256 _quorumPercentage) external onlyRole(DAO_ADMIN_ROLE) {
        require(_quorumPercentage <= 10000, "DataDAO: Quorum percentage too high"); // Max 100%
        quorumPercentage = _quorumPercentage;
    }
    
    /**
     * @dev Assign voting power to an address
     * @param account Address to assign voting power to
     * @param amount Amount of voting power to assign
     */
    function assignVotingPower(address account, uint256 amount) external onlyRole(DAO_ADMIN_ROLE) {
        require(account != address(0), "DataDAO: Invalid address");
        
        // Update total voting power
        _totalVotingPower = _totalVotingPower - _votingPower[account] + amount;
        
        // Update account's voting power
        _votingPower[account] = amount;
    }
    
    /**
     * @dev See {IDataDAO-createProposal}
     */
    function createProposal(
        string memory title,
        string memory description,
        bytes memory data,
        uint256 votingPeriod
    ) 
        external 
        override 
        nonReentrant 
        returns (uint256) 
    {
        // Ensure the creator has enough voting power
        require(_votingPower[msg.sender] >= minProposalPower, "DataDAO: Insufficient voting power");
        
        // Ensure voting period is reasonable
        require(votingPeriod >= 1 days && votingPeriod <= 30 days, "DataDAO: Invalid voting period");
        
        // Create proposal
        _proposalIds.increment();
        uint256 proposalId = _proposalIds.current();
        
        DataTypes.Proposal memory proposal = DataTypes.Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            data: data,
            creationTime: block.timestamp,
            votingEndTime: block.timestamp + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            canceled: false
        });
        
        // Store proposal
        _proposals[proposalId] = proposal;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            block.timestamp,
            block.timestamp + votingPeriod
        );
        
        return proposalId;
    }
    
    /**
     * @dev See {IDataDAO-castVote}
     */
    function castVote(uint256 proposalId, bool support) 
        external 
        override 
        nonReentrant 
    {
        // Ensure the proposal exists
        require(_proposals[proposalId].proposer != address(0), "DataDAO: Proposal does not exist");
        
        // Ensure the proposal is still open for voting
        require(
            block.timestamp < _proposals[proposalId].votingEndTime,
            "DataDAO: Voting period ended"
        );
        
        // Ensure the proposal is not executed or canceled
        require(!_proposals[proposalId].executed, "DataDAO: Proposal already executed");
        require(!_proposals[proposalId].canceled, "DataDAO: Proposal canceled");
        
        // Ensure the voter has not already voted
        require(!_hasVoted[proposalId][msg.sender], "DataDAO: Already voted");
        
        // Get voter's voting power
        uint256 votePower = _votingPower[msg.sender];
        require(votePower > 0, "DataDAO: No voting power");
        
        // Record vote
        if (support) {
            _proposals[proposalId].forVotes += votePower;
        } else {
            _proposals[proposalId].againstVotes += votePower;
        }
        
        // Mark as voted
        _hasVoted[proposalId][msg.sender] = true;
        
        emit VoteCast(proposalId, msg.sender, support, block.timestamp);
    }
    
    /**
     * @dev See {IDataDAO-executeProposal}
     */
    function executeProposal(uint256 proposalId) 
        external 
        override 
        nonReentrant 
    {
        // Ensure the proposal exists
        DataTypes.Proposal storage proposal = _proposals[proposalId];
        require(proposal.proposer != address(0), "DataDAO: Proposal does not exist");
        
        // Ensure the voting period has ended
        require(block.timestamp >= proposal.votingEndTime, "DataDAO: Voting period not ended");
        
        // Ensure the proposal is not executed or canceled
        require(!proposal.executed, "DataDAO: Proposal already executed");
        require(!proposal.canceled, "DataDAO: Proposal canceled");
        
        // Ensure quorum is reached
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(
            (totalVotes * 10000) / _totalVotingPower >= quorumPercentage,
            "DataDAO: Quorum not reached"
        );
        
        // Ensure the proposal passed
        require(proposal.forVotes > proposal.againstVotes, "DataDAO: Proposal did not pass");
        
        // Mark as executed
        proposal.executed = true;
        
        // Execute the proposal (call target with data)
        // This is a simplified implementation; in a real contract, you'd use more elaborate execution logic
        
        emit ProposalExecuted(proposalId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev See {IDataDAO-cancelProposal}
     */
    function cancelProposal(uint256 proposalId) 
        external 
        override 
        nonReentrant 
    {
        // Ensure the proposal exists
        DataTypes.Proposal storage proposal = _proposals[proposalId];
        require(proposal.proposer != address(0), "DataDAO: Proposal does not exist");
        
        // Ensure the proposal is not executed or canceled
        require(!proposal.executed, "DataDAO: Proposal already executed");
        require(!proposal.canceled, "DataDAO: Proposal already canceled");
        
        // Ensure the caller is the proposer or a DAO admin
        require(
            proposal.proposer == msg.sender || hasRole(DAO_ADMIN_ROLE, msg.sender),
            "DataDAO: Not authorized"
        );
        
        // Mark as canceled
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev See {IDataDAO-getProposal}
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        override 
        returns (DataTypes.Proposal memory) 
    {
        return _proposals[proposalId];
    }
    
    /**
     * @dev See {IDataDAO-getProposalStatus}
     */
    function getProposalStatus(uint256 proposalId) 
        external 
        view 
        override 
        returns (uint8) 
    {
        DataTypes.Proposal memory proposal = _proposals[proposalId];
        
        if (proposal.proposer == address(0)) {
            return 0; // Non-existent
        }
        
        if (proposal.canceled) {
            return 5; // Canceled
        }
        
        if (proposal.executed) {
            return 4; // Executed
        }
        
        if (block.timestamp < proposal.votingEndTime) {
            return 1; // Active
        }
        
        // Voting period ended, check results
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        bool quorumReached = (totalVotes * 10000) / _totalVotingPower >= quorumPercentage;
        
        if (!quorumReached) {
            return 3; // Failed (quorum not reached)
        }
        
        if (proposal.forVotes > proposal.againstVotes) {
            return 2; // Succeeded
        } else {
            return 3; // Failed (not enough votes)
        }
    }
    
    /**
     * @dev See {IDataDAO-getVotingResults}
     */
    function getVotingResults(uint256 proposalId) 
        external 
        view 
        override 
        returns (uint256, uint256, uint256) 
    {
        DataTypes.Proposal memory proposal = _proposals[proposalId];
        return (proposal.forVotes, proposal.againstVotes, proposal.forVotes + proposal.againstVotes);
    }
    
    /**
     * @dev See {IDataDAO-hasVoted}
     */
    function hasVoted(uint256 proposalId, address voter) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _hasVoted[proposalId][voter];
    }
    
    /**
     * @dev See {IDataDAO-getActiveProposals}
     */
    function getActiveProposals() 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        // Count active proposals
        uint256 count = 0;
        for (uint256 i = 1; i <= _proposalIds.current(); i++) {
            if (
                _proposals[i].proposer != address(0) &&
                !_proposals[i].executed &&
                !_proposals[i].canceled &&
                block.timestamp < _proposals[i].votingEndTime
            ) {
                count++;
            }
        }
        
        // Create result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        // Fill result array
        for (uint256 i = 1; i <= _proposalIds.current(); i++) {
            if (
                _proposals[i].proposer != address(0) &&
                !_proposals[i].executed &&
                !_proposals[i].canceled &&
                block.timestamp < _proposals[i].votingEndTime
            ) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
}