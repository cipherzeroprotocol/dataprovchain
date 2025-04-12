/**
 * @module verification/verify
 * @description Functions for verifying cryptographic proofs for Filecoin data
 */

const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc');
const { NodejsProvider } = require('@filecoin-shipyard/lotus-client-provider-nodejs');
const { ethers } = require('ethers');
const { CID } = require('multiformats/cid');
const { makeRpcCall } = require('../rpc/client');
const { getDealInfo } = require('../rpc/methods');
const config = require('../utils/config');
const cidUtils = require('../utils/cid');
const { MerkleTree } = require('../utils/merkle');
const crypto = require('crypto');

/**
 * Verifies an inclusion proof for data in a Filecoin deal
 * @param {Object} proof - The inclusion proof
 * @param {String} dealId - ID of the storage deal
 * @param {String} cid - Content ID of the data
 * @returns {Promise<Boolean>} - Whether the proof is valid
 */
async function verifyInclusionProof(proof, dealId, cid) {
  try {
    // Verify basic proof structure
    if (!proof || !proof.proofData || !proof.proofData.merkleRoot || !proof.proofData.siblings) {
      return false;
    }
    
    // Check dealId and cid match the proof
    if (proof.dealId !== dealId || (proof.dataCID !== cid && proof.cid !== cid)) {
      return false;
    }
    
    // Get deal information to verify
    const dealInfo = await getDealInfo(dealId);
    
    if (!dealInfo) {
      throw new Error(`Deal not found: ${dealId}`);
    }
    
    // Verify the piece CID matches if present in proof
    if (proof.pieceCID && dealInfo.pieceCID !== proof.pieceCID) {
      return false;
    }
    
    // Verify the Merkle proof using our MerkleTree implementation
    const siblings = proof.proofData.siblings.map(sibling => 
      Buffer.isBuffer(sibling) ? sibling : Buffer.from(sibling, 'hex')
    );
    
    const leaf = proof.proofData.leaf || proof.leaf;
    const leafBuffer = Buffer.isBuffer(leaf) ? leaf : Buffer.from(leaf, 'hex');
    
    const root = proof.proofData.merkleRoot || proof.proofData.root;
    const rootBuffer = Buffer.isBuffer(root) ? root : Buffer.from(root, 'hex');
    
    // Verify the Merkle proof
    const merkleVerified = MerkleTree.verify(
      leafBuffer,
      siblings,
      proof.proofData.positions,
      rootBuffer
    );
    
    if (!merkleVerified) {
      return false;
    }
    
    // Verify the signature if present
    if (proof.proofData.signature) {
      try {
        // Reconstruct the signed data
        const signedData = {
          dealId: proof.dealId,
          pieceCID: proof.pieceCID,
          dataCID: proof.dataCID,
          merkleRoot: Buffer.isBuffer(root) ? root.toString('hex') : root,
          leafIndex: proof.proofData.leafIndex
        };
        
        // Encode the data in the same way it was signed
        const encodedData = ethers.utils.defaultAbiCoder.encode(
          ['string', 'string', 'string', 'string', 'uint256', 'uint256'],
          [
            signedData.dealId,
            signedData.pieceCID,
            signedData.dataCID,
            signedData.merkleRoot,
            signedData.leafIndex,
            proof.timestamp
          ]
        );
        
        // Hash the encoded data
        const dataHash = ethers.utils.keccak256(encodedData);
        
        // Recover the signer from the signature
        const recoveredAddress = ethers.utils.verifyMessage(
          ethers.utils.arrayify(dataHash),
          proof.proofData.signature
        );
        
        // Check if the signature is valid
        const expectedSigner = config.getConfig().auth.walletAddress;
        
        if (expectedSigner && recoveredAddress.toLowerCase() !== expectedSigner.toLowerCase()) {
          return false;
        }
      } catch (error) {
        console.warn('Signature verification error:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Inclusion proof verification error: ${error.message}`);
    return false;
  }
}

/**
 * Verifies a merkle proof
 * @param {Object} proof - The merkle proof
 * @param {String|Buffer} leaf - The leaf to verify
 * @param {String|Buffer} root - The merkle root
 * @returns {Boolean} - Whether the proof is valid
 */
function verifyMerkleProof(proof, leaf, root) {
  try {
    // Convert leaf and root to buffers if they're not already
    const leafBuffer = Buffer.isBuffer(leaf) ? leaf : Buffer.from(leaf, 'hex');
    const rootBuffer = Buffer.isBuffer(root) ? root : Buffer.from(root, 'hex');
    
    // Convert siblings to buffers
    const siblings = proof.siblings.map(sibling => 
      Buffer.isBuffer(sibling) ? sibling : Buffer.from(sibling, 'hex')
    );
    
    // Use our MerkleTree implementation to verify the proof
    return MerkleTree.verify(
      leafBuffer,
      siblings,
      proof.positions,
      rootBuffer
    );
  } catch (error) {
    console.error(`Merkle proof verification error: ${error.message}`);
    return false;
  }
}

/**
 * Verifies a proof of data possession
 * @param {Object} proof - The possession proof
 * @param {String} cid - Content ID of the data
 * @param {String} proverAddress - Address claiming possession
 * @returns {Promise<Boolean>} - Whether the proof is valid
 */
async function verifyPossessionProof(proof, cid, proverAddress) {
  try {
    // Verify proof structure
    if (!proof || !proof.challenge || !proof.response || !proof.signature) {
      return false;
    }
    
    // Check CID and prover address match
    if (proof.cid !== cid || proof.prover !== proverAddress) {
      return false;
    }
    
    // Verify the challenge matches our expectations
    const expectedChallenge = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['string', 'uint256', 'address'],
        [cid, proof.randomSeed, proverAddress]
      )
    );
    
    if (expectedChallenge !== proof.challenge) {
      return false;
    }
    
    // For data sample proofs
    if (proof.method === 'data-sample' && proof.samples) {
      // Verify the response construction
      // We need to reconstruct the same hash that was used to create the response
      if (!proof.samples || !proof.samples.length) {
        return false;
      }
      
      // Reconstruct the combined data
      const combinedData = Buffer.concat([
        Buffer.from(proof.challenge.slice(2), 'hex'), // Remove 0x prefix
        ...proof.samples.map(sample => Buffer.from(sample.hash, 'hex'))
      ]);
      
      // Calculate the expected response
      const expectedResponse = '0x' + crypto.createHash('sha256').update(combinedData).digest('hex');
      
      if (expectedResponse !== proof.response) {
        return false;
      }
    }
    
    // Verify the signature
    try {
      // Recover the signer from the signature
      const recoveredAddress = ethers.utils.verifyMessage(
        ethers.utils.arrayify(proof.response),
        proof.signature
      );
      
      // Check if the signature is from the claimed prover
      return recoveredAddress.toLowerCase() === proverAddress.toLowerCase();
    } catch (error) {
      console.warn('Signature verification error:', error);
      return false;
    }
  } catch (error) {
    console.error(`Possession proof verification error: ${error.message}`);
    return false;
  }
}

/**
 * Verifies a data signature
 * @param {Buffer|String} data - The data that was signed
 * @param {String} signature - The signature
 * @param {String} address - The address that supposedly signed
 * @returns {Boolean} - Whether the signature is valid
 */
function verifySignature(data, signature, address) {
  try {
    // Convert data to a buffer if it's not already
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    
    // Hash the data using the same algorithm as in signData
    const dataHash = crypto.createHash('sha256').update(dataBuffer).digest();
    
    // For eth-personal-sign signatures
    const ethHashForSigning = ethers.utils.keccak256(
      ethers.utils.concat([
        // Ethereum signed message prefix
        ethers.utils.toUtf8Bytes("\x19Ethereum Signed Message:\n32"),
        dataHash
      ])
    );
    
    // Recover the signer address
    const recoveredAddress = ethers.utils.recoverAddress(
      ethers.utils.arrayify(ethHashForSigning),
      signature
    );
    
    // Check if the recovered address matches the claimed signer
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error(`Signature verification error: ${error.message}`);
    return false;
  }
}

/**
 * Verifies a storage deal's validity on the Filecoin network
 * @param {String} dealId - ID of the deal to verify
 * @returns {Promise<Object>} - Verification results
 */
async function verifyDealValidity(dealId) {
  try {
    // Get deal information
    const dealInfo = await getDealInfo(dealId);
    
    if (!dealInfo) {
      throw new Error(`Deal not found: ${dealId}`);
    }
    
    // Get current epoch
    const currentEpoch = await makeRpcCall('ChainHead', [])
      .then(chainHead => chainHead.Height);
    
    // Check deal status and timing
    const isActive = currentEpoch >= dealInfo.startEpoch && currentEpoch <= dealInfo.endEpoch;
    const hasStarted = currentEpoch >= dealInfo.startEpoch;
    const hasEnded = currentEpoch > dealInfo.endEpoch;
    
    // For more complete verification, check the sector activation on chain
    let sectorActive = false;
    
    try {
      // In a real implementation, we would verify the sector is properly sealed
      // and the data is available for retrieval by checking chain state.
      
      // Check if the deal is in an active sector
      const sectorInfo = await makeRpcCall('StateSectorGetInfo', [
        dealInfo.provider,
        dealInfo.sectorNumber,
        null
      ]);
      
      sectorActive = sectorInfo && sectorInfo.SealedCID;
      
    } catch (sectorError) {
      console.warn(`Failed to check sector status: ${sectorError.message}`);
      // Continue with basic verification
    }
    
    return {
      dealId,
      isValid: isActive && sectorActive,
      hasStarted,
      hasEnded,
      sectorActive,
      startEpoch: dealInfo.startEpoch,
      endEpoch: dealInfo.endEpoch,
      currentEpoch,
      provider: dealInfo.provider,
      client: dealInfo.client,
      pieceCID: dealInfo.pieceCID
    };
  } catch (error) {
    throw new Error(`Failed to verify deal validity: ${error.message}`);
  }
}

/**
 * Deserializes a serialized proof
 * @param {String} serializedProof - Serialized proof string
 * @returns {Object} - Deserialized proof object
 */
function deserializeProof(serializedProof) {
  try {
    // Validate input
    if (!serializedProof || typeof serializedProof !== 'string') {
      throw new Error('Invalid serialized proof');
    }
    
    // Remove 0x prefix if present
    const hexProof = serializedProof.startsWith('0x') 
      ? serializedProof.slice(2) 
      : serializedProof;
    
    // Try to detect the proof type based on the format
    if (serializedProof.length > 66 && serializedProof.startsWith('0x')) {
      // Looks like it might be ABI encoded - try to decode it
      try {
        // Try to decode as a Merkle proof
        const decoded = ethers.utils.defaultAbiCoder.decode(
          ['bytes32', 'bytes32[]', 'bytes', 'uint256', 'bytes', 'uint256'],
          serializedProof
        );
        
        // Parse positions from bit string
        const positionBytes = ethers.utils.arrayify(decoded[2]);
        const positions = [];
        
        for (let i = 0; i < positionBytes.length; i++) {
          const byte = positionBytes[i];
          for (let j = 0; j < 8; j++) {
            if (positions.length < decoded[1].length) {
              positions.push((byte >> j) & 1);
            }
          }
        }
        
        return {
          type: 'merkle',
          root: decoded[0],
          siblings: decoded[1],
          positions,
          leafIndex: decoded[3].toNumber(),
          signature: decoded[4],
          timestamp: decoded[5].toNumber()
        };
      } catch (abiError) {
        // Not a Merkle proof - try another format
        try {
          // Try to decode as a possession proof
          const decoded = ethers.utils.defaultAbiCoder.decode(
            ['string', 'address', 'bytes32', 'bytes32', 'bytes', 'uint256'],
            serializedProof
          );
          
          return {
            type: 'possession',
            cid: decoded[0],
            prover: decoded[1],
            challenge: decoded[2],
            response: decoded[3],
            signature: decoded[4],
            timestamp: decoded[5].toNumber()
          };
        } catch (possessionError) {
          // Not an ABI encoded proof
        }
      }
    }
    
    // Try to decode as RLP encoded
    try {
      const rlpDecoded = ethers.utils.RLP.decode(
        ethers.utils.hexlify('0x' + hexProof)
      );
      
      if (rlpDecoded.length >= 6) {
        return {
          timestamp: ethers.utils.toUtf8String(rlpDecoded[0]),
          dealId: ethers.utils.toUtf8String(rlpDecoded[1]),
          cid: ethers.utils.toUtf8String(rlpDecoded[2]),
          prover: ethers.utils.toUtf8String(rlpDecoded[3]),
          signature: ethers.utils.hexlify(rlpDecoded[4]),
          root: ethers.utils.hexlify(rlpDecoded[5])
        };
      }
    } catch (rlpError) {
      // Not RLP encoded - try one more format
    }
    
    // Fallback - try to parse as JSON
    try {
      const jsonProof = Buffer.from(hexProof, 'hex').toString();
      return JSON.parse(jsonProof);
    } catch (jsonError) {
      throw new Error(`Failed to deserialize proof: Unknown format`);
    }
  } catch (error) {
    throw new Error(`Failed to deserialize proof: ${error.message}`);
  }
}

/**
 * Verifies a serialized proof
 * @param {String} serializedProof - Serialized proof
 * @param {Object} params - Verification parameters
 * @param {String} [params.dealId] - Deal ID for inclusion proofs
 * @param {String} [params.cid] - Content ID for inclusion/possession proofs
 * @param {String} [params.proverAddress] - Prover address for possession proofs
 * @returns {Promise<Boolean>} - Whether the proof is valid
 */
async function verifySerializedProof(serializedProof, params = {}) {
  try {
    // Deserialize the proof
    const proof = deserializeProof(serializedProof);
    
    // Determine the proof type and verify accordingly
    if (proof.type === 'merkle' || (proof.root && proof.siblings)) {
      // It's a Merkle proof
      return verifyMerkleProof(
        {
          siblings: proof.siblings,
          positions: proof.positions || []
        },
        params.leaf || proof.leaf,
        proof.root
      );
    } else if (proof.type === 'possession' || (proof.challenge && proof.response)) {
      // It's a possession proof
      return verifyPossessionProof(
        proof,
        params.cid || proof.cid,
        params.proverAddress || proof.prover
      );
    } else if (proof.dealId && proof.pieceCID) {
      // It's likely an inclusion proof
      return verifyInclusionProof(
        proof,
        params.dealId || proof.dealId,
        params.cid || proof.cid || proof.dataCID
      );
    }
    
    throw new Error('Unknown proof type');
  } catch (error) {
    console.error(`Failed to verify serialized proof: ${error.message}`);
    return false;
  }
}

module.exports = {
  verifyInclusionProof,
  verifyMerkleProof,
  verifyPossessionProof,
  verifySignature,
  verifyDealValidity,
  deserializeProof,
  verifySerializedProof
};