// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/DataTypes.sol";

/**
 * @title IDatasetRegistry
 * @dev Interface for the DatasetRegistry contract
 */
interface IDatasetRegistry {
    /**
     * @dev Emitted when a new dataset is registered
     */
    event DatasetRegistered(
        uint256 indexed tokenId,
        string cid,
        address indexed creator,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a dataset is verified
     */
    event DatasetVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a dataset is used
     */
    event DatasetUsed(
        uint256 indexed tokenId,
        address indexed user,
        string modelId,
        string usageType,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when a provenance record is added
     */
    event ProvenanceRecordAdded(
        uint256 indexed tokenId,
        string action,
        address indexed actor,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when metadata is updated
     */
    event MetadataUpdated(
        uint256 indexed tokenId,
        string metadataURI,
        uint256 timestamp
    );
    
    /**
     * @dev Registers a new dataset
     * @param cid Content ID of the dataset on Filecoin
     * @param dataType Type of data (text, image, audio, etc.)
     * @param source Original source of the data
     * @param license License information for the dataset
     * @param contributors Array of contributor addresses and their shares
     * @param metadataURI URI pointing to full metadata
     * @return tokenId of the newly registered dataset
     */
    function registerDataset(
        string memory cid,
        string memory dataType,
        string memory source,
        string memory license,
        DataTypes.Contributor[] memory contributors,
        string memory metadataURI
    ) external returns (uint256);
    
    /**
     * @dev Verifies a dataset after quality checks
     * @param tokenId ID of the dataset to verify
     */
    function verifyDataset(uint256 tokenId) external;
    
    /**
     * @dev Records usage of a dataset in an AI model
     * @param tokenId ID of the dataset used
     * @param modelId ID or identifier of the AI model
     * @param usageType Type of usage (training, validation, etc.)
     * @param details Additional details about the usage
     */
    function recordUsage(
        uint256 tokenId,
        string memory modelId,
        string memory usageType,
        string memory details
    ) external;
    
    /**
     * @dev Adds a provenance record to a dataset
     * @param tokenId ID of the dataset
     * @param action Action performed on the dataset
     * @param details Details about the action
     */
    function addProvenanceRecord(
        uint256 tokenId,
        string memory action,
        string memory details
    ) external;
    
    /**
     * @dev Updates dataset metadata URI
     * @param tokenId ID of the dataset
     * @param metadataURI New metadata URI
     */
    function updateMetadataURI(
        uint256 tokenId,
        string memory metadataURI
    ) external;
    
    /**
     * @dev Gets dataset metadata
     * @param tokenId ID of the dataset
     * @return Dataset metadata
     */
    function getDatasetMetadata(
        uint256 tokenId
    ) external view returns (DataTypes.DatasetMetadata memory);
    
    /**
     * @dev Gets dataset contributors
     * @param tokenId ID of the dataset
     * @return Array of contributors
     */
    function getContributors(
        uint256 tokenId
    ) external view returns (DataTypes.Contributor[] memory);
    
    /**
     * @dev Gets dataset provenance records
     * @param tokenId ID of the dataset
     * @return Array of provenance records
     */
    function getProvenanceRecords(
        uint256 tokenId
    ) external view returns (DataTypes.ProvenanceRecord[] memory);
    
    /**
     * @dev Gets dataset usage records
     * @param tokenId ID of the dataset
     * @return Array of usage records
     */
    function getUsageRecords(
        uint256 tokenId
    ) external view returns (DataTypes.UsageRecord[] memory);
    
    /**
     * @dev Gets token ID by CID
     * @param cid Content ID of the dataset
     * @return tokenId
     */
    function getTokenIdByCID(
        string memory cid
    ) external view returns (uint256);
    
    /**
     * @dev Checks if a CID is already registered
     * @param cid Content ID to check
     * @return True if registered, false otherwise
     */
    function isCIDRegistered(
        string memory cid
    ) external view returns (bool);
}