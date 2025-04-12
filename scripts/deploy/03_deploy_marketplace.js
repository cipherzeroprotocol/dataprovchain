// scripts/deploy/03_deploy_marketplace.js

const { ethers } = require('hardhat');
const { saveDeployment, getDeployedAddress, getDeployer, verifyContract } = require('../utils/contract_utils');
const deployRegistry = require('./01_deploy_registry');
const deployAttribution = require('./02_deploy_attribution');

async function main() {
  console.log('Deploying Marketplace contract...');
  
  // Check if already deployed
  const existingAddress = await getDeployedAddress('Marketplace');
  if (existingAddress) {
    console.log(`Marketplace already deployed at: ${existingAddress}`);
    return existingAddress;
  }
  
  // Get deployer account
  const deployer = await getDeployer();
  console.log(`Deploying from account: ${deployer.address}`);
  
  // Make sure DatasetRegistry is deployed
  let registryAddress = await getDeployedAddress('DatasetRegistry');
  if (!registryAddress) {
    console.log('DatasetRegistry not found, deploying...');
    registryAddress = await deployRegistry();
  }
  
  // Make sure AttributionManager is deployed
  let attributionAddress = await getDeployedAddress('AttributionManager');
  if (!attributionAddress) {
    console.log('AttributionManager not found, deploying...');
    attributionAddress = await deployAttribution();
  }
  
  // Deploy contract
  const Marketplace = await ethers.getContractFactory('Marketplace');
  const args = [registryAddress, attributionAddress, deployer.address]; // Constructor args: datasetRegistry, attributionManager, platformFeeCollector
  const marketplace = await Marketplace.deploy(...args);
  
  await marketplace.deployed();
  console.log(`Marketplace deployed to: ${marketplace.address}`);
  
  // Save deployment info
  await saveDeployment('Marketplace', marketplace.address, args);
  
  // Verify contract
  await verifyContract(marketplace.address, args);
  
  return marketplace.address;
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