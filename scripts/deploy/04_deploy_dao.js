// scripts/deploy/04_deploy_dao.js

const { ethers } = require('hardhat');
const { saveDeployment, getDeployedAddress, getDeployer, verifyContract } = require('../utils/contract_utils');

async function main() {
  console.log('Deploying DataDAO contract...');
  
  // Check if already deployed
  const existingAddress = await getDeployedAddress('DataDAO');
  if (existingAddress) {
    console.log(`DataDAO already deployed at: ${existingAddress}`);
    return existingAddress;
  }
  
  // Get deployer account
  const deployer = await getDeployer();
  console.log(`Deploying from account: ${deployer.address}`);
  
  // Deploy contract
  const DataDAO = await ethers.getContractFactory('DataDAO');
  const minProposalPower = 10; // Minimum voting power to create proposals
  const quorumPercentage = 5000; // 50% quorum in basis points
  const args = [minProposalPower, quorumPercentage];
  const dao = await DataDAO.deploy(...args);
  
  await dao.deployed();
  console.log(`DataDAO deployed to: ${dao.address}`);
  
  // Save deployment info
  await saveDeployment('DataDAO', dao.address, args);
  
  // Verify contract
  await verifyContract(dao.address, args);
  
  return dao.address;
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