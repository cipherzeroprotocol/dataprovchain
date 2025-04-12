// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/DataTypes.sol";

/**
 * @title IDataDAO
 * @dev Interface for the DataDAO contract
 */
interface IDataDAO {
    /**
     * @dev Emitted when a new proposal is created
     */
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 creationTime,
        uint256 votingEndTime
    );
    
    /**
     * @dev Emitted when a vote is cast
     */
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a proposal is executed
     */
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a proposal is canceled
     */
    event ProposalCanceled(
        uint256 indexed proposalId,
        address indexed canceler,
        uint256 timestamp
    );
    
    /**
     * @dev Creates a new governance proposal
     * @param title Title of the proposal
     * @param description Description of the proposal
     * @param data Call data for execution
     * @param votingPeriod Voting period in seconds
     * @return proposalId of the new proposal
     */
    function createProposal(
        string memory title,
        string memory description,
        bytes memory data,
        uint256 votingPeriod
    ) external returns (uint256);
    
    /**
     * @dev Casts a vote on a proposal
     * @param proposalId ID of the proposal
     * @param support Whether to support the proposal
     */
    function castVote(uint256 proposalId, bool support) external;
    
    /**
     * @dev Executes a successful proposal
     * @param proposalId ID of the proposal
     */
    function executeProposal(uint256 proposalId) external;
    
    /**
     * @dev Cancels a proposal
     * @param proposalId ID of the proposal
     */
    function cancelProposal(uint256 proposalId) external;
    
    /**
     * @dev Gets proposal details
     * @param proposalId ID of the proposal
     * @return Proposal details
     */
    function getProposal(
        uint256 proposalId
    ) external view returns (DataTypes.Proposal memory);
    
    /**
     * @dev Gets proposal status
     * @param proposalId ID of the proposal
     * @return 0: Pending, 1: Active, 2: Succeeded, 3: Failed, 4: Executed, 5: Canceled
     */
    function getProposalStatus(uint256 proposalId) external view returns (uint8);
    
    /**
     * @dev Gets voting results for a proposal
     * @param proposalId ID of the proposal
     * @return forVotes, againstVotes, total votes cast
     */
    function getVotingResults(
        uint256 proposalId
    ) external view returns (uint256, uint256, uint256);
    
    /**
     * @dev Checks if an address has voted on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return True if the address has voted, false otherwise
     */
    function hasVoted(
        uint256 proposalId,
        address voter
    ) external view returns (bool);
    
    /**
     * @dev Gets all active proposals
     * @return Array of proposal IDs
     */
    function getActiveProposals() external view returns (uint256[] memory);
}