/**
 * @module utils/merkle
 * @description Implements a full Merkle tree with proper proof generation and verification
 */

const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * MerkleTree class for creating trees, generating proofs, and verifying proofs
 */
class MerkleTree {
  /**
   * Create a new Merkle Tree
   * @param {Array<Buffer|String>} leaves - Array of leaf data (will be hashed if not already hashed)
   * @param {Function} [hashFunction] - Custom hash function (default: keccak256)
   * @param {Boolean} [doubleHash=true] - Whether to hash the leaf data before using
   */
  constructor(leaves, hashFunction = null, doubleHash = true) {
    this.doubleHash = doubleHash;
    this.hashFunction = hashFunction || this.keccak256;
    
    // Hash the leaves if they aren't already hashed and doubleHash is enabled
    this.leaves = leaves.map(leaf => {
      if (this.doubleHash) {
        return this.hashFunction(this._toBuffer(leaf));
      }
      return this._toBuffer(leaf);
    });
    
    // Save leaf count before padding
    this.elementCount = this.leaves.length;
    
    // Build the Merkle tree
    this.layers = this._buildTree(this.leaves);
  }
  
  /**
   * Default hash function using keccak256
   * @param {Buffer} data - Data to hash
   * @returns {Buffer} - Hashed data
   */
  keccak256(data) {
    return Buffer.from(ethers.utils.arrayify(ethers.utils.keccak256(data)));
  }
  
  /**
   * SHA256 hash function
   * @param {Buffer} data - Data to hash
   * @returns {Buffer} - Hashed data
   */
  sha256(data) {
    return crypto.createHash('sha256').update(data).digest();
  }
  
  /**
   * Convert various input types to Buffer
   * @private
   * @param {Buffer|String|Number|Array} input - Input to convert
   * @returns {Buffer} - Converted buffer
   */
  _toBuffer(input) {
    if (Buffer.isBuffer(input)) {
      return input;
    }
    
    if (input instanceof Uint8Array) {
      return Buffer.from(input);
    }
    
    if (typeof input === 'string') {
      // Handle hex strings with or without 0x prefix
      if (input.startsWith('0x')) {
        return Buffer.from(ethers.utils.arrayify(input));
      }
      // Otherwise treat as UTF-8 string
      return Buffer.from(input, 'utf8');
    }
    
    if (typeof input === 'number') {
      // Convert number to hex string and then to buffer
      const hex = ethers.utils.hexlify(input);
      return Buffer.from(ethers.utils.arrayify(hex));
    }
    
    if (Array.isArray(input)) {
      return Buffer.from(input);
    }
    
    throw new Error('Unsupported input type');
  }
  
  /**
   * Build a Merkle tree from leaf nodes
   * @private
   * @param {Array<Buffer>} leaves - Array of leaf node buffers
   * @returns {Array<Array<Buffer>>} - Layers of the Merkle tree
   */
  _buildTree(leaves) {
    // Make a copy to avoid modifying the input
    const nodes = [...leaves];
    const layers = [nodes];
    
    // Ensure even number of nodes at each level by duplicating the last node if necessary
    if (nodes.length % 2 === 1) {
      nodes.push(nodes[nodes.length - 1]);
    }
    
    // Build the tree layer by layer, from bottom to top
    while (nodes.length > 1) {
      const layerIndex = layers.length;
      layers[layerIndex] = [];
      
      for (let i = 0; i < nodes.length; i += 2) {
        if (i + 1 < nodes.length) {
          // Join two nodes and hash them to create a parent node
          layers[layerIndex].push(
            this.hashFunction(Buffer.concat([nodes[i], nodes[i + 1]]))
          );
        } else {
          // If there's an odd number of nodes, duplicate the last one
          layers[layerIndex].push(
            this.hashFunction(Buffer.concat([nodes[i], nodes[i]]))
          );
        }
      }
      
      // Move up one layer
      nodes = layers[layerIndex];
    }
    
    return layers;
  }
  
