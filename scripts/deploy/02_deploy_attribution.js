// scripts/deploy/02_deploy_attribution.js

const { ethers } = require('hardhat');
const { saveDeployment, getDeployedAddress, getDeployer, verifyContract } = require('../utils/contract_utils');
const deployRegistry = require('./01_deploy_registry');

async function main() {
  console.log('Deploying AttributionManager contract...');
  
  // Check if already deployed
  const existingAddress = await getDeployedAddress('AttributionManager');
  if (existingAddress) {
    console.log(`AttributionManager already deployed at: ${existingAddress}`);
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
  
  // Deploy contract
  const AttributionManager = await ethers.getContractFactory('AttributionManager');
  const args = [registryAddress, deployer.address]; // Constructor args: datasetRegistry, platformFeeCollector
  const attribution = await AttributionManager.deploy(...args);
  
  await attribution.deployed();
  console.log(`AttributionManager deployed to: ${attribution.address}`);
  
  // Save deployment info
  await saveDeployment('AttributionManager', attribution.address, args);
  
  // Verify contract
  await verifyContract(attribution.address, args);
  
  return attribution.address;
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