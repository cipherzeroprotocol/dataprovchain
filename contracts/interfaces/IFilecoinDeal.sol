// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/DataTypes.sol";

/**
 * @title IFilecoinDeal
 * @dev Interface for interacting with Filecoin storage deals
 */
interface IFilecoinDeal {
    /**
     * @dev Emitted when a deal proposal is created
     */
    event DealProposalCreated(
        bytes32 indexed id,
        string cid,
        uint64 size,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a deal is published
     */
    event DealPublished(
        bytes32 indexed id,
        uint64 dealId,
        string provider,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a deal is activated
     */
    event DealActivated(
        bytes32 indexed id,
        uint64 dealId,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a deal is terminated
     */
    event DealTerminated(
        bytes32 indexed id,
        uint64 dealId,
        uint256 timestamp
    );
    
    /**
     * @dev Creates a deal proposal for Filecoin storage
     * @param cid Content ID of the data
     * @param size Size of the data in bytes
     * @param verifiedDeal Whether this is a verified deal
     * @param startEpoch Epoch when the deal should start
     * @param endEpoch Epoch when the deal should end
     * @param price Price per epoch for the deal
     * @return dealId identifier for the proposal
     */
    function makeDealProposal(
        string memory cid,
        uint64 size,
        bool verifiedDeal,
        int64 startEpoch,
        int64 endEpoch,
        uint256 price
    ) external returns (bytes32);
    
    /**
     * @dev Checks the status of a deal
     * @param dealId ID of the deal
     * @return status (0: None, 1: Proposed, 2: Published, 3: Active, 4: Terminated)
     */
    function checkDealStatus(bytes32 dealId) external returns (uint8);
    
    /**
     * @dev Gets deal information
     * @param dealId ID of the deal
     * @return Deal information
     */
    function getDealInfo(
        bytes32 dealId
    ) external view returns (DataTypes.StorageDeal memory);
    
    /**
     * @dev Gets all deals for a CID
     * @param cid Content ID
     * @return Array of deal IDs
     */
    function getDealsByCID(string memory cid) external view returns (bytes32[] memory);
    
    /**
     * @dev Adds funds to the contract for making deals
     */
    function addFunds() external payable;
    
    /**
     * @dev Withdraws funds from the contract
     * @param amount Amount to withdraw
     */
    function withdrawFunds(uint256 amount) external;
}