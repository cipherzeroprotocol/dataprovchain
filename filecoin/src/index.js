/**
 * Filecoin Integration for DataProvChain
 * @module filecoin-integration
 */

// Storage Management
const deal = require('./src/storage/deal');
const retrieve = require('./src/storage/retrieve');
const optimize = require('./src/storage/optimize');

// Verification Tools
const proof = require('./src/verification/proof');
const verify = require('./src/verification/verify');

// CAR File Handling
const generator = require('./src/car/generator');
const parser = require('./src/car/parser');

// RPC Interactions
const rpcClient = require('./src/rpc/client');
const rpcMethods = require('./src/rpc/methods');

// Utility Functions
const cid = require('./src/utils/cid');
const config = require('./src/utils/config');
const conversion = require('./src/utils/conversion');

// Export all modules
module.exports = {
  // Storage Management
  storage: {
    deal,
    retrieve,
    optimize
  },
  
  // Verification Tools
  verification: {
    proof,
    verify
  },
  
  // CAR File Handling
  car: {
    generator,
    parser
  },
  
  // RPC Interactions
  rpc: {
    client: rpcClient,
    methods: rpcMethods
  },
  
  // Utility Functions
  utils: {
    cid,
    config,
    conversion
  }
};