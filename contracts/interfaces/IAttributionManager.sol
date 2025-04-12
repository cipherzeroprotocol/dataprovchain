// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/DataTypes.sol";

/**
 * @title IAttributionManager
 * @dev Interface for the AttributionManager contract
 */
interface IAttributionManager {
    /**
     * @dev Emitted when attribution is recorded
     */
    event AttributionRecorded(
        uint256 indexed datasetId,
        uint256 indexed modelId,
        string usageType,
        uint256 impactScore,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when royalties are distributed
     */
    event RoyaltiesDistributed(
        uint256 indexed datasetId,
        uint256 totalAmount,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a royalty payment is received
     */
    event RoyaltyPaymentReceived(
        uint256 indexed datasetId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @dev Records attribution for a dataset used in an AI model
     * @param datasetId ID of the dataset
     * @param modelId ID of the AI model
     * @param usageType How the dataset was used
     * @param impactScore Impact of the dataset on the model
     */
    function recordAttribution(
        uint256 datasetId,
        uint256 modelId,
        string memory usageType,
        uint256 impactScore
    ) external;
    
    /**
     * @dev Distributes royalties to dataset contributors
     * @param datasetId ID of the dataset
     */
    function distributeRoyalties(uint256 datasetId) external payable;
    
    /**
     * @dev Pay royalties for dataset usage
     * @param datasetId ID of the dataset
     */
    function payRoyalties(uint256 datasetId) external payable;
    
    /**
     * @dev Calculates attribution shares based on impact scores
     * @param datasetId ID of the dataset
     * @return Array of addresses and their shares
     */
    function calculateAttributionShares(
        uint256 datasetId
    ) external view returns (address[] memory, uint256[] memory);
    
    /**
     * @dev Gets attribution history for a dataset
     * @param datasetId ID of the dataset
     * @return Array of attribution records
     */
    function getAttributionHistory(
        uint256 datasetId
    ) external view returns (DataTypes.Attribution[] memory);
    
    /**
     * @dev Gets pending royalties for a dataset
     * @param datasetId ID of the dataset
     * @return Pending royalty amount
     */
    function getPendingRoyalties(
        uint256 datasetId
    ) external view returns (uint256);
    
    /**
     * @dev Gets royalty distribution history for a dataset
     * @param datasetId ID of the dataset
     * @return Array of royalty distribution records
     */
    function getRoyaltyDistributionHistory(
        uint256 datasetId
    ) external view returns (DataTypes.RoyaltyDistribution[] memory);
}