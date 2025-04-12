// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IDatasetRegistry.sol";
import "./interfaces/IAttributionManager.sol";
import "./interfaces/IMarketplace.sol";
import "./interfaces/IDataDAO.sol";
import "./interfaces/IFilecoinDeal.sol";

/**
 * @title DataProvChain
 * @dev Main contract that coordinates all components of the DataProvChain system
 */
contract DataProvChain is Ownable, Pausable, Initializable {
    // Contract references
    IDatasetRegistry public datasetRegistry;
    IAttributionManager public attributionManager;
    IMarketplace public marketplace;
    IDataDAO public dataDAO;
    IFilecoinDeal public filecoinDeal;
    
    // Fee collector address
    address public feeCollector;
    
    // Events
    event ContractAddressUpdated(string contractName, address contractAddress);
    event FeeCollectorUpdated(address feeCollector);
    
    /**
     * @dev Constructor for the DataProvChain contract
     */
    constructor() {
        feeCollector = msg.sender;
    }
    
    /**
     * @dev Initialize the contract with all component addresses
     */
    function initialize(
        address _datasetRegistry,
        address _attributionManager,
        address _marketplace,
        address _dataDAO,
        address _filecoinDeal,
        address _feeCollector
    ) 
        external 
        initializer 
        onlyOwner 
    {
        require(_datasetRegistry != address(0), "DataProvChain: Invalid dataset registry address");
        require(_attributionManager != address(0), "DataProvChain: Invalid attribution manager address");
        require(_marketplace != address(0), "DataProvChain: Invalid marketplace address");
        require(_dataDAO != address(0), "DataProvChain: Invalid DAO address");
        require(_filecoinDeal != address(0), "DataProvChain: Invalid Filecoin deal address");
        require(_feeCollector != address(0), "DataProvChain: Invalid fee collector address");
        
        datasetRegistry = IDatasetRegistry(_datasetRegistry);
        attributionManager = IAttributionManager(_attributionManager);
        marketplace = IMarketplace(_marketplace);
        dataDAO = IDataDAO(_dataDAO);
        filecoinDeal = IFilecoinDeal(_filecoinDeal);
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Update a contract address
     * @param contractName Name of the contract
     * @param contractAddress New contract address
     */
    function updateContractAddress(string memory contractName, address contractAddress) 
        external 
        onlyOwner 
    {
        require(contractAddress != address(0), "DataProvChain: Invalid contract address");
        
        bytes32 nameHash = keccak256(bytes(contractName));
        
        if (nameHash == keccak256(bytes("datasetRegistry"))) {
            datasetRegistry = IDatasetRegistry(contractAddress);
        } else if (nameHash == keccak256(bytes("attributionManager"))) {
            attributionManager = IAttributionManager(contractAddress);
        } else if (nameHash == keccak256(bytes("marketplace"))) {
            marketplace = IMarketplace(contractAddress);
        } else if (nameHash == keccak256(bytes("dataDAO"))) {
            dataDAO = IDataDAO(contractAddress);
        } else if (nameHash == keccak256(bytes("filecoinDeal"))) {
            filecoinDeal = IFilecoinDeal(contractAddress);
        } else {
            revert("DataProvChain: Invalid contract name");
        }
        
        emit ContractAddressUpdated(contractName, contractAddress);
    }
    
    /**
     * @dev Update the fee collector address
     * @param _feeCollector New fee collector address
     */
    function updateFeeCollector(address _feeCollector) 
        external 
        onlyOwner 
    {
        require(_feeCollector != address(0), "DataProvChain: Invalid fee collector address");
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(_feeCollector);
    }
    
    /**
     * @dev Register a dataset and create a storage deal
     * @param cid Content ID of the dataset
     * @param dataType Type of data (text, image, audio, etc.)
     * @param source Original source of the data
     * @param license License information for the dataset
     * @param contributors Array of contributor addresses and their shares
     * @param metadataURI URI pointing to full metadata
     * @param size Size of the data in bytes
     * @param startEpoch Epoch when the deal should start
     * @param endEpoch Epoch when the deal should end
     * @return datasetId and dealId
     */
    function registerDatasetWithStorageDeal(
        string memory cid,
        string memory dataType,
        string memory source,
        string memory license,
        DataTypes.Contributor[] memory contributors,
        string memory metadataURI,
        uint64 size,
        int64 startEpoch,
        int64 endEpoch
    ) 
        external 
        whenNotPaused 
        returns (uint256, bytes32) 
    {
        // Register dataset
        uint256 datasetId = datasetRegistry.registerDataset(
            cid,
            dataType,
            source,
            license,
            contributors,
            metadataURI
        );
        
        // Create storage deal
        bytes32 dealId = filecoinDeal.makeDealProposal(
            cid,
            size,
            false, // Not a verified deal
            startEpoch,
            endEpoch,
            0 // Price is 0 for simplicity
        );
        
        return (datasetId, dealId);
    }
    
    /**
     * @dev Create a marketplace listing for a dataset
     * @param datasetId ID of the dataset
     * @param price Price in tokens
     * @param licenseType Type of license
     * @param duration Duration of access in seconds
     * @return listingId
     */
    function createMarketplaceListing(
        uint256 datasetId,
        uint256 price,
        string memory licenseType,
        uint256 duration
    ) 
        external 
        whenNotPaused 
        returns (uint256) 
    {
        return marketplace.createListing(datasetId, price, licenseType, duration);
    }
    
    /**
     * @dev Record usage of a dataset in an AI model
     * @param datasetId ID of the dataset
     * @param modelId ID of the AI model
     * @param usageType How the dataset was used
     * @param impactScore Impact of the dataset on the model
     * @param details Additional details about the usage
     */
    function recordDatasetUsage(
        uint256 datasetId,
        uint256 modelId,
        string memory usageType,
        uint256 impactScore,
        string memory details
    ) 
        external 
        whenNotPaused 
    {
        // Record usage in the registry
        datasetRegistry.recordUsage(datasetId, string(abi.encodePacked(modelId)), usageType, details);
        
        // Record attribution
        attributionManager.recordAttribution(datasetId, modelId, usageType, impactScore);
    }
    
    /**
     * @dev Pause all contract operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause all contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}