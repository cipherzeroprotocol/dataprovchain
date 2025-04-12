// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title SecurityUtils
 * @dev Library providing security-related utility functions
 */
library SecurityUtils {
    /**
     * @dev Validates an address
     * @param addr Address to validate
     * @return True if the address is valid, false otherwise
     */
    function isValidAddress(address addr) internal pure returns (bool) {
        return addr != address(0);
    }
    
    /**
     * @dev Validates a percentage value
     * @param percentage Percentage value to validate
     * @return True if the percentage is valid, false otherwise
     */
    function isValidPercentage(uint8 percentage) internal pure returns (bool) {
        return percentage <= 100;
    }
    
    /**
     * @dev Validates a list of contributors and their shares
     * @param contributors Array of contributor addresses
     * @param shares Array of contributor shares
     * @return True if the contributors and shares are valid, false otherwise
     */
    function validateContributorShares(
        address[] memory contributors,
        uint8[] memory shares
    ) internal pure returns (bool) {
        // Check if arrays have the same length
        if (contributors.length != shares.length) {
            return false;
        }
        
        // Check if there's at least one contributor
        if (contributors.length == 0) {
            return false;
        }
        
        // Check if the total shares add up to 100%
        uint16 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            // Check if the contributor address is valid
            if (!isValidAddress(contributors[i])) {
                return false;
            }
            
            // Check if the share is valid
            if (!isValidPercentage(shares[i])) {
                return false;
            }
            
            totalShares += shares[i];
        }
        
        return totalShares == 100;
    }
    
    /**
     * @dev Validates a string is not empty
     * @param str String to validate
     * @return True if the string is not empty, false otherwise
     */
    function isValidString(string memory str) internal pure returns (bool) {
        return bytes(str).length > 0;
    }
    
    /**
     * @dev Generates a unique identifier for a transaction
     * @param prefix Prefix for the identifier
     * @param sender Address of the sender
     * @param timestamp Current timestamp
     * @return A unique bytes32 identifier
     */
    function generateId(
        string memory prefix,
        address sender,
        uint256 timestamp
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                prefix,
                sender,
                timestamp,
                blockhash(block.number - 1)
            )
        );
    }
    
    /**
     * @dev Checks if a signature is valid
     * @param signer The address that supposedly signed the message
     * @param message The message that was signed
     * @param signature The signature
     * @return True if the signature is valid, false otherwise
     */
    function isValidSignature(
        address signer,
        bytes32 message,
        bytes memory signature
    ) internal pure returns (bool) {
        bytes32 ethMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", message)
        );
        
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        
        return ecrecover(ethMessageHash, v, r, s) == signer;
    }
    
    /**
     * @dev Splits a signature into r, s, and v components
     * @param signature The signature to split
     * @return r The r component of the signature
     * @return s The s component of the signature
     * @return v The v component of the signature
     */
    function splitSignature(bytes memory signature)
        internal
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(signature.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        // Version of signature should be 27 or 28, but some tools use 0 or 1
        if (v < 27) {
            v += 27;
        }
        
        require(v == 27 || v == 28, "Invalid signature v value");
    }
}