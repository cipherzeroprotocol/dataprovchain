import { ethers } from 'ethers';
import { 
  DatasetRegistry__factory, 
  AttributionManager__factory,
  Marketplace__factory,
  DataDAO__factory,
  RoyaltyDistributor__factory,
  
} from '../types/contracts';
import { CONTRACT_ADDRESSES } from '../constants/contracts';

let provider;
let signer;
let datasetRegistry;
let attributionManager;
let marketplace;
let dataDAO;
let royaltyDistributor;

/**
 * Initialize the Ethereum provider
 * @param {boolean} [useSigner=false] - Whether to use a signer
 * @returns {ethers.providers.Provider} The provider
 */
export const initProvider = async (useSigner = false) => {
  if (window.ethereum) {
    // Create a provider from Metamask
    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    if (useSigner) {
      // Request access to accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      signer = provider.getSigner();
      return signer;
    }
    
    return provider;
  } else {
    throw new Error('Please install MetaMask or another Ethereum wallet extension');
  }
};

/**
 * Get the current wallet address
 * @returns {Promise<string>} The wallet address
 */
export const getWalletAddress = async () => {
  if (!signer) {
    await initProvider(true);
  }
  return signer.getAddress();
};

/**
 * Initialize contract instances
 * @param {boolean} [useSigner=false] - Whether to use a signer for transactions
 */
export const initContracts = async (useSigner = false) => {
  if (!provider) {
    if (useSigner) {
      signer = await initProvider(true);
    } else {
      provider = await initProvider();
    }
  }
  
  const contractProvider = useSigner ? signer : provider;
  
  // Initialize all contracts
  datasetRegistry = DatasetRegistry__factory.connect(
    CONTRACT_ADDRESSES.DATASET_REGISTRY,
    contractProvider
  );
  
  attributionManager = AttributionManager__factory.connect(
    CONTRACT_ADDRESSES.ATTRIBUTION_MANAGER,
    contractProvider
  );
  
  marketplace = Marketplace__factory.connect(
    CONTRACT_ADDRESSES.MARKETPLACE,
    contractProvider
  );
  
  dataDAO = DataDAO__factory.connect(
    CONTRACT_ADDRESSES.DATA_DAO,
    contractProvider
  );
  
  royaltyDistributor = RoyaltyDistributor__factory.connect(
    CONTRACT_ADDRESSES.ROYALTY_DISTRIBUTOR,
    contractProvider
  );
  
  
  
};

/**
 * Dataset Registry Contract Functions
 */

/**
 * Register a new dataset
 * @param {string} datasetId - Dataset ID
 * @param {string} metadataURI - URI of the dataset metadata
 * @param {string} dataHash - Hash of the dataset
 * @returns {Promise<ethers.ContractTransaction>} Transaction
 */
export const registerDataset = async (datasetId, metadataURI, dataHash) => {
  if (!datasetRegistry) await initContracts(true);
  return datasetRegistry.registerDataset(datasetId, metadataURI, dataHash);
};

/**
 * Get dataset details from the blockchain
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object>} Dataset details
 */
export const getDatasetDetails = async (datasetId) => {
  if (!datasetRegistry) await initContracts();
  return datasetRegistry.getDataset(datasetId);
};

/**
 * Update dataset metadata
 * @param {string} datasetId - Dataset ID
 * @param {string} metadataURI - New metadata URI
 * @returns {Promise<ethers.ContractTransaction>} Transaction
 */
export const updateDatasetMetadata = async (datasetId, metadataURI) => {
  if (!datasetRegistry) await initContracts(true);
  return datasetRegistry.updateMetadata(datasetId, metadataURI);
};

/**
 * Attribution Manager Contract Functions
 */

/**
 * Create new attribution record
 * @param {string} datasetId - Dataset ID
 * @param {string} modelId - Model ID
 * @param {string} attributionURI - URI of attribution metadata
 * @returns {Promise<ethers.ContractTransaction>} Transaction
 */
export const createAttributionRecord = async (datasetId, modelId, attributionURI) => {
  if (!attributionManager) await initContracts(true);
  return attributionManager.createAttribution(datasetId, modelId, attributionURI);
};

/**
 * Get attribution details
 * @param {string} attributionId - Attribution ID
 * @returns {Promise<Object>} Attribution details
 */
export const getAttributionDetails = async (attributionId) => {
  if (!attributionManager) await initContracts();
  return attributionManager.getAttribution(attributionId);
};

/**
 * Verify attribution for a model
 * @param {string} attributionId - Attribution ID
 * @returns {Promise<ethers.ContractTransaction>} Transaction
 */
