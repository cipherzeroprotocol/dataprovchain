// scripts/seed/sample_listings.js

const { ethers } = require('hardhat');
const { getDeployedAddress } = require('../utils/contract_utils');

async function main() {
  console.log('Seeding sample marketplace listings...');
  
  // Get signers
  const [deployer, user1, user2, user3] = await ethers.getSigners();
  
  // Get DatasetRegistry contract
  const registryAddress = await getDeployedAddress('DatasetRegistry');
  if (!registryAddress) {
    console.error('DatasetRegistry contract not deployed');
    return;
  }
  const registry = await ethers.getContractAt('DatasetRegistry', registryAddress);
  
  // Get Marketplace contract
  const marketplaceAddress = await getDeployedAddress('Marketplace');
  if (!marketplaceAddress) {
    console.error('Marketplace contract not deployed');
    return;
  }
  const marketplace = await ethers.getContractAt('Marketplace', marketplaceAddress);
  
  // Sample listings with dataset IDs 1, 2, 3
  const listings = [
    {
      datasetId: 1,
      price: ethers.utils.parseEther('0.1'), // 0.1 ETH
      licenseType: 'research',
      duration: 2592000, // 30 days in seconds
      user: user1 // Owner of dataset 1
    },
    {
      datasetId: 2,
      price: ethers.utils.parseEther('0.2'), // 0.2 ETH
      licenseType: 'commercial',
      duration: 7776000, // 90 days in seconds
      user: user1 // Owner of dataset 2
    },
    {
      datasetId: 3,
      price: ethers.utils.parseEther('0.05'), // 0.05 ETH
      licenseType: 'research',
      duration: 2592000, // 30 days in seconds
      user: user2 // Owner of dataset 3
    }
  ];
  
  // Create each listing
  for (const listing of listings) {
    console.log(`Creating listing for dataset ID: ${listing.datasetId}`);
    
    try {
      // Connect to marketplace contract as the dataset owner
      const userMarketplace = marketplace.connect(listing.user);
      
      // Create listing
      const tx = await userMarketplace.createListing(
        listing.datasetId,
        listing.price,
        listing.licenseType,
        listing.duration
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === 'ListingCreated');
      const listingId = event.args.listingId;
      
      console.log(`Listing created with ID: ${listingId}`);
      
      // Purchase a listing (for demo purposes)
      if (listing.datasetId === 3) {
        console.log(`Demo purchase of listing ID: ${listingId}`);
        
        // Connect as user3
        const buyerMarketplace = marketplace.connect(user3);
        
        // Purchase listing
        const purchaseTx = await buyerMarketplace.purchaseListing(listingId, {
          value: listing.price
        });
        
        const purchaseReceipt = await purchaseTx.wait();
        console.log(`Listing purchased by ${user3.address}`);
      }
    } catch (error) {
      console.error(`Error creating listing for dataset ${listing.datasetId}:`, error);
    }
  }
  
  console.log('Sample marketplace listings seeded successfully');
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