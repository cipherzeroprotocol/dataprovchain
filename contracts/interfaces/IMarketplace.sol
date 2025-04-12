// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/DataTypes.sol";

/**
 * @title IMarketplace
 * @dev Interface for the Marketplace contract
 */
interface IMarketplace {
    /**
     * @dev Emitted when a new listing is created
     */
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed datasetId,
        address indexed seller,
        uint256 price,
        string licenseType,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a listing is updated
     */
    event ListingUpdated(
        uint256 indexed listingId,
        uint256 price,
        bool isActive,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a listing is purchased
     */
    event ListingPurchased(
        uint256 indexed listingId,
        uint256 indexed datasetId,
        address indexed buyer,
        uint256 price,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a listing is canceled
     */
    event ListingCanceled(
        uint256 indexed listingId,
        uint256 timestamp
    );
    
    /**
     * @dev Creates a new marketplace listing
     * @param datasetId ID of the dataset
     * @param price Price in tokens
     * @param licenseType Type of license
     * @param duration Duration of access in seconds
     * @return listingId of the new listing
     */
    function createListing(
        uint256 datasetId,
        uint256 price,
        string memory licenseType,
        uint256 duration
    ) external returns (uint256);
    
    /**
     * @dev Updates an existing listing
     * @param listingId ID of the listing
     * @param price New price
     * @param isActive Whether the listing is active
     */
    function updateListing(
        uint256 listingId,
        uint256 price,
        bool isActive
    ) external;
    
    /**
     * @dev Purchases access to a dataset
     * @param listingId ID of the listing
     */
    function purchaseListing(uint256 listingId) external payable;
    
    /**
     * @dev Cancels a listing
     * @param listingId ID of the listing
     */
    function cancelListing(uint256 listingId) external;
    
    /**
     * @dev Gets listing information
     * @param listingId ID of the listing
     * @return Listing information
     */
    function getListing(
        uint256 listingId
    ) external view returns (DataTypes.Listing memory);
    
    /**
     * @dev Gets all listings for a dataset
     * @param datasetId ID of the dataset
     * @return Array of listing IDs
     */
    function getListingsByDataset(
        uint256 datasetId
    ) external view returns (uint256[] memory);
    
    /**
     * @dev Gets active listings for a seller
     * @param seller Address of the seller
     * @return Array of listing IDs
     */
    function getListingsBySeller(
        address seller
    ) external view returns (uint256[] memory);
    
    /**
     * @dev Gets purchases for a buyer
     * @param buyer Address of the buyer
     * @return Array of purchase records
     */
    function getPurchasesByBuyer(
        address buyer
    ) external view returns (DataTypes.Purchase[] memory);
    
    /**
     * @dev Checks if a buyer has access to a dataset
     * @param buyer Address of the buyer
     * @param datasetId ID of the dataset
     * @return True if the buyer has access, false otherwise
     */
    function hasAccess(
        address buyer,
        uint256 datasetId
    ) external view returns (bool);
}