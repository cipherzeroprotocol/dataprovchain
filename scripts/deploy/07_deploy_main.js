// scripts/deploy/07_deploy_main.js

const { ethers } = require('hardhat');
const { saveDeployment, getDeployedAddress, getDeployer, verifyContract } = require('../utils/contract_utils');
const deployRegistry = require('./01_deploy_registry');
const deployAttribution = require('./02_deploy_attribution');
const deployMarketplace = require('./03_deploy_marketplace');
const deployDAO = require('./04_deploy_dao');
const deployFilecoinClient = require('./05_deploy_filecoin_client');
const deployRoyalty = require('./06_deploy_royalty');

async function main() {
  console.log('Deploying DataProvChain contract...');
  
  // Check if already deployed
  const existingAddress = await getDeployedAddress('DataProvChain');
  if (existingAddress) {
    console.log(`DataProvChain already deployed at: ${existingAddress}`);
    return existingAddress;
  }
  
  // Get deployer account
  const deployer = await getDeployer();
  console.log(`Deploying from account: ${deployer.address}`);
  
  // Make sure all dependencies are deployed
  let registryAddress = await getDeployedAddress('DatasetRegistry');
  if (!registryAddress) {
    console.log('DatasetRegistry not found, deploying...');
    registryAddress = await deployRegistry();
  }
  
  let attributionAddress = await getDeployedAddress('AttributionManager');
  if (!attributionAddress) {
    console.log('AttributionManager not found, deploying...');
    attributionAddress = await deployAttribution();
  }
  
  let marketplaceAddress = await getDeployedAddress('Marketplace');
  if (!marketplaceAddress) {
    console.log('Marketplace not found, deploying...');
    marketplaceAddress = await deployMarketplace();
  }
  
  let daoAddress = await getDeployedAddress('DataDAO');
  if (!daoAddress) {
    console.log('DataDAO not found, deploying...');
    daoAddress = await deployDAO();
  }
  
  let filecoinClientAddress = await getDeployedAddress('FilecoinDealClient');
  if (!filecoinClientAddress) {
    console.log('FilecoinDealClient not found, deploying...');
    filecoinClientAddress = await deployFilecoinClient();
  }
  
  let royaltyAddress = await getDeployedAddress('RoyaltyDistributor');
  if (!royaltyAddress) {
    console.log('RoyaltyDistributor not found, deploying...');
    royaltyAddress = await deployRoyalty();
  }
  
  // Deploy the main contract
  const DataProvChain = await ethers.getContractFactory('DataProvChain');
  const args = []; // No constructor args
  const dataProvChain = await DataProvChain.deploy(...args);
  
  await dataProvChain.deployed();
  console.log(`DataProvChain deployed to: ${dataProvChain.address}`);
  
  // Initialize the contract with all component addresses
  console.log('Initializing DataProvChain with component addresses...');
  await dataProvChain.initialize(
    registryAddress,
    attributionAddress,
    marketplaceAddress,
    daoAddress,
    filecoinClientAddress,
    deployer.address // Fee collector
  );
  console.log('DataProvChain initialized');
  
  // Save deployment info
  await saveDeployment('DataProvChain', dataProvChain.address, args);
  
  // Verify contract
  await verifyContract(dataProvChain.address, args);
  
  return dataProvChain.address;
}

// Execute deployment if directly run
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;