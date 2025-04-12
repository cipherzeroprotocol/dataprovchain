const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../fixtures/contracts");
const { sampleDatasets } = require("../fixtures/datasets");
const { getUsers } = require("../fixtures/users");

describe("Marketplace", function() {
  let datasetRegistry, marketplace;
  let owner, provider1, developer1;
  let datasetId;
  let listingPrice = ethers.utils.parseEther("0.5");
  
  beforeEach(async function() {
    // Deploy contracts
    const contracts = await deployContracts();
    datasetRegistry = contracts.datasetRegistry;
    marketplace = contracts.marketplace;
    
    // Get test accounts
    const users = await getUsers();
    owner = users.owner;
    provider1 = users.provider1;
    developer1 = users.developer1;
    
    // Register a dataset
    const sampleDataset = sampleDatasets[0];
    const tx = await datasetRegistry.connect(provider1).registerDataset(
      sampleDataset.cid,
      sampleDataset.dataType,
      sampleDataset.contributors,
      sampleDataset.metadataURI
    );
    
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === "DatasetRegistered");
    datasetId = event.args.tokenId;
    
    // Approve marketplace to transfer dataset token
    await datasetRegistry.connect(provider1).approve(marketplace.address, datasetId);
  });

  describe("Listing Creation", function() {
    it("should create a new listing", async function() {
      const licenseType = "standard";
      const duration = 30 * 24 * 60 * 60; // 30 days in seconds
      
      const tx = await marketplace.connect(provider1).createListing(
        datasetId,
        listingPrice,
        licenseType,
        duration
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ListingCreated");
      expect(event).to.not.be.undefined;
      
      const listingId = event.args.listingId;
      
      // Check listing data
      const listing = await marketplace.getListing(listingId);
      expect(listing.datasetId).to.equal(datasetId);
      expect(listing.price).to.equal(listingPrice);
      expect(listing.licenseType).to.equal(licenseType);
      expect(listing.seller).to.equal(provider1.address);
      expect(listing.active).to.be.true;
    });
    
    it("should not allow non-owner to create listing", async function() {
      await expect(
        marketplace.connect(developer1).createListing(
          datasetId,
          listingPrice,
          "standard",
          30 * 24 * 60 * 60
        )
      ).to.be.revertedWith("Not the dataset owner");
    });
    
    it("should not allow listing with zero price", async function() {
      await expect(
        marketplace.connect(provider1).createListing(
          datasetId,
          0,
          "standard",
          30 * 24 * 60 * 60
        )
      ).to.be.revertedWith("Price must be greater than zero");
    });
  });
  
  describe("Purchasing Listings", function() {
    let listingId;
    
    beforeEach(async function() {
      // Create a listing
      const tx = await marketplace.connect(provider1).createListing(
        datasetId,
        listingPrice,
        "standard",
        30 * 24 * 60 * 60
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ListingCreated");
      listingId = event.args.listingId;
    });
    
    it("should allow purchasing a listing", async function() {
      // Check developer1 balance before purchase
      const initialBalance = await ethers.provider.getBalance(developer1.address);
      
      // Purchase the listing
      const tx = await marketplace.connect(developer1).purchaseListing(listingId, {
        value: listingPrice
      });
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ListingPurchased");
      expect(event).to.not.be.undefined;
      
      // Check event data
      expect(event.args.listingId).to.equal(listingId);
      expect(event.args.buyer).to.equal(developer1.address);
      
      // Check developer has access
      expect(await marketplace.hasAccess(datasetId, developer1.address)).to.be.true;
      
      // Check provider1 received payment (minus potential platform fee)
      const providerBalance = await ethers.provider.getBalance(provider1.address);
      expect(providerBalance).to.be.gt(initialBalance);
    });
    
    it("should not allow purchasing with insufficient payment", async function() {
      const insufficientPrice = ethers.utils.parseEther("0.4"); // Less than listing price
      
      await expect(
        marketplace.connect(developer1).purchaseListing(listingId, {
          value: insufficientPrice
        })
      ).to.be.revertedWith("Incorrect payment amount");
    });
    
    it("should not allow purchasing inactive listing", async function() {
      // Deactivate the listing
      await marketplace.connect(provider1).deactivateListing(listingId);
      
      await expect(
        marketplace.connect(developer1).purchaseListing(listingId, {
          value: listingPrice
        })
      ).to.be.revertedWith("Listing is not active");
    });
    
    it("should record dataset usage when purchased", async function() {
      // Check initial usage count
      const initialUsage = await datasetRegistry.getUsageCount(datasetId);
      
      // Purchase the listing
      await marketplace.connect(developer1).purchaseListing(listingId, {
        value: listingPrice
      });
      
      // Check updated usage count
      const updatedUsage = await datasetRegistry.getUsageCount(datasetId);
      expect(updatedUsage).to.equal(initialUsage.add(1));
    });
  });
});
