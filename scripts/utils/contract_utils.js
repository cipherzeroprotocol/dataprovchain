// scripts/utils/contract_utils.js

const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

// Path to deployment info file
const deploymentFilePath = path.join(__dirname, '../../deployments.json');

/**
 * Saves deployment information to a JSON file
 * @param {string} contractName - Name of the contract
 * @param {string} contractAddress - Address of the deployed contract
 * @param {Object} args - Constructor arguments
 */
async function saveDeployment(contractName, contractAddress, args = []) {
  let deployments = {};
  
  // Try to read existing deployments
  try {
    if (fs.existsSync(deploymentFilePath)) {
      const data = fs.readFileSync(deploymentFilePath, 'utf8');
      deployments = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading deployment file:', error);
  }
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === 'unknown' ? 'localhost' : network.name;
  
  // Initialize network object if it doesn't exist
  if (!deployments[networkName]) {
    deployments[networkName] = {};
  }
  
  // Save deployment info
  deployments[networkName][contractName] = {
    address: contractAddress,
    args: args,
    timestamp: Date.now()
  };
  
  // Write to file
  fs.writeFileSync(
    deploymentFilePath,
    JSON.stringify(deployments, null, 2)
  );
  
  console.log(`Deployment info saved for ${contractName} at ${contractAddress}`);
}

/**
 * Retrieves a deployed contract address
 * @param {string} contractName - Name of the contract
 * @returns {string|null} - Address of the deployed contract or null if not found
 */
async function getDeployedAddress(contractName) {
  // Try to read deployments file
  try {
    if (fs.existsSync(deploymentFilePath)) {
      const data = fs.readFileSync(deploymentFilePath, 'utf8');
      const deployments = JSON.parse(data);
      
      // Get network info
      const network = await ethers.provider.getNetwork();
      const networkName = network.name === 'unknown' ? 'localhost' : network.name;
      
      // Return the deployed address if it exists
      if (deployments[networkName] && deployments[networkName][contractName]) {
        return deployments[networkName][contractName].address;
      }
    }
  } catch (error) {
    console.error('Error reading deployment file:', error);
  }
  
  return null;
}

/**
 * Returns the deployer account
 */
async function getDeployer() {
  const [deployer] = await ethers.getSigners();
  return deployer;
}

/**
 * Handles verification on Etherscan
 * Note: This requires the @nomicfoundation/hardhat-verify plugin
 * @param {string} contractAddress - Address of the deployed contract
 * @param {Array} args - Constructor arguments
 */
async function verifyContract(contractAddress, args = []) {
  // Only verify if ETHERSCAN_API_KEY is set
  if (process.env.ETHERSCAN_API_KEY) {
    try {
      console.log(`Verifying contract at ${contractAddress}`);
      // In ethers v6 with hardhat, we need to access the hre object directly
      const hre = require('hardhat');
      await hre.run('verify:verify', {
        address: contractAddress,
        constructorArguments: args,
      });
      console.log('Contract verification successful');
    } catch (error) {
      console.warn('Contract verification failed:', error);
    }
  } else {
    console.log('Skipping contract verification (no ETHERSCAN_API_KEY)');
  }
}

module.exports = {
  saveDeployment,
  getDeployedAddress,
  getDeployer,
  verifyContract
};