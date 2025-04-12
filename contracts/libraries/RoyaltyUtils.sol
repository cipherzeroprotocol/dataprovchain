// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DataTypes.sol";

/**
 * @title RoyaltyUtils
 * @dev Library providing utility functions for royalty calculations and distribution
 */
library RoyaltyUtils {
    /**
     * @dev Calculates royalty shares for contributors based on their percentage shares
     * @param contributors Array of contributors
     * @param totalAmount Total amount to distribute
     * @return recipients Array of recipient addresses
     * @return amounts Array of amounts to distribute
     */
    function calculateRoyaltyShares(
        DataTypes.Contributor[] memory contributors,
        uint256 totalAmount
    ) internal pure returns (address[] memory, uint256[] memory) {
        address[] memory recipients = new address[](contributors.length);
        uint256[] memory amounts = new uint256[](contributors.length);
        
        uint256 totalDistributed = 0;
        
        for (uint256 i = 0; i < contributors.length; i++) {
            // Calculate share amount
            uint256 amount = (totalAmount * contributors[i].share) / 100;
            
            recipients[i] = contributors[i].wallet;
            amounts[i] = amount;
            
            totalDistributed += amount;
        }
        
        // Handle any dust amount (from rounding errors)
        if (totalDistributed < totalAmount && contributors.length > 0) {
            amounts[0] += (totalAmount - totalDistributed);
        }
        
        return (recipients, amounts);
    }
    
    /**
     * @dev Calculates royalty shares based on impact scores
     * @param attributions Array of attributions
     * @param totalAmount Total amount to distribute
     * @return recipients Array of recipient addresses
     * @return amounts Array of amounts to distribute
     */
    function calculateRoyaltyByImpact(
        DataTypes.Attribution[] memory attributions,
        uint256 totalAmount
    ) internal pure returns (address[] memory, uint256[] memory) {
        // First, calculate total impact score
        uint256 totalImpact = 0;
        for (uint256 i = 0; i < attributions.length; i++) {
            totalImpact += attributions[i].impactScore;
        }
        
        if (totalImpact == 0) {
            // Return empty arrays if no impact scores
            address[] memory emptyAddresses = new address[](0);
            uint256[] memory emptyAmounts = new uint256[](0);
            return (emptyAddresses, emptyAmounts);
        }
        
        // Create mapping from datasetId to impact score
        mapping(uint256 => uint256) memory datasetImpacts;
        uint256[] memory uniqueDatasetIds = new uint256[](attributions.length);
        uint256 uniqueCount = 0;
        
        // Identify unique datasets and sum their impact scores
        for (uint256 i = 0; i < attributions.length; i++) {
            uint256 datasetId = attributions[i].datasetId;
            
            if (datasetImpacts[datasetId] == 0) {
                uniqueDatasetIds[uniqueCount] = datasetId;
                uniqueCount++;
            }
            
            datasetImpacts[datasetId] += attributions[i].impactScore;
        }
        
        // Create result arrays
        address[] memory recipients = new address[](uniqueCount);
        uint256[] memory amounts = new uint256[](uniqueCount);
        
        // Calculate amounts based on impact scores
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < uniqueCount; i++) {
            uint256 datasetId = uniqueDatasetIds[i];
            uint256 impact = datasetImpacts[datasetId];
            
            // Calculate share amount
            uint256 amount = (totalAmount * impact) / totalImpact;
            
            // For simplicity, use datasetId as a placeholder for recipient address
            // In a real implementation, you'd map datasetId to the appropriate recipient
            recipients[i] = address(uint160(datasetId));
            amounts[i] = amount;
            
            totalDistributed += amount;
        }
        
        // Handle any dust amount
        if (totalDistributed < totalAmount && uniqueCount > 0) {
            amounts[0] += (totalAmount - totalDistributed);
        }
        
        return (recipients, amounts);
    }
    
    /**
     * @dev Validates that contributor shares add up to 100%
     * @param contributors Array of contributors
     * @return True if valid, false otherwise
     */
    function validateContributorShares(
        DataTypes.Contributor[] memory contributors
    ) internal pure returns (bool) {
        uint256 totalShares = 0;
        
        for (uint256 i = 0; i < contributors.length; i++) {
            totalShares += contributors[i].share;
        }
        
        return totalShares == 100;
    }
    
    /**
     * @dev Creates a royalty distribution record
     * @param datasetId ID of the dataset
     * @param totalAmount Total amount distributed
     * @param recipients Recipients of the distribution
     * @param amounts Amounts distributed to each recipient
     * @return RoyaltyDistribution record
     */
    function createDistributionRecord(
        uint256 datasetId,
        uint256 totalAmount,
        address[] memory recipients,
        uint256[] memory amounts
    ) internal view returns (DataTypes.RoyaltyDistribution memory) {
        return DataTypes.RoyaltyDistribution({
            datasetId: datasetId,
            totalAmount: totalAmount,
            recipients: recipients,
            amounts: amounts,
            distributionTime: block.timestamp
        });
    }
    
    /**
     * @dev Calculates the platform fee
     * @param amount Total amount
     * @param feePercentage Fee percentage in basis points (e.g., 250 = 2.5%)
     * @return Platform fee amount
     */
    function calculatePlatformFee(
        uint256 amount,
        uint256 feePercentage
    ) internal pure returns (uint256) {
        return (amount * feePercentage) / 10000;
    }
}