  /**
   * Gets the root of the Merkle tree
   * @returns {Buffer} - Merkle root
   */
  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }
  
  /**
   * Gets the hex string representation of the Merkle root
   * @returns {String} - Hex string of the Merkle root
   */
  getHexRoot() {
    return '0x' + this.getRoot().toString('hex');
  }
  
  /**
   * Gets a leaf at the specified index
   * @param {Number} index - Index of the leaf
   * @returns {Buffer} - Leaf data
   */
  getLeaf(index) {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Index out of range');
    }
    
    return this.leaves[index];
  }
  
  /**
   * Gets the hex string representation of a leaf
   * @param {Number} index - Index of the leaf
   * @returns {String} - Hex string of the leaf
   */
  getHexLeaf(index) {
    return '0x' + this.getLeaf(index).toString('hex');
  }
  
  /**
   * Gets all leaves in the tree
   * @returns {Array<Buffer>} - Array of leaves
   */
  getLeaves() {
    return this.leaves;
  }
  
  /**
   * Gets the leaf count in the tree
   * @returns {Number} - Leaf count
   */
  getLeafCount() {
    return this.elementCount;
  }
  
  /**
   * Gets the layer count in the tree
   * @returns {Number} - Layer count
   */
  getLayerCount() {
    return this.layers.length;
  }
  
  /**
   * Gets a specific layer in the tree
   * @param {Number} index - Layer index (0 is the leaf layer)
   * @returns {Array<Buffer>} - Layer data
   */
  getLayer(index) {
    if (index < 0 || index >= this.layers.length) {
      throw new Error('Layer index out of range');
    }
    
    return this.layers[index];
  }
  
  /**
   * Generates a Merkle proof for a leaf at the specified index
   * @param {Number} index - Index of the leaf
   * @returns {Object} - Merkle proof with siblings, path indices, and root
   */
  getProof(index) {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Index out of range');
    }
    
    // Proof consists of sibling hashes along the path from leaf to root
    const proof = [];
    let currentIndex = index;
    
    // Go up each layer, collecting the sibling node at each step
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      
      // Determine if the current node is left or right in its pair
      const isLeft = currentIndex % 2 === 0;
      const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
      
      // Ensure sibling index is valid (handling edge cases)
      if (siblingIndex < layer.length) {
        const sibling = layer[siblingIndex];
        const position = isLeft ? 'right' : 'left';
        
        // Add the sibling to the proof
        proof.push({
          data: sibling,
          position
        });
      }
      
      // Move to the parent index in the next layer
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    // Return the proof and related information
    return {
      leaf: this.leaves[index],
      leafIndex: index,
      siblings: proof.map(item => item.data),
      positions: proof.map(item => item.position === 'left' ? 0 : 1),
      root: this.getRoot()
    };
  }
  
  /**
   * Gets a hexadecimal representation of a proof
   * @param {Number} index - Index of the leaf
   * @returns {Object} - Merkle proof with hex strings
   */
  getHexProof(index) {
    const proof = this.getProof(index);
    
    return {
      leaf: '0x' + proof.leaf.toString('hex'),
      leafIndex: proof.leafIndex,
      siblings: proof.siblings.map(sibling => '0x' + sibling.toString('hex')),
      positions: proof.positions,
      root: '0x' + proof.root.toString('hex')
    };
  }
  
  /**
   * Verifies a Merkle proof
   * @param {Buffer|String} leaf - Leaf data
   * @param {Array<Buffer|String>} siblings - Array of sibling nodes
   * @param {Array<Number>} positions - Array of positions (0 for left, 1 for right)
   * @param {Buffer|String} root - Expected Merkle root
   * @returns {Boolean} - Whether the proof is valid
   */
  static verify(leaf, siblings, positions, root, hashFunction = null) {
    // Default to keccak256 if no hash function is provided
    const hasher = hashFunction || ((data) => {
      return Buffer.from(ethers.utils.arrayify(ethers.utils.keccak256(data)));
    });
    
    // Convert inputs to buffers
    const leafBuf = Buffer.isBuffer(leaf) ? leaf : Buffer.from(ethers.utils.arrayify(leaf));
    let rootBuf = Buffer.isBuffer(root) ? root : Buffer.from(ethers.utils.arrayify(root));
    
    if (siblings.length !== positions.length) {
      throw new Error('Siblings and positions arrays must have the same length');
    }
    
    // Start with the leaf node
    let currentNode = leafBuf;
    
    // Traverse up the tree using the proof
    for (let i = 0; i < siblings.length; i++) {
      const sibling = Buffer.isBuffer(siblings[i]) 
        ? siblings[i] 
        : Buffer.from(ethers.utils.arrayify(siblings[i]));
      
      // Determine the order of concatenation based on position
      let data;
      if (positions[i] === 0) {
        // Sibling is left, current is right
        data = Buffer.concat([sibling, currentNode]);
      } else {
        // Current is left, sibling is right
        data = Buffer.concat([currentNode, sibling]);
      }
      
      // Hash the combined data to get the parent
      currentNode = hasher(data);
    }
    
    // The final hash should match the provided root
    return currentNode.equals(rootBuf);
  }
  
  /**
   * Creates a Merkle tree from data and hashes it appropriately
   * @param {Array<any>} data - Array of data to include in the tree
   * @param {Function} [hashFunction] - Custom hash function
   * @param {Boolean} [doubleHash=true] - Whether to hash the data before using
   * @returns {MerkleTree} - New Merkle tree
   */
  static from(data, hashFunction = null, doubleHash = true) {
    return new MerkleTree(data, hashFunction, doubleHash);
  }
}

