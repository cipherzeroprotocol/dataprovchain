// scripts/seed/sample_users.js

const { ethers } = require('hardhat');
const { getDeployedAddress } = require('../utils/contract_utils');

async function main() {
  console.log('Seeding sample users...');
  
  // Get signers
  const [deployer, user1, user2, user3] = await ethers.getSigners();
  
  // Get DataDAO contract
  const daoAddress = await getDeployedAddress('DataDAO');
  if (!daoAddress) {
    console.error('DataDAO contract not deployed');
    return;
  }
  const dataDAO = await ethers.getContractAt('DataDAO', daoAddress);
  
  // Assign voting power to users
  console.log('Assigning voting power to users...');
  await dataDAO.assignVotingPower(user1.address, 20);
  await dataDAO.assignVotingPower(user2.address, 15);
  await dataDAO.assignVotingPower(user3.address, 10);
  
  console.log(`Assigned voting power to ${user1.address}: 20`);
  console.log(`Assigned voting power to ${user2.address}: 15`);
  console.log(`Assigned voting power to ${user3.address}: 10`);
  
  console.log('Sample users seeded successfully');
}

// Execute if directly run
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;