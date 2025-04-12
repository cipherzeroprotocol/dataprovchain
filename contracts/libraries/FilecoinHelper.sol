// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DataTypes.sol";
import "@zondax/filecoin-solidity/contracts/v0.8/types/CommonTypes.sol";
import "@zondax/filecoin-solidity/contracts/v0.8/types/MarketTypes.sol";
import "@zondax/filecoin-solidity/contracts/v0.8/utils/FilAddresses.sol";
import "@zondax/filecoin-solidity/contracts/v0.8/utils/Misc.sol";

/**
 * @title FilecoinHelper
 * @dev Library providing utilities for interacting with the Filecoin network
 */
library FilecoinHelper {
    /**
     * @dev Creates a deal proposal for Filecoin storage
     * @param cid Content ID of the data
     * @param size Size of the data in bytes
     * @param client Address of the client
     * @param provider Provider ID
     * @param startEpoch Starting epoch for the deal
     * @param endEpoch Ending epoch for the deal
     * @param price Price per epoch
     * @return A MarketTypes.DealProposal struct
     */
    function createDealProposal(
        string memory cid,
        uint64 size,
        address client,
        string memory provider,
        int64 startEpoch,
        int64 endEpoch,
        uint256 price
    ) internal pure returns (MarketTypes.DealProposal memory) {
        MarketTypes.DealProposal memory proposal;
        
        // Set piece CID
        proposal.piece_cid = CommonTypes.Cid(bytes(cid));
        
        // Set piece size
        proposal.piece_size = size;
        
        // Set verified deal (false for now)
        proposal.verified_deal = false;
        
        // Set client
        proposal.client = getDelegatedAddress(client);
        
        // Set provider
        proposal.provider = FilAddresses.fromActorID(parseProviderID(provider));
        
        // Set label as DealLabel type (using an empty bool for the second parameter)
        proposal.label = CommonTypes.DealLabel(bytes(cid), false);
        
        // Set epochs with proper conversion to ChainEpoch
        proposal.start_epoch = CommonTypes.ChainEpoch.wrap(startEpoch);
        proposal.end_epoch = CommonTypes.ChainEpoch.wrap(endEpoch);
        
        // Set price and collateral (simplified for now)
        proposal.storage_price_per_epoch = CommonTypes.BigInt(
            bytes(uint256ToString(price)),
            false
        );
        proposal.provider_collateral = CommonTypes.BigInt(bytes("0"), false);
        proposal.client_collateral = CommonTypes.BigInt(bytes("0"), false);
        
        return proposal;
    }
    
    /**
     * @dev Converts a Filecoin provider ID to a uint64
     * @param providerId The provider ID string (e.g., "f01234")
     * @return The actor ID as uint64
     */
    function parseProviderID(string memory providerId) internal pure returns (uint64) {
        bytes memory providerBytes = bytes(providerId);
        // Skip the 'f' prefix and convert the rest to uint64
        uint64 id = 0;
        for (uint i = 1; i < providerBytes.length; i++) {
            id = id * 10 + (uint64(uint8(providerBytes[i])) - 48); // '0' is 48 in ASCII
        }
        return id;
    }
    
    /**
     * @dev Gets the delegated address for Filecoin
     * @param addr Ethereum address
     * @return Filecoin address
     */
    function getDelegatedAddress(address addr) internal pure returns (CommonTypes.FilAddress memory) {
        return CommonTypes.FilAddress(abi.encodePacked(hex"040a", addr));
    }
    
    /**
     * @dev Converts a uint256 to a string
     * @param value The uint256 to convert
     * @return The string representation of the uint256
     */
    function uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Creates a StorageDeal struct from deal data
     * @param datasetId ID of the dataset
     * @param dealCid Deal CID on Filecoin
     * @param dealId Deal ID on Filecoin
     * @param provider Provider ID
     * @param startTime Start time of the deal
     * @param endTime End time of the deal
     * @param size Size of the data in bytes
     * @return A StorageDeal struct
     */
    function createStorageDeal(
        uint256 datasetId,
        string memory dealCid,
        uint64 dealId,
        string memory provider,
        uint256 startTime,
        uint256 endTime,
        uint256 size
    ) internal pure returns (DataTypes.StorageDeal memory) {
        return DataTypes.StorageDeal({
            datasetId: datasetId,
            dealCid: dealCid,
            dealId: dealId,
            provider: provider,
            startTime: startTime,
            endTime: endTime,
            size: size,
            isActive: true
        });
    }
    
    /**
     * @dev Creates a VerificationRecord struct
     * @param datasetId ID of the dataset
     * @param verifier Address that performed the verification
     * @param method Verification method used
     * @param result Result of the verification
     * @param timestamp When the verification was performed
     * @param verified Whether the verification was successful
     * @return A VerificationRecord struct
     */
    function createVerificationRecord(
        uint256 datasetId,
        address verifier,
        string memory method,
        string memory result,
        uint256 timestamp,
        bool verified
    ) internal pure returns (DataTypes.VerificationRecord memory) {
        return DataTypes.VerificationRecord({
            datasetId: datasetId,
            verifier: verifier,
            method: method,
            result: result,
            timestamp: timestamp,
            verified: verified
        });
    }
}