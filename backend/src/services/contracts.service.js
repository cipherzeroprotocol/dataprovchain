/**
 * Service for interacting with smart contracts
 */
const { ethers } = require('ethers');
const web3Utils = require('../utils/web3');
const logger = require('../utils/logger');
const filecoinConfig = require('../config/filecoin');

// Contract ABIs
const DatasetRegistryABI = require('../../abi/DatasetRegistry.json');
const AttributionManagerABI = require('../../abi/AttributionManager.json');
const MarketplaceABI = require('../../abi/Marketplace.json');
const FilecoinDealClientABI = require('../../abi/FilecoinDealClient.json');
const DataDAOABI = require('../../abi/DataDAO.json');

// Contract addresses (would come from environment variables in production)
const CONTRACT_ADDRESSES = {
  DatasetRegistry: process.env.DATASET_REGISTRY_ADDRESS,
  AttributionManager: process.env.ATTRIBUTION_MANAGER_ADDRESS,
  Marketplace: process.env.MARKETPLACE_ADDRESS,
  FilecoinDealClient: process.env.FILECOIN_DEAL_CLIENT_ADDRESS,
  DataDAO: process.env.DATA_DAO_ADDRESS
};

let provider;
let signer;
let contracts = {};

/**
 * Initialize the contracts service
 */
const initialize = () => {
  provider = web3Utils.createProvider(filecoinConfig.rpcUrl);
  
  if (filecoinConfig.privateKey) {
    signer = web3Utils.createWallet(filecoinConfig.privateKey, provider);
    logger.info('Contract service initialized with signer');
  } else {
    logger.warn('Contract service initialized without signer, read-only operations available');
  }
  
  // Initialize contract instances
  contracts.DatasetRegistry = new ethers.Contract(
    CONTRACT_ADDRESSES.DatasetRegistry,
    DatasetRegistryABI,
    signer || provider
  );
  
  contracts.AttributionManager = new ethers.Contract(
    CONTRACT_ADDRESSES.AttributionManager,
    AttributionManagerABI,
    signer || provider
  );
  
  contracts.Marketplace = new ethers.Contract(
    CONTRACT_ADDRESSES.Marketplace,
    MarketplaceABI,
    signer || provider
  );
  
  contracts.FilecoinDealClient = new ethers.Contract(
    CONTRACT_ADDRESSES.FilecoinDealClient,
    FilecoinDealClientABI,
    signer || provider
  );
  
  contracts.DataDAO = new ethers.Contract(
    CONTRACT_ADDRESSES.DataDAO,
    DataDAOABI,
    signer || provider
  );
};

/**
 * Get a contract instance
 * @param {string} contractName - Name of the contract
 * @returns {ethers.Contract} - Contract instance
 */
const getContract = (contractName) => {
  if (!contracts[contractName]) {
    throw new Error(`Contract ${contractName} not initialized`);
  }
  return contracts[contractName];
};

/**
 * Register a dataset on the blockchain
 * @param {Object} dataset - Dataset object
 * @param {string} dataset.cid - IPFS CID of the dataset
 * @param {string} dataset.dataType - Type of data
 * @param {Array<string>} dataset.contributors - Array of contributor addresses
 * @param {string} dataset.metadataURI - URI pointing to the full metadata
 * @returns {Promise<Object>} - Transaction receipt and tokenId
 */
const registerDataset = async (dataset) => {
  try {
    const contract = getContract('DatasetRegistry');
    
    const tx = await contract.registerDataset(
      dataset.cid,
      dataset.dataType,
      dataset.contributors,
      dataset.metadataURI
    );
    
    const receipt = await tx.wait();
    
    // Find the DatasetRegistered event to get the tokenId
    const event = receipt.events.find(e => e.event === 'DatasetRegistered');
    const tokenId = event.args.tokenId.toString();
    
    logger.info('Dataset registered on blockchain', { tokenId, txHash: receipt.transactionHash });
    
    return { receipt, tokenId };
  } catch (error) {
    logger.error('Error registering dataset on blockchain', { error: error.message });
    throw error;
  }
};

/**
 * Verify a dataset on the blockchain
 * @param {string} tokenId - ID of the dataset to verify
 * @returns {Promise<Object>} - Transaction receipt
 */
const verifyDataset = async (tokenId) => {
  try {
    const contract = getContract('DatasetRegistry');
    
    const tx = await contract.verifyDataset(tokenId);
    const receipt = await tx.wait();
    
    logger.info('Dataset verified on blockchain', { tokenId, txHash: receipt.transactionHash });
    
    return { receipt };
  } catch (error) {
    logger.error('Error verifying dataset on blockchain', { error: error.message, tokenId });
    throw error;
  }
};

/**
 * Get dataset metadata from the blockchain
 * @param {string} tokenId - ID of the dataset
 * @returns {Promise<Object>} - Dataset metadata
 */
const getDatasetMetadata = async (tokenId) => {
  try {
    const contract = getContract('DatasetRegistry');
    
    const metadata = await contract.getDatasetMetadata(tokenId);
    
    // Transform the metadata to a more usable format
    return {
      cid: metadata.cid,
      dataType: metadata.dataType,
      creator: metadata.creator,
      timestamp: metadata.timestamp.toNumber(),
      verified: metadata.verified,
      metadataURI: metadata.metadataURI
    };
  } catch (error) {
    logger.error('Error getting dataset metadata from blockchain', { error: error.message, tokenId });
    throw error;
  }
};

