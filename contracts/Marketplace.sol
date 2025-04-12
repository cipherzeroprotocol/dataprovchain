// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IMarketplace.sol";
import "./interfaces/IDatasetRegistry.sol";
import "./interfaces/IAttributionManager.sol";
import "./libraries/DataTypes.sol";

/**
 * @title Marketplace
 * @dev Contract for buying and selling dataset access rights
 */
contract Marketplace is IMarketplace, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Counter for listing IDs
    Counters.Counter private _listingIds;
    
    // DatasetRegistry contract reference
    IDatasetRegistry public datasetRegistry;
    
    // AttributionManager contract reference
    IAttributionManager public attributionManager;
    
    // Mapping from listing ID to listing
    mapping(uint256 => DataTypes.Listing) private _listings;
    
    // Mapping from dataset ID to listing IDs
    mapping(uint256 => uint256[]) private _datasetListings;
    
    // Mapping from seller address to listing IDs
    mapping(address => uint256[]) private _sellerListings;
    
    // Mapping from listing ID to purchase
    mapping(uint256 => DataTypes.Purchase[]) private _purchases;
    
    // Mapping from buyer address to purchased listing IDs
    mapping(address => uint256[]) private _buyerPurchases;
    
    // Mapping from dataset ID to buyers who have access
    mapping(uint256 => mapping(address => bool)) private _datasetAccess;
    
    // Fee percentage for the platform (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeePercentage = 250;
    
    // Platform fee collector address
    address public platformFeeCollector;
    
    /**
     * @dev Constructor for the Marketplace contract
     * @param _datasetRegistry Address of the DatasetRegistry contract
     * @param _attributionManager Address of the AttributionManager contract
     * @param _platformFeeCollector Address that collects platform fees
     */
    constructor(
        address _datasetRegistry, 
        address _attributionManager, 
        address _platformFeeCollector
    ) {
        require(_datasetRegistry != address(0), "Marketplace: Invalid dataset registry address");
        require(_attributionManager != address(0), "Marketplace: Invalid attribution manager address");
        require(_platformFeeCollector != address(0), "Marketplace: Invalid fee collector address");
        
        datasetRegistry = IDatasetRegistry(_datasetRegistry);
        attributionManager = IAttributionManager(_attributionManager);
        platformFeeCollector = _platformFeeCollector;
    }
    
    /**
     * @dev Set the platform fee percentage
     * @param _feePercentage Fee percentage in basis points (e.g., 250 = 2.5%)
     */
    function setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Marketplace: Fee percentage too high"); // Max 10%
        platformFeePercentage = _feePercentage;
    }
    
    /**
     * @dev Set the platform fee collector address
     * @param _platformFeeCollector Address that collects platform fees
     */
    function setPlatformFeeCollector(address _platformFeeCollector) external onlyOwner {
        require(_platformFeeCollector != address(0), "Marketplace: Invalid fee collector address");
        platformFeeCollector = _platformFeeCollector;
    }
    
    /**
     * @dev See {IMarketplace-createListing}
     */
    function createListing(
        uint256 datasetId,
        uint256 price,
        string memory licenseType,
        uint256 duration
    ) 
        external 
        override 
        nonReentrant 
        returns (uint256) 
    {
        // Ensure the dataset exists
        DataTypes.DatasetMetadata memory metadata = datasetRegistry.getDatasetMetadata(datasetId);
        require(metadata.creator != address(0), "Marketplace: Dataset does not exist");
        
        // Ensure the seller is the dataset owner
        require(
            datasetRegistry.ownerOf(datasetId) == msg.sender,
            "Marketplace: Not the dataset owner"
        );
        
        // Create listing
        _listingIds.increment();
        uint256 listingId = _listingIds.current();
        
        DataTypes.Listing memory listing = DataTypes.Listing({
            datasetId: datasetId,
            seller: msg.sender,
            price: price,
            currency: "ETH", // Default to ETH for now
            licenseType: licenseType,
            duration: duration,
            creationTime: block.timestamp,
            isActive: true
        });
        
        // Store listing
        _listings[listingId] = listing;
        _datasetListings[datasetId].push(listingId);
        _sellerListings[msg.sender].push(listingId);
        
        emit ListingCreated(
            listingId,
            datasetId,
            msg.sender,
            price,
            licenseType,
            block.timestamp
        );
        
        return listingId;
    }
    
    /**
     * @dev See {IMarketplace-updateListing}
     */
    function updateListing(
        uint256 listingId,
        uint256 price,
        bool isActive
    ) 
        external 
        override 
        nonReentrant 
    {
        // Ensure the listing exists
        require(_listings[listingId].seller != address(0), "Marketplace: Listing does not exist");
        
        // Ensure the caller is the seller
        require(_listings[listingId].seller == msg.sender, "Marketplace: Not the seller");
        
        // Update listing
        _listings[listingId].price = price;
        _listings[listingId].isActive = isActive;
        
        emit ListingUpdated(listingId, price, isActive, block.timestamp);
    }
    
    /**
     * @dev See {IMarketplace-purchaseListing}
     */
    function purchaseListing(uint256 listingId) 
        external 
        payable 
        override 
        nonReentrant 
    {
        // Ensure the listing exists and is active
        DataTypes.Listing memory listing = _listings[listingId];
        require(listing.seller != address(0), "Marketplace: Listing does not exist");
        require(listing.isActive, "Marketplace: Listing is not active");
        
        // Ensure the payment matches the price
        require(msg.value >= listing.price, "Marketplace: Insufficient payment");
        
        // Calculate platform fee
        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 sellerAmount = msg.value - platformFee;
        
        // Transfer to platform fee collector
        if (platformFee > 0) {
            payable(platformFeeCollector).transfer(platformFee);
        }
        
        // Pay royalties to dataset contributors
        payable(address(attributionManager)).transfer(sellerAmount);
        attributionManager.payRoyalties{value: 0}(listing.datasetId); // Value already transferred
        
        // Create purchase record
        DataTypes.Purchase memory purchase = DataTypes.Purchase({
            listingId: listingId,
            buyer: msg.sender,
            price: msg.value,
            purchaseTime: block.timestamp,
            expirationTime: block.timestamp + listing.duration
        });
        
        // Store purchase
        _purchases[listingId].push(purchase);
        _buyerPurchases[msg.sender].push(listingId);
        _datasetAccess[listing.datasetId][msg.sender] = true;
        
        emit ListingPurchased(listingId, listing.datasetId, msg.sender, msg.value, block.timestamp);
        
        // Record attribution for this usage
        attributionManager.recordAttribution(
            listing.datasetId,
            0, // No specific model ID for marketplace purchase
            "MARKETPLACE_PURCHASE",
            100 // Base impact score
        );
    }
    
    /**
     * @dev See {IMarketplace-cancelListing}
     */
    function cancelListing(uint256 listingId) 
        external 
        override 
        nonReentrant 
    {
        // Ensure the listing exists
        require(_listings[listingId].seller != address(0), "Marketplace: Listing does not exist");
        
        // Ensure the caller is the seller
        require(_listings[listingId].seller == msg.sender, "Marketplace: Not the seller");
        
        // Cancel listing
        _listings[listingId].isActive = false;
        
        emit ListingCanceled(listingId, block.timestamp);
    }
    
    /**
     * @dev See {IMarketplace-getListing}
     */
    function getListing(uint256 listingId) 
        external 
        view 
        override 
        returns (DataTypes.Listing memory) 
    {
        return _listings[listingId];
    }
    
    /**
     * @dev See {IMarketplace-getListingsByDataset}
     */
    function getListingsByDataset(uint256 datasetId) 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        return _datasetListings[datasetId];
    }
    
    /**
     * @dev See {IMarketplace-getListingsBySeller}
     */
    function getListingsBySeller(address seller) 
        external 
        view 
        override 
        returns (uint256[] memory) 
    {
        return _sellerListings[seller];
    }
    
    /**
     * @dev See {IMarketplace-getPurchasesByBuyer}
     */
    function getPurchasesByBuyer(address buyer) 
        external 
        view 
        override 
        returns (DataTypes.Purchase[] memory) 
    {
        uint256[] memory listingIds = _buyerPurchases[buyer];
        uint256 totalPurchases = 0;
        
        // Count total purchases for the buyer
        for (uint256 i = 0; i < listingIds.length; i++) {
            DataTypes.Purchase[] memory purchases = _purchases[listingIds[i]];
            for (uint256 j = 0; j < purchases.length; j++) {
                if (purchases[j].buyer == buyer) {
                    totalPurchases++;
                }
            }
        }
        
        // Create result array
        DataTypes.Purchase[] memory result = new DataTypes.Purchase[](totalPurchases);
        uint256 index = 0;
        
        // Fill result array
        for (uint256 i = 0; i < listingIds.length; i++) {
            DataTypes.Purchase[] memory purchases = _purchases[listingIds[i]];
            for (uint256 j = 0; j < purchases.length; j++) {
                if (purchases[j].buyer == buyer) {
                    result[index] = purchases[j];
                    index++;
                }
            }
        }
        
        return result;
    }
    
    /**
     * @dev See {IMarketplace-hasAccess}
     */
    function hasAccess(address buyer, uint256 datasetId) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _datasetAccess[datasetId][buyer];
    }
}