/**
 * Creates a multi-level Merkle tree of Merkle trees
 * Useful for creating efficient inclusion proofs for large datasets
 */
class MultiLevelMerkleTree {
  /**
   * Create a multi-level Merkle tree
   * @param {Array<Array<Buffer|String>>} nestedData - Array of arrays of data
   * @param {Function} [hashFunction] - Custom hash function
   */
  constructor(nestedData, hashFunction = null) {
    this.hasher = hashFunction || ((data) => {
      return Buffer.from(ethers.utils.arrayify(ethers.utils.keccak256(data)));
    });
    
    // Create individual Merkle trees for each data group
    this.trees = nestedData.map(dataGroup => new MerkleTree(dataGroup, this.hasher));
    
    // Create a top-level tree using the roots of the individual trees
    this.rootTree = new MerkleTree(
      this.trees.map(tree => tree.getRoot()),
      this.hasher,
      false // Don't double-hash, as the roots are already hashed
    );
  }
  
  /**
   * Gets the root of the top-level tree
   * @returns {Buffer} - Root hash
   */
  getRoot() {
    return this.rootTree.getRoot();
  }
  
  /**
   * Gets a hex representation of the root
   * @returns {String} - Hex string of the root
   */
  getHexRoot() {
    return this.rootTree.getHexRoot();
  }
  
  /**
   * Generates a multi-level proof for a specific element
   * @param {Number} groupIndex - Index of the group containing the element
   * @param {Number} elementIndex - Index of the element within the group
   * @returns {Object} - Multi-level Merkle proof
   */
  getProof(groupIndex, elementIndex) {
    if (groupIndex < 0 || groupIndex >= this.trees.length) {
      throw new Error('Group index out of range');
    }
    
    // Get the proof from the specific tree
    const treeProof = this.trees[groupIndex].getProof(elementIndex);
    
    // Get the proof from the root tree
    const rootProof = this.rootTree.getProof(groupIndex);
    
    return {
      leaf: treeProof.leaf,
      treeProof: {
        siblings: treeProof.siblings,
        positions: treeProof.positions,
        root: treeProof.root
      },
      rootProof: {
        siblings: rootProof.siblings,
        positions: rootProof.positions,
        root: rootProof.root
      },
      groupIndex,
      elementIndex
    };
  }
  
  /**
   * Verifies a multi-level Merkle proof
   * @param {Object} proof - Multi-level proof generated by getProof
   * @returns {Boolean} - Whether the proof is valid
   */
  static verify(proof) {
    // First verify the tree proof
    const treeVerified = MerkleTree.verify(
      proof.leaf,
      proof.treeProof.siblings,
      proof.treeProof.positions,
      proof.treeProof.root
    );
    
    if (!treeVerified) {
      return false;
    }
    
    // Then verify the root proof
    return MerkleTree.verify(
      proof.treeProof.root,
      proof.rootProof.siblings,
      proof.rootProof.positions,
      proof.rootProof.root
    );
  }
}

module.exports = {
  MerkleTree,
  MultiLevelMerkleTree
};