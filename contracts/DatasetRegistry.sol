// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IDatasetRegistry.sol";
import "./libraries/DataTypes.sol";
import "./libraries/ProvenanceUtils.sol";
import "./libraries/SecurityUtils.sol";

/**
 * @title DatasetRegistry
 * @dev Contract for registering and managing AI training datasets with provenance tracking
 */
contract DatasetRegistry is 
    IDatasetRegistry, 
    ERC721URIStorage, 
    AccessControl, 
    ReentrancyGuard 
{
    using Counters for Counters.Counter;
    using ProvenanceUtils for DataTypes.ProvenanceRecord;
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    Counters.Counter private _tokenIds;
    
    // Mapping from token ID to dataset metadata
    mapping(uint256 => DataTypes.DatasetMetadata) private _datasets;
    
    // Mapping from CID to token ID
    mapping(string => uint256) private _cidToTokenId;
    
    // Mapping from token ID to provenance records
    mapping(uint256 => DataTypes.ProvenanceRecord[]) private _provenanceRecords;
    
    // Mapping from token ID to contributors
    mapping(uint256 => DataTypes.Contributor[]) private _contributors;
    
    // Mapping from token ID to usage records
    mapping(uint256 => DataTypes.UsageRecord[]) private _usageRecords;
    
    /**
     * @dev Constructor for the DatasetRegistry contract
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     */
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev See {IDatasetRegistry-registerDataset}
     */
    function registerDataset(
        string memory cid,
        string memory dataType,
        string memory source,
        string memory license,
        DataTypes.Contributor[] memory contributors,
        string memory metadataURI
    ) 
        external 
        override 
        nonReentrant 
        returns (uint256) 
    {
        require(bytes(cid).length > 0, "DatasetRegistry: CID cannot be empty");
        require(_cidToTokenId[cid] == 0, "DatasetRegistry: Dataset already registered");
        
        // Validate inputs
        require(SecurityUtils.isValidString(dataType), "DatasetRegistry: Invalid data type");
        
        // Increment token ID counter
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Create dataset metadata
        DataTypes.DatasetMetadata memory metadata = DataTypes.DatasetMetadata({
            cid: cid,
            dataType: dataType,
            creator: msg.sender,
            creationTime: block.timestamp,
            source: source,
            license: license,
            isVerified: false,
            verificationTime: 0,
            verifier: address(0)
        });
        
        // Store dataset metadata
        _datasets[newTokenId] = metadata;
        _cidToTokenId[cid] = newTokenId;
        
        // Store contributors
        for (uint256 i = 0; i < contributors.length; i++) {
            require(SecurityUtils.isValidAddress(contributors[i].wallet), "DatasetRegistry: Invalid contributor address");
            require(SecurityUtils.isValidPercentage(contributors[i].share), "DatasetRegistry: Invalid contributor share");
            _contributors[newTokenId].push(contributors[i]);
        }
        
        // Add initial provenance record
        DataTypes.ProvenanceRecord memory record = ProvenanceUtils.createRecord(
            "CREATED",
            msg.sender,
            "Initial dataset registration"
        );
        _provenanceRecords[newTokenId].push(record);
        
        // Mint the NFT
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        emit DatasetRegistered(newTokenId, cid, msg.sender, block.timestamp);
        
        return newTokenId;
    }
    
    /**
     * @dev See {IDatasetRegistry-verifyDataset}
     */
    function verifyDataset(uint256 tokenId) 
        external 
        override 
        onlyRole(VERIFIER_ROLE) 
    {
        require(_exists(tokenId), "DatasetRegistry: Dataset does not exist");
        require(!_datasets[tokenId].isVerified, "DatasetRegistry: Dataset already verified");
        
        // Update verification status
        _datasets[tokenId].isVerified = true;
        _datasets[tokenId].verificationTime = block.timestamp;
        _datasets[tokenId].verifier = msg.sender;
        
        // Add provenance record
        DataTypes.ProvenanceRecord memory record = ProvenanceUtils.createRecord(
            "VERIFIED",
            msg.sender,
            "Dataset verification completed"
        );
        _provenanceRecords[tokenId].push(record);
        
        emit DatasetVerified(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev See {IDatasetRegistry-recordUsage}
     */
    function recordUsage(
        uint256 tokenId,
        string memory modelId,
        string memory usageType,
        string memory details
    ) 
        external 
        override 
        nonReentrant 
    {
        require(_exists(tokenId), "DatasetRegistry: Dataset does not exist");
        
        // Create usage record
        DataTypes.UsageRecord memory record = DataTypes.UsageRecord({
            user: msg.sender,
            modelId: modelId,
            usageType: usageType,
            timestamp: block.timestamp,
            details: details
        });
        
        // Store usage record
        _usageRecords[tokenId].push(record);
        
        // Add provenance record
        DataTypes.ProvenanceRecord memory provenanceRecord = ProvenanceUtils.createRecord(
            "USED",
            msg.sender,
            string(abi.encodePacked("Used in model: ", modelId))
        );
        _provenanceRecords[tokenId].push(provenanceRecord);
        
        emit DatasetUsed(tokenId, msg.sender, modelId, usageType, block.timestamp);
    }
    
    /**
     * @dev See {IDatasetRegistry-addProvenanceRecord}
     */
    function addProvenanceRecord(
        uint256 tokenId,
        string memory action,
        string memory details
    ) 
        external 
        override 
    {
        require(_exists(tokenId), "DatasetRegistry: Dataset does not exist");
        require(
            ownerOf(tokenId) == msg.sender || hasRole(VERIFIER_ROLE, msg.sender),
            "DatasetRegistry: Not authorized"
        );
        
        // Create provenance record
        DataTypes.ProvenanceRecord memory record = ProvenanceUtils.createRecord(
            action,
            msg.sender,
            details
        );
        
        // Validate record
        require(ProvenanceUtils.validateRecord(record), "DatasetRegistry: Invalid provenance record");
        
        // Store provenance record
        _provenanceRecords[tokenId].push(record);
        
        emit ProvenanceRecordAdded(tokenId, action, msg.sender, block.timestamp);
    }
    
    /**
     * @dev See {IDatasetRegistry-updateMetadataURI}
     */
    function updateMetadataURI(uint256 tokenId, string memory metadataURI) 
        external 
        override 
    {
        require(_exists(tokenId), "DatasetRegistry: Dataset does not exist");
        require(ownerOf(tokenId) == msg.sender, "DatasetRegistry: Not the owner");
        
        _setTokenURI(tokenId, metadataURI);
        
        // Add provenance record
        DataTypes.ProvenanceRecord memory record = ProvenanceUtils.createRecord(
            "METADATA_UPDATED",
            msg.sender,
            "Metadata URI updated"
        );
        _provenanceRecords[tokenId].push(record);
        
        emit MetadataUpdated(tokenId, metadataURI, block.timestamp);
    }
    
    /**
     * @dev See {IDatasetRegistry-getDatasetMetadata}
     */
    function getDatasetMetadata(uint256 tokenId) 
        external 
        view 
        override 
        returns (DataTypes.DatasetMetadata memory) 
    {
        require(_exists(tokenId), "DatasetRegistry: Dataset does not exist");
        return _datasets[tokenId];
    }
    
    /**
     * @dev See {IDatasetRegistry-getContributors}
     */
    function getContributors(uint256 tokenId) 
        external 
        view 
        override 
        returns (DataTypes.Contributor[] memory) 
    {
        require(_exists(tokenId), "DatasetRegistry: Dataset does not exist");
        return _contributors[tokenId];
    }
    
    /**
     * @dev See {IDatasetRegistry-getProvenanceRecords}
     */
    function getProvenanceRecords(uint256 tokenId) 
        external 
        view 
        override 
        returns (DataTypes.ProvenanceRecord[] memory) 
    {
        require(_exists(tokenId), "DatasetRegistry: Dataset does not exist");
        return _provenanceRecords[tokenId];
    }
    
    /**
     * @dev See {IDatasetRegistry-getUsageRecords}
     */
    function getUsageRecords(uint256 tokenId) 
        external 
        view 
        override 
        returns (DataTypes.UsageRecord[] memory) 
    {
        require(_exists(tokenId), "DatasetRegistry: Dataset does not exist");
        return _usageRecords[tokenId];
    }
    
    /**
     * @dev See {IDatasetRegistry-getTokenIdByCID}
     */
    function getTokenIdByCID(string memory cid) 
        external 
        view 
        override 
        returns (uint256) 
    {
        uint256 tokenId = _cidToTokenId[cid];
        require(tokenId != 0, "DatasetRegistry: Dataset not found");
        return tokenId;
    }
    
    /**
     * @dev See {IDatasetRegistry-isCIDRegistered}
     */
    function isCIDRegistered(string memory cid) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _cidToTokenId[cid] != 0;
    }
    
    /**
     * @dev Required override for ERC721, ERC721URIStorage and AccessControl compatibility
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}