export const verifyAttributionOnChain = async (attributionId) => {
  if (!attributionManager) await initContracts(true);
  return attributionManager.verifyAttribution(attributionId);
};

/**
 * Marketplace Contract Functions
 */

/**
 * List dataset on marketplace
 * @param {string} datasetId - Dataset ID
 * @param {string} price - Price in wei
 * @param {string} currency - Currency address (use ethers.constants.AddressZero for ETH)
 * @returns {Promise<ethers.ContractTransaction>} Transaction
 */
export const listDatasetOnMarketplace = async (datasetId, price, currency) => {
  if (!marketplace) await initContracts(true);
  return marketplace.listDataset(datasetId, price, currency);
};

/**
 * Purchase dataset from marketplace
 * @param {string} listingId - Listing ID
 * @param {string} [value] - ETH value to send (only if currency is ETH)
 * @returns {Promise<ethers.ContractTransaction>} Transaction
 */
export const purchaseDataset = async (listingId, value = '0') => {
  if (!marketplace) await initContracts(true);
  return marketplace.purchaseDataset(listingId, { value });
};

/**
 * Get listing details
 * @param {string} listingId - Listing ID
 * @returns {Promise<Object>} Listing details
 */
export const getListingDetails = async (listingId) => {
  if (!marketplace) await initContracts();
  return marketplace.getListing(listingId);
};

/**
 * Update listing price
 * @param {string} listingId - Listing ID
 * @param {string} newPrice - New price in wei
 * @returns {Promise<ethers.ContractTransaction>} Transaction
 */
export const updateListingPrice = async (listingId, newPrice) => {
  if (!marketplace) await initContracts(true);
  return marketplace.updatePrice(listingId, newPrice);
};

/**
 * Royalty Distributor Contract Functions
 */

/**
 * Distribute royalties
 * @param {string} datasetId - Dataset ID
 * @param {Array<string>} contributors - Array of contributor addresses
 * @param {Array<number>} shares - Array of shares (must sum to 100)
 * @param {string} [value] - ETH value to distribute
 * @returns {Promise<ethers.ContractTransaction>} Transaction
 */
export const distributeRoyalties = async (datasetId, contributors, shares, value = '0') => {
  if (!royaltyDistributor) await initContracts(true);
  return royaltyDistributor.distribute(datasetId, contributors, shares, { value });
};

/**
 * Get contributor royalty share
 * @param {string} datasetId - Dataset ID
 * @param {string} contributor - Contributor address
 * @returns {Promise<number>} Contributor's share
 */
export const getContributorShare = async (datasetId, contributor) => {
  if (!royaltyDistributor) await initContracts();
  return royaltyDistributor.getContributorShare(datasetId, contributor);
};

/**
 * Check if a user has purchased a dataset
 * @param {string} datasetId - Dataset ID
 * @param {string} [userAddress] - User address (defaults to current user)
 * @returns {Promise<boolean>} Whether the user has purchased the dataset
 */
export const hasPurchasedDataset = async (datasetId, userAddress = null) => {
  if (!marketplace) await initContracts();
  
  if (!userAddress) {
    if (!signer) await initProvider(true);
    userAddress = await signer.getAddress();
  }
  
  return marketplace.hasPurchased(userAddress, datasetId);
};

/**
 * Listen for contract events
 * @param {string} contractName - Name of the contract ('datasetRegistry', 'marketplace', etc.)
 * @param {string} eventName - Name of the event
 * @param {Function} callback - Callback function for the event
 * @returns {ethers.Contract} The event listener
 */
export const listenForContractEvent = async (contractName, eventName, callback) => {
  if (!provider) await initProvider();
  
  let contract;
  switch (contractName.toLowerCase()) {
    case 'datasetregistry':
      contract = datasetRegistry || DatasetRegistry__factory.connect(CONTRACT_ADDRESSES.DATASET_REGISTRY, provider);
      break;
    case 'attributionmanager':
      contract = attributionManager || AttributionManager__factory.connect(CONTRACT_ADDRESSES.ATTRIBUTION_MANAGER, provider);
      break;
    case 'marketplace':
      contract = marketplace || Marketplace__factory.connect(CONTRACT_ADDRESSES.MARKETPLACE, provider);
      break;
    case 'datadao':
      contract = dataDAO || DataDAO__factory.connect(CONTRACT_ADDRESSES.DATA_DAO, provider);
      break;
    case 'royaltydistributor':
      contract = royaltyDistributor || RoyaltyDistributor__factory.connect(CONTRACT_ADDRESSES.ROYALTY_DISTRIBUTOR, provider);
      break;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
  
  contract.on(eventName, callback);
  return contract;
};