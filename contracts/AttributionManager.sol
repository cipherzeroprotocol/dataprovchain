// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IAttributionManager.sol";
import "./interfaces/IDatasetRegistry.sol";
import "./libraries/DataTypes.sol";

/**
 * @title AttributionManager
 * @dev Contract for managing attribution and royalty distribution for datasets
 */
contract AttributionManager is IAttributionManager, Ownable, ReentrancyGuard {
    // DatasetRegistry contract reference
    IDatasetRegistry public datasetRegistry;
    
    // Mapping from dataset ID to attribution records
    mapping(uint256 => DataTypes.Attribution[]) private _attributions;
    
    // Mapping from dataset ID to royalty distribution records
    mapping(uint256 => DataTypes.RoyaltyDistribution[]) private _royaltyDistributions;
    
    // Mapping from dataset ID to pending royalties amount
    mapping(uint256 => uint256) private _pendingRoyalties;
    
    // Mapping from dataset ID to total impact score
    mapping(uint256 => uint256) private _totalImpactScores;
    
    // Fee percentage for the platform (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeePercentage = 250;
    
    // Platform fee collector address
    address public platformFeeCollector;
    
    /**
     * @dev Constructor for the AttributionManager contract
     * @param _datasetRegistry Address of the DatasetRegistry contract
     * @param _platformFeeCollector Address that collects platform fees
     */
    constructor(address _datasetRegistry, address _platformFeeCollector) {
        require(_datasetRegistry != address(0), "AttributionManager: Invalid dataset registry address");
        require(_platformFeeCollector != address(0), "AttributionManager: Invalid fee collector address");
        
        datasetRegistry = IDatasetRegistry(_datasetRegistry);
        platformFeeCollector = _platformFeeCollector;
    }
    
    /**
     * @dev Set the platform fee percentage
     * @param _feePercentage Fee percentage in basis points (e.g., 250 = 2.5%)
     */
    function setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "AttributionManager: Fee percentage too high"); // Max 10%
        platformFeePercentage = _feePercentage;
    }
    
    /**
     * @dev Set the platform fee collector address
     * @param _platformFeeCollector Address that collects platform fees
     */
    function setPlatformFeeCollector(address _platformFeeCollector) external onlyOwner {
        require(_platformFeeCollector != address(0), "AttributionManager: Invalid fee collector address");
        platformFeeCollector = _platformFeeCollector;
    }
    
    /**
     * @dev See {IAttributionManager-recordAttribution}
     */
    function recordAttribution(
        uint256 datasetId,
        uint256 modelId,
        string memory usageType,
        uint256 impactScore
    ) 
        external 
        override 
        nonReentrant 
    {
        // Ensure the dataset exists
        DataTypes.DatasetMetadata memory metadata = datasetRegistry.getDatasetMetadata(datasetId);
        require(metadata.creator != address(0), "AttributionManager: Dataset does not exist");
        
        // Create attribution record
        DataTypes.Attribution memory attribution = DataTypes.Attribution({
            datasetId: datasetId,
            modelId: modelId,
            usageType: usageType,
            impactScore: impactScore,
            timestamp: block.timestamp
        });
        
        // Store attribution record
        _attributions[datasetId].push(attribution);
        
        // Update total impact score
        _totalImpactScores[datasetId] += impactScore;
        
        emit AttributionRecorded(datasetId, modelId, usageType, impactScore, block.timestamp);
    }
    
    /**
     * @dev See {IAttributionManager-payRoyalties}
     */
    function payRoyalties(uint256 datasetId) 
        external 
        payable 
        override 
        nonReentrant 
    {
        require(msg.value > 0, "AttributionManager: Payment amount must be positive");
        
        // Ensure the dataset exists
        DataTypes.DatasetMetadata memory metadata = datasetRegistry.getDatasetMetadata(datasetId);
        require(metadata.creator != address(0), "AttributionManager: Dataset does not exist");
        
        // Add to pending royalties
        _pendingRoyalties[datasetId] += msg.value;
        
        emit RoyaltyPaymentReceived(datasetId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev See {IAttributionManager-distributeRoyalties}
     */
    function distributeRoyalties(uint256 datasetId) 
        external 
        override 
        nonReentrant
        payable
    {
        // Get the pending royalties amount
        uint256 pendingAmount = _pendingRoyalties[datasetId];
        require(pendingAmount > 0, "AttributionManager: No pending royalties");
        
        // Get dataset contributors
        DataTypes.Contributor[] memory contributors = datasetRegistry.getContributors(datasetId);
        require(contributors.length > 0, "AttributionManager: No contributors");
        
        // Calculate platform fee
        uint256 platformFee = (pendingAmount * platformFeePercentage) / 10000;
        uint256 distributionAmount = pendingAmount - platformFee;
        
        // Arrays for distribution record
        address[] memory recipients = new address[](contributors.length);
        uint256[] memory amounts = new uint256[](contributors.length);
        
        // Calculate and transfer amounts to contributors
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < contributors.length; i++) {
            uint256 amount = (distributionAmount * contributors[i].share) / 100;
            
            // Transfer to contributor
            payable(contributors[i].wallet).transfer(amount);
            
            // Record distribution
            recipients[i] = contributors[i].wallet;
            amounts[i] = amount;
            
            totalDistributed += amount;
        }
        
        // Transfer platform fee
        if (platformFee > 0) {
            payable(platformFeeCollector).transfer(platformFee);
        }
        
        // Transfer any dust amount (rounding errors) to the dataset creator
        uint256 dust = distributionAmount - totalDistributed;
        if (dust > 0) {
            payable(datasetRegistry.getDatasetMetadata(datasetId).creator).transfer(dust);
        }
        
        // Reset pending royalties
        _pendingRoyalties[datasetId] = 0;
        
        // Record royalty distribution
        DataTypes.RoyaltyDistribution memory distribution = DataTypes.RoyaltyDistribution({
            datasetId: datasetId,
            totalAmount: distributionAmount,
            recipients: recipients,
            amounts: amounts,
            distributionTime: block.timestamp
        });
        
        _royaltyDistributions[datasetId].push(distribution);
        
        emit RoyaltiesDistributed(datasetId, distributionAmount, block.timestamp);
    }
    
    /**
     * @dev See {IAttributionManager-calculateAttributionShares}
     */
    function calculateAttributionShares(uint256 datasetId) 
        external 
        view 
        override 
        returns (address[] memory, uint256[] memory) 
    {
        // Get contributors
        DataTypes.Contributor[] memory contributors = datasetRegistry.getContributors(datasetId);
        
        // Create arrays for return values
        address[] memory addresses = new address[](contributors.length);
        uint256[] memory shares = new uint256[](contributors.length);
        
        // If there are no attributions, use the contributor shares directly
        if (_attributions[datasetId].length == 0 || _totalImpactScores[datasetId] == 0) {
            for (uint256 i = 0; i < contributors.length; i++) {
                addresses[i] = contributors[i].wallet;
                shares[i] = contributors[i].share;
            }
            
            return (addresses, shares);
        }
        
        // Calculate shares based on impact scores
        // This is a simplified implementation that just uses the contributor shares
        // A more advanced implementation would consider the impact scores of different models
        for (uint256 i = 0; i < contributors.length; i++) {
            addresses[i] = contributors[i].wallet;
            shares[i] = contributors[i].share;
        }
        
        return (addresses, shares);
    }
    
    /**
     * @dev See {IAttributionManager-getAttributionHistory}
     */
    function getAttributionHistory(uint256 datasetId) 
        external 
        view 
        override 
        returns (DataTypes.Attribution[] memory) 
    {
        return _attributions[datasetId];
    }
    
    /**
     * @dev See {IAttributionManager-getPendingRoyalties}
     */
    function getPendingRoyalties(uint256 datasetId) 
        external 
        view 
        override 
        returns (uint256) 
    {
        return _pendingRoyalties[datasetId];
    }
    
    /**
     * @dev See {IAttributionManager-getRoyaltyDistributionHistory}
     */
    function getRoyaltyDistributionHistory(uint256 datasetId) 
        external 
        view 
        override 
        returns (DataTypes.RoyaltyDistribution[] memory) 
    {
        return _royaltyDistributions[datasetId];
    }
}