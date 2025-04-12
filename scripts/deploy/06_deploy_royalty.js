// scripts/deploy/06_deploy_royalty.js

const { ethers } = require('hardhat');
const { saveDeployment, getDeployedAddress, getDeployer, verifyContract } = require('../utils/contract_utils');
const deployRegistry = require('./01_deploy_registry');

async function main() {
  console.log('Deploying RoyaltyDistributor contract...');
  
  // Check if already deployed
  const existingAddress = await getDeployedAddress('RoyaltyDistributor');
  if (existingAddress) {
    console.log(`RoyaltyDistributor already deployed at: ${existingAddress}`);
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
  const RoyaltyDistributor = await ethers.getContractFactory('RoyaltyDistributor');
  const args = [registryAddress, deployer.address]; // Constructor args: datasetRegistry, platformFeeCollector
  const distributor = await RoyaltyDistributor.deploy(...args);
  
  await distributor.deployed();
  console.log(`RoyaltyDistributor deployed to: ${distributor.address}`);
  
  // Save deployment info
  await saveDeployment('RoyaltyDistributor', distributor.address, args);
  
  // Verify contract
  await verifyContract(distributor.address, args);
  
  return distributor.address;
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