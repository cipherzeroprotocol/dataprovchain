// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DataTypes.sol";

/**
 * @title ProvenanceUtils
 * @dev Library providing utility functions for tracking data lineage and provenance
 */
library ProvenanceUtils {
    /**
     * @dev Creates a new provenance record
     * @param action The action performed
     * @param actor The address that performed the action
     * @param details Additional details about the action
     * @return A new ProvenanceRecord struct
     */
    function createRecord(
        string memory action,
        address actor,
        string memory details
    ) internal view returns (DataTypes.ProvenanceRecord memory) {
        return DataTypes.ProvenanceRecord({
            action: action,
            actor: actor,
            timestamp: block.timestamp,
            details: details
        });
    }
    
    /**
     * @dev Validates a provenance record
     * @param record The provenance record to validate
     * @return True if the record is valid, false otherwise
     */
    function validateRecord(DataTypes.ProvenanceRecord memory record) internal pure returns (bool) {
        return (
            bytes(record.action).length > 0 &&
            record.actor != address(0) &&
            record.timestamp > 0
        );
    }
    
    /**
     * @dev Formats a provenance record as a string
     * @param record The provenance record to format
     * @return A formatted string representation of the record
     */
    function formatRecord(DataTypes.ProvenanceRecord memory record) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "Action: ", record.action,
            ", Actor: ", addressToString(record.actor),
            ", Time: ", uint256ToString(record.timestamp),
            ", Details: ", record.details
        ));
    }
    
    /**
     * @dev Converts an address to a string
     * @param addr The address to convert
     * @return The string representation of the address
     */
    function addressToString(address addr) internal pure returns (string memory) {
        bytes memory addressBytes = abi.encodePacked(addr);
        bytes memory stringBytes = new bytes(42);
        
        stringBytes[0] = '0';
        stringBytes[1] = 'x';
        
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = addressBytes[i];
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            stringBytes[2 + i*2] = char(hi);
            stringBytes[2 + i*2 + 1] = char(lo);
        }
        
        return string(stringBytes);
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
     * @dev Converts a byte to a hex character
     * @param b The byte to convert
     * @return The hex character
     */
    function char(bytes1 b) internal pure returns (bytes1) {
        if (uint8(b) < 10) {
            return bytes1(uint8(b) + 0x30);
        } else {
            return bytes1(uint8(b) + 0x57);
        }
    }
    
    /**
     * @dev Checks if a record already exists in an array of records
     * @param records Array of provenance records
     * @param record Record to check
     * @return True if the record exists, false otherwise
     */
    function recordExists(
        DataTypes.ProvenanceRecord[] memory records,
        DataTypes.ProvenanceRecord memory record
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < records.length; i++) {
            if (
                keccak256(bytes(records[i].action)) == keccak256(bytes(record.action)) &&
                records[i].actor == record.actor &&
                records[i].timestamp == record.timestamp
            ) {
                return true;
            }
        }
        return false;
    }
}