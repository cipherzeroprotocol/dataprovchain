const { ethers, upgrades } = require("hardhat");

// Deploy all contracts for testing
async function deployContracts() {
  const [owner] = await ethers.getSigners();

  // Deploy data types library
  const DataTypesFactory = await ethers.getContractFactory("DataTypes");
  const dataTypes = await DataTypesFactory.deploy();
  await dataTypes.deployed();

  // Deploy provenance utils
  const ProvenanceUtilsFactory = await ethers.getContractFactory("ProvenanceUtils", {
    libraries: {
      DataTypes: dataTypes.address
    }
  });
  const provenanceUtils = await ProvenanceUtilsFactory.deploy();
  await provenanceUtils.deployed();

  // Deploy Filecoin helper
  const FilecoinHelperFactory = await ethers.getContractFactory("FilecoinHelper");
  const filecoinHelper = await FilecoinHelperFactory.deploy();
  await filecoinHelper.deployed();

  // Deploy DatasetRegistry
  const DatasetRegistryFactory = await ethers.getContractFactory("DatasetRegistry", {
    libraries: {
      DataTypes: dataTypes.address,
      ProvenanceUtils: provenanceUtils.address
    }
  });
  const datasetRegistry = await DatasetRegistryFactory.deploy();
  await datasetRegistry.deployed();

  // Deploy Attribution Manager
  const AttributionManagerFactory = await ethers.getContractFactory("AttributionManager", {
    libraries: {
      DataTypes: dataTypes.address
    }
  });
  const attributionManager = await AttributionManagerFactory.deploy(datasetRegistry.address);
  await attributionManager.deployed();

  // Deploy Marketplace
  const MarketplaceFactory = await ethers.getContractFactory("Marketplace", {
    libraries: {
      DataTypes: dataTypes.address
    }
  });
  const marketplace = await MarketplaceFactory.deploy(datasetRegistry.address);
  await marketplace.deployed();

  // Deploy Filecoin Deal Client
  const FilecoinDealClientFactory = await ethers.getContractFactory("FilecoinDealClient", {
    libraries: {
      FilecoinHelper: filecoinHelper.address,
      DataTypes: dataTypes.address
    }
  });
  const filecoinDealClient = await FilecoinDealClientFactory.deploy();
  await filecoinDealClient.deployed();

  // Deploy Royalty Distributor
  const RoyaltyDistributorFactory = await ethers.getContractFactory("RoyaltyDistributor", {
    libraries: {
      DataTypes: dataTypes.address
    }
  });
  const royaltyDistributor = await RoyaltyDistributorFactory.deploy(datasetRegistry.address, attributionManager.address);
  await royaltyDistributor.deployed();

  // Deploy Verification Registry
  const VerificationRegistryFactory = await ethers.getContractFactory("VerificationRegistry");
  const verificationRegistry = await VerificationRegistryFactory.deploy(datasetRegistry.address);
  await verificationRegistry.deployed();

  // Deploy DataDAO
  const DataDAOFactory = await ethers.getContractFactory("DataDAO");
  const dataDAO = await DataDAOFactory.deploy(datasetRegistry.address, verificationRegistry.address);
  await dataDAO.deployed();

  // Grant roles if needed
  await datasetRegistry.grantVerifierRole(verificationRegistry.address);
  await datasetRegistry.grantVerifierRole(owner.address);

  return {
    dataTypes,
    provenanceUtils,
    filecoinHelper,
    datasetRegistry,
    attributionManager,
    marketplace,
    filecoinDealClient,
    royaltyDistributor,
    verificationRegistry,
    dataDAO
  };
}

module.exports = {
  deployContracts
};
