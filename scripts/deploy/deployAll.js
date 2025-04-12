/**
 * Deploy all smart contracts in sequence
 * 
 * This script runs all deployment scripts in order and
 * ensures proper contract dependency resolution.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration for different networks
const networks = {
  development: {
    name: 'localhost',
    params: '--network localhost'
  },
  testnet: {
    name: 'goerli',
    params: '--network goerli'
  },
  mainnet: {
    name: 'mainnet',
    params: '--network mainnet'
  }
};

// Get network from command line arguments or use development as default
const args = process.argv.slice(2);
const networkArg = args.find(arg => arg.startsWith('--network='));
const networkName = networkArg ? networkArg.split('=')[1] : 'development';
const network = networks[networkName] || networks.development;

console.log(`Deploying contracts to ${network.name}...`);

// Get all deployment scripts in order
const deployDir = __dirname;
const deployScripts = fs.readdirSync(deployDir)
  .filter(file => file.match(/^\d+_deploy.*\.js$/))
  .sort();

// Run each deployment script in sequence using Hardhat
deployScripts.forEach((script) => {
  const scriptPath = path.join(deployDir, script);
  console.log(`\nRunning ${script}...`);
  
  try {
    // Using npx hardhat run to ensure proper Hardhat context
    const command = `npx hardhat run ${scriptPath} ${network.params}`;
    execSync(command, { stdio: 'inherit', cwd: path.resolve(__dirname, '../..') });
    console.log(`✅ ${script} completed successfully`);
  } catch (error) {
    console.error(`❌ Error in ${script}:`);
    process.exit(1);
  }
});

console.log('\n✅ All contracts deployed successfully!');