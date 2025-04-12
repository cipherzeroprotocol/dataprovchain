import  { defaultNetwork } from '../config/networks';

// ABIs would be imported from separate files
import DatasetRegistryABI from '../abis/DatasetRegistry.json';
import AttributionManagerABI from '../abis/AttributionManager.json';
import MarketplaceABI from '../abis/Marketplace.json';
import FilecoinDealClientABI from '../abis/FilecoinDealClient.json';
import DataDAOABI from '../abis/DataDAO.json';

// Contract addresses per network
const addresses = {
  calibrationnet: {
    DatasetRegistry: '0x123...', // Replace with actual addresses
    AttributionManager: '0x456...',
    Marketplace: '0x789...',
    FilecoinDealClient: '0xabc...',
    DataDAO: '0xdef...'
  },
  mainnet: {
    DatasetRegistry: '',
    AttributionManager: '',
    Marketplace: '',
    FilecoinDealClient: '',
    DataDAO: ''
  }
};

// Contract configurations with ABIs
export const contracts = {
  DatasetRegistry: {
    address: addresses[defaultNetwork].DatasetRegistry,
    abi: DatasetRegistryABI
  },
  AttributionManager: {
    address: addresses[defaultNetwork].AttributionManager,
    abi: AttributionManagerABI
  },
  Marketplace: {
    address: addresses[defaultNetwork].Marketplace,
    abi: MarketplaceABI
  },
  FilecoinDealClient: {
    address: addresses[defaultNetwork].FilecoinDealClient,
    abi: FilecoinDealClientABI
  },
  DataDAO: {
    address: addresses[defaultNetwork].DataDAO,
    abi: DataDAOABI
  }
};

export const getContractAddress = (contractName, networkId = defaultNetwork) => {
  return addresses[networkId][contractName];
};

export default contracts;
