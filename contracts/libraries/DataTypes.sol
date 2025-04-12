// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title DataTypes
 * @dev Library defining data structures used in the DataProvChain system
 */
library DataTypes {
    /**
     * @dev Structure for dataset metadata
     */
    struct DatasetMetadata {
        string cid;                  // Content ID on Filecoin
        string dataType;             // Type of data (text, image, audio, etc.)
        address creator;             // Original creator/registrant
        uint256 creationTime;        // When dataset was registered
        string source;               // Original source of the data
        string license;              // License information
        bool isVerified;             // Verification status
        uint256 verificationTime;    // When dataset was verified
        address verifier;            // Address that verified the dataset
    }
    
    /**
     * @dev Structure for dataset contributors
     */
    struct Contributor {
        address wallet;              // Contributor wallet address
        string name;                 // Optional name or identifier
        uint8 share;                 // Attribution share (percentage)
    }
    
    /**
     * @dev Structure for provenance records
     */
    struct ProvenanceRecord {
        string action;               // Action performed (CREATED, MODIFIED, etc.)
        address actor;               // Address that performed the action
        uint256 timestamp;           // When the action was performed
        string details;              // Additional details about the action
    }
    
    /**
     * @dev Structure for usage records
     */
    struct UsageRecord {
        address user;                // User who used the dataset
        string modelId;              // Identifier of the AI model
        string usageType;            // Type of usage (training, validation, etc.)
        uint256 timestamp;           // When the dataset was used
        string details;              // Additional details about the usage
    }
    
    /**
     * @dev Structure for marketplace listings
     */
    struct Listing {
        uint256 datasetId;           // ID of the dataset
        address seller;              // Seller address
        uint256 price;               // Price in tokens
        string currency;             // Currency or token type
        string licenseType;          // Type of license (research, commercial, etc.)
        uint256 duration;            // Duration of access in seconds
        uint256 creationTime;        // When the listing was created
        bool isActive;               // Whether the listing is active
    }
    
    /**
     * @dev Structure for purchase records
     */
    struct Purchase {
        uint256 listingId;           // ID of the listing
        address buyer;               // Buyer address
        uint256 price;               // Price paid
        uint256 purchaseTime;        // When the purchase was made
        uint256 expirationTime;      // When the access expires
    }
    
    /**
     * @dev Structure for attribution records
     */
    struct Attribution {
        uint256 datasetId;           // ID of the dataset
        uint256 modelId;             // ID of the AI model
        string usageType;            // How the dataset was used
        uint256 impactScore;         // Impact of the dataset on the model
        uint256 timestamp;           // When the attribution was recorded
    }
    
    /**
     * @dev Structure for royalty distributions
     */
    struct RoyaltyDistribution {
        uint256 datasetId;           // ID of the dataset
        uint256 totalAmount;         // Total amount distributed
        address[] recipients;        // Recipients of the distribution
        uint256[] amounts;           // Amounts distributed to each recipient
        uint256 distributionTime;    // When the distribution was made
    }
    
    /**
     * @dev Structure for storage deals on Filecoin
     */
    struct StorageDeal {
        uint256 datasetId;           // ID of the dataset
        string dealCid;              // Deal CID on Filecoin
        uint64 dealId;               // Deal ID on Filecoin
        string provider;             // Storage provider ID
        uint256 startTime;           // When the deal starts
        uint256 endTime;             // When the deal ends
        uint256 size;                // Size of the data in bytes
        bool isActive;               // Whether the deal is active
    }
    
    /**
     * @dev Structure for verification records
     */
    struct VerificationRecord {
        uint256 datasetId;           // ID of the dataset
        address verifier;            // Address that performed the verification
        string method;               // Verification method used
        string result;               // Result of the verification
        uint256 timestamp;           // When the verification was performed
        string details;              // Additional details about the verification
    }
    
    /**
     * @dev Structure for governance proposals
     */
    struct Proposal {
        uint256 id;                  // Proposal ID
        address proposer;            // Address that created the proposal
        string title;                // Title of the proposal
        string description;          // Description of the proposal
        bytes data;                  // Call data for execution
        uint256 creationTime;        // When the proposal was created
        uint256 votingEndTime;       // When voting ends
        uint256 forVotes;            // Number of votes in favor
        uint256 againstVotes;        // Number of votes against
        bool executed;               // Whether the proposal was executed
        bool canceled;               // Whether the proposal was canceled
    }
}