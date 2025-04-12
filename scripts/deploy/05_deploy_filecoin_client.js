// scripts/deploy/05_deploy_filecoin_client.js

const { ethers } = require('hardhat');
const { saveDeployment, getDeployedAddress, getDeployer, verifyContract } = require('../utils/contract_utils');

async function main() {
  console.log('Deploying FilecoinDealClient contract...');
  
  // Check if already deployed
  const existingAddress = await getDeployedAddress('FilecoinDealClient');
  if (existingAddress) {
    console.log(`FilecoinDealClient already deployed at: ${existingAddress}`);
    return existingAddress;
  }
  
  // Get deployer account
  const deployer = await getDeployer();
  console.log(`Deploying from account: ${deployer.address}`);
  
  // Deploy contract
  const FilecoinDealClient = await ethers.getContractFactory('FilecoinDealClient');
  const args = []; // No constructor args
  const client = await FilecoinDealClient.deploy(...args);
  
  await client.deployed();
  console.log(`FilecoinDealClient deployed to: ${client.address}`);
  
  // Save deployment info
  await saveDeployment('FilecoinDealClient', client.address, args);
  
  // Verify contract
  await verifyContract(client.address, args);
  
  return client.address;
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