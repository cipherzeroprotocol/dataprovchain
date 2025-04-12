const { ethers } = require("hardhat");

// Get accounts from Hardhat
async function getUsers() {
  const [owner, provider1, provider2, developer1, developer2, user1] = await ethers.getSigners();
  
  return {
    owner,     // Contract owner/admin
    provider1, // Dataset provider
    provider2, // Dataset provider
    developer1, // AI developer
    developer2, // AI developer
    user1      // Regular user
  };
}

module.exports = {
  getUsers
};
