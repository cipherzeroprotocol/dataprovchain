// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IDatasetRegistry.sol";
import "./libraries/DataTypes.sol";
import "./libraries/RoyaltyUtils.sol";

/**
 * @title RoyaltyDistributor
 * @dev Contract for distributing royalties to dataset contributors
 */
contract RoyaltyDistributor is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Counter for distribution IDs
    Counters.Counter private _distributionIds;
    
    // DatasetRegistry contract reference
    IDatasetRegistry public datasetRegistry;
    
    // Mapping from distribution ID to distribution record
    mapping(uint256 => DataTypes.RoyaltyDistribution) private _distributions;
    
    // Mapping from dataset ID to distribution IDs
    mapping(uint256 => uint256[]) private _datasetDistributions;
    
    // Mapping from recipient to pending royalties
    mapping(address => uint256) private _pendingRoyalties;
    
    // Platform fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeePercentage = 250;
    
    // Platform fee collector address
    address public platformFeeCollector;
    
    // Events
    event RoyaltyReceived(
        uint256 indexed datasetId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );
    
    event RoyaltyDistributed(
        uint256 indexed distributionId,
        uint256 indexed datasetId,
        uint256 totalAmount,
        uint256 timestamp
    );
    
    event RoyaltyClaimed(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(
        uint256 feePercentage,
        uint256 timestamp
    );
    
    event PlatformFeeCollectorUpdated(
        address feeCollector,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor for the RoyaltyDistributor contract
     * @param _datasetRegistry Address of the DatasetRegistry contract
     * @param _platformFeeCollector Address that collects platform fees
     */
    constructor(
        address _datasetRegistry,
        address _platformFeeCollector
    ) {
        require(_datasetRegistry != address(0), "RoyaltyDistributor: Invalid dataset registry address");
        require(_platformFeeCollector != address(0), "RoyaltyDistributor: Invalid fee collector address");
        
        datasetRegistry = IDatasetRegistry(_datasetRegistry);
        platformFeeCollector = _platformFeeCollector;
    }
    
    /**
     * @dev Set the platform fee percentage
     * @param _feePercentage Fee percentage in basis points (e.g., 250 = 2.5%)
     */
    function setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "RoyaltyDistributor: Fee percentage too high"); // Max 10%
        platformFeePercentage = _feePercentage;
        
        emit PlatformFeeUpdated(_feePercentage, block.timestamp);
    }
    
    /**
     * @dev Set the platform fee collector address
     * @param _platformFeeCollector Address that collects platform fees
     */
    function setPlatformFeeCollector(address _platformFeeCollector) external onlyOwner {
        require(_platformFeeCollector != address(0), "RoyaltyDistributor: Invalid fee collector address");
        platformFeeCollector = _platformFeeCollector;
        
        emit PlatformFeeCollectorUpdated(_platformFeeCollector, block.timestamp);
    }
    
    /**
     * @dev Pay royalties for a dataset
     * @param datasetId ID of the dataset
     */
    function payRoyalties(uint256 datasetId) external payable nonReentrant {
        require(msg.value > 0, "RoyaltyDistributor: Payment amount must be positive");
        
        // Ensure the dataset exists
        DataTypes.DatasetMetadata memory metadata = datasetRegistry.getDatasetMetadata(datasetId);
        require(metadata.creator != address(0), "RoyaltyDistributor: Dataset does not exist");
        
        emit RoyaltyReceived(datasetId, msg.sender, msg.value, block.timestamp);
        
        // Distribute royalties immediately
        _distributeRoyalties(datasetId, msg.value);
    }
    
    /**
     * @dev Internal function to distribute royalties
     * @param datasetId ID of the dataset
     * @param amount Total amount to distribute
     */
    function _distributeRoyalties(uint256 datasetId, uint256 amount) internal {
        // Calculate platform fee
        uint256 platformFee = RoyaltyUtils.calculatePlatformFee(amount, platformFeePercentage);
        uint256 distributionAmount = amount - platformFee;
        
        // Get dataset contributors
        DataTypes.Contributor[] memory contributors = datasetRegistry.getContributors(datasetId);
        require(contributors.length > 0, "RoyaltyDistributor: No contributors");
        
        // Calculate royalty shares
        (address[] memory recipients, uint256[] memory amounts) = RoyaltyUtils.calculateRoyaltyShares(
            contributors,
            distributionAmount
        );
        
        // Create distribution record
        _distributionIds.increment();
        uint256 distributionId = _distributionIds.current();
        
        DataTypes.RoyaltyDistribution memory distribution = RoyaltyUtils.createDistributionRecord(
            datasetId,
            distributionAmount,
            recipients,
            amounts
        );
        
        // Store distribution record
        _distributions[distributionId] = distribution;
        _datasetDistributions[datasetId].push(distributionId);
        
        // Update pending royalties for each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            _pendingRoyalties[recipients[i]] += amounts[i];
        }
        
        // Transfer platform fee
        if (platformFee > 0) {
            payable(platformFeeCollector).transfer(platformFee);
        }
        
        emit RoyaltyDistributed(distributionId, datasetId, distributionAmount, block.timestamp);
    }
    
    /**
     * @dev Claim pending royalties
     */
    function claimRoyalties() external nonReentrant {
        uint256 amount = _pendingRoyalties[msg.sender];
        require(amount > 0, "RoyaltyDistributor: No pending royalties");
        
        // Reset pending royalties
        _pendingRoyalties[msg.sender] = 0;
        
        // Transfer royalties
        payable(msg.sender).transfer(amount);
        
        emit RoyaltyClaimed(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Get pending royalties for a recipient
     * @param recipient Address of the recipient
     * @return Pending royalties amount
     */
    function getPendingRoyalties(address recipient) external view returns (uint256) {
        return _pendingRoyalties[recipient];
    }
    
    /**
     * @dev Get distribution record
     * @param distributionId ID of the distribution
     * @return Distribution record
     */
    function getDistribution(uint256 distributionId) external view returns (DataTypes.RoyaltyDistribution memory) {
        return _distributions[distributionId];
    }
    
    /**
     * @dev Get all distributions for a dataset
     * @param datasetId ID of the dataset
     * @return Array of distribution IDs
     */
    function getDatasetDistributions(uint256 datasetId) external view returns (uint256[] memory) {
        return _datasetDistributions[datasetId];
    }
    
    /**
     * @dev Get total royalties distributed for a dataset
     * @param datasetId ID of the dataset
     * @return Total amount distributed
     */
    function getTotalDistributed(uint256 datasetId) external view returns (uint256) {
        uint256[] memory distributionIds = _datasetDistributions[datasetId];
        uint256 totalDistributed = 0;
        
        for (uint256 i = 0; i < distributionIds.length; i++) {
            totalDistributed += _distributions[distributionIds[i]].totalAmount;
        }
        
        return totalDistributed;
    }
}