/**
 * Record dataset usage on the blockchain
 * @param {string} tokenId - ID of the dataset
 * @param {string} modelId - ID of the model using the dataset
 * @param {string} usageType - Type of usage
 * @param {number} impactScore - Impact score
 * @returns {Promise<Object>} - Transaction receipt
 */
const recordDatasetUsage = async (tokenId, modelId, usageType, impactScore) => {
  try {
    const contract = getContract('AttributionManager');
    
    const tx = await contract.recordAttribution(
      tokenId,
      modelId,
      usageType,
      impactScore
    );
    
    const receipt = await tx.wait();
    
    logger.info('Dataset usage recorded on blockchain', { 
      tokenId, 
      modelId, 
      txHash: receipt.transactionHash 
    });
    
    return { receipt };
  } catch (error) {
    logger.error('Error recording dataset usage on blockchain', { 
      error: error.message, 
      tokenId, 
      modelId 
    });
    throw error;
  }
};

/**
 * Create a marketplace listing
 * @param {Object} listing - Listing object
 * @param {string} listing.datasetId - ID of the dataset
 * @param {string} listing.price - Price in wei
 * @param {string} listing.licenseType - Type of license
 * @param {number} listing.duration - Duration in seconds
 * @returns {Promise<Object>} - Transaction receipt and listingId
 */
const createListing = async (listing) => {
  try {
    const contract = getContract('Marketplace');
    
    const tx = await contract.createListing(
      listing.datasetId,
      listing.price,
      listing.licenseType,
      listing.duration
    );
    
    const receipt = await tx.wait();
    
    // Find the ListingCreated event to get the listingId
    const event = receipt.events.find(e => e.event === 'ListingCreated');
    const listingId = event.args.listingId.toString();
    
    logger.info('Marketplace listing created on blockchain', { 
      listingId, 
      datasetId: listing.datasetId, 
      txHash: receipt.transactionHash 
    });
    
    return { receipt, listingId };
  } catch (error) {
    logger.error('Error creating marketplace listing on blockchain', { 
      error: error.message, 
      datasetId: listing.datasetId 
    });
    throw error;
  }
};

/**
 * Make a deal proposal on Filecoin
 * @param {Object} deal - Deal object
 * @param {string} deal.pieceCid - Piece CID
 * @param {number} deal.pieceSize - Piece size in bytes
 * @param {boolean} deal.verifiedDeal - Whether this is a verified deal
 * @param {string} deal.label - Deal label
 * @param {number} deal.startEpoch - Start epoch
 * @param {number} deal.endEpoch - End epoch
 * @param {string} deal.price - Price per epoch per byte
 * @param {string} deal.provider - Provider address
 * @param {string} deal.clientAddress - Client address
 * @returns {Promise<Object>} - Transaction receipt and dealId
 */
const makeDealProposal = async (deal) => {
  try {
    const contract = getContract('FilecoinDealClient');
    
    const tx = await contract.makeDealProposal({
      pieceCid: deal.pieceCid,
      pieceSize: deal.pieceSize,
      verifiedDeal: deal.verifiedDeal,
      label: deal.label,
      startEpoch: deal.startEpoch,
      endEpoch: deal.endEpoch,
      price: deal.price,
      provider: deal.provider,
      clientAddress: deal.clientAddress
    });
    
    const receipt = await tx.wait();
    
    // Find the DealProposalCreated event to get the dealId
    const event = receipt.events.find(e => e.event === 'DealProposalCreated');
    const dealId = event.args.dealId.toString();
    
    logger.info('Filecoin deal proposal created on blockchain', { 
      dealId, 
      pieceCid: deal.pieceCid, 
      txHash: receipt.transactionHash 
    });
    
    return { receipt, dealId };
  } catch (error) {
    logger.error('Error making Filecoin deal proposal on blockchain', { 
      error: error.message, 
      pieceCid: deal.pieceCid 
    });
    throw error;
  }
};

/**
 * Check the status of a Filecoin deal
 * @param {string} dealId - ID of the deal
 * @returns {Promise<Object>} - Deal status
 */
const checkDealStatus = async (dealId) => {
  try {
    const contract = getContract('FilecoinDealClient');
    
    const status = await contract.checkDealStatus(dealId);
    
    return {
      active: status.active,
      activated: status.activated,
      terminated: status.terminated,
      message: status.message
    };
  } catch (error) {
    logger.error('Error checking Filecoin deal status on blockchain', { 
      error: error.message, 
      dealId 
    });
    throw error;
  }
};

/**
 * Setup event listeners for contracts
 * @param {Object} eventHandlers - Map of event handlers by contract and event name
 */
const setupEventListeners = (eventHandlers) => {
  for (const [contractName, events] of Object.entries(eventHandlers)) {
    const contract = getContract(contractName);
    
    for (const [eventName, handler] of Object.entries(events)) {
      contract.on(eventName, async (...args) => {
        try {
          await handler(...args);
        } catch (error) {
          logger.error(`Error handling ${contractName}.${eventName} event`, { 
            error: error.message,
            args
          });
        }
      });
      
      logger.info(`Event listener set up for ${contractName}.${eventName}`);
    }
  }
};

// Initialize the service when imported
initialize();

module.exports = {
  getContract,
  registerDataset,
  verifyDataset,
  getDatasetMetadata,
  recordDatasetUsage,
  createListing,
  makeDealProposal,
  checkDealStatus,
  setupEventListeners
};