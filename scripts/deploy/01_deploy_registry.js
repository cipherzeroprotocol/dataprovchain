// scripts/deploy/01_deploy_registry.js

const { ethers } = require('hardhat');
const { saveDeployment, getDeployedAddress, getDeployer, verifyContract } = require('../utils/contract_utils');

async function main() {
  console.log('Deploying DatasetRegistry contract...');
  
  // Check if already deployed
  const existingAddress = await getDeployedAddress('DatasetRegistry');
  if (existingAddress) {
    console.log(`DatasetRegistry already deployed at: ${existingAddress}`);
    return existingAddress;
  }
  
  // Get deployer account
  const deployer = await getDeployer();
  console.log(`Deploying from account: ${deployer.address}`);
  
  // Deploy contract
  const DatasetRegistry = await ethers.getContractFactory('DatasetRegistry');
  const args = ['AI Dataset Provenance', 'AIDP']; // Constructor args: name, symbol
  const registry = await DatasetRegistry.deploy(...args);
  
  await registry.deployed();
  console.log(`DatasetRegistry deployed to: ${registry.address}`);
  
  // Save deployment info
  await saveDeployment('DatasetRegistry', registry.address, args);
  
  // Verify contract
  await verifyContract(registry.address, args);
  
  return registry.address;
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