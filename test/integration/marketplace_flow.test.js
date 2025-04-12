const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../fixtures/contracts");
const { sampleDatasets } = require("../fixtures/datasets");
const { getUsers } = require("../fixtures/users");

describe("Marketplace Flow Integration", function() {
  let datasetRegistry, marketplace, attributionManager;
  let owner, provider1, provider2, developer1, developer2;
  let sampleDataset;

  beforeEach(async function() {
    // Deploy all contracts
    const contracts = await deployContracts();
    datasetRegistry = contracts.datasetRegistry;
    marketplace = contracts.marketplace;
    attributionManager = contracts.attributionManager;
    
    // Get test accounts
    const users = await getUsers();
    owner = users.owner;
    provider1 = users.provider1;
    provider2 = users.provider2;
    developer1 = users.developer1;
    developer2 = users.developer2;
    
    // Set up sample dataset
    sampleDataset = sampleDatasets[0];
  });

  it("should execute the full marketplace flow", async function() {
    // 1. Provider registers a dataset
    const registerTx = await datasetRegistry.connect(provider1).registerDataset(
      sampleDataset.cid,
      sampleDataset.dataType,
      sampleDataset.contributors,
      sampleDataset.metadataURI
    );
    
    const registerReceipt = await registerTx.wait();
    const registerEvent = registerReceipt.events.find(e => e.event === "DatasetRegistered");
    const datasetId = registerEvent.args.tokenId;
    
    // Verify dataset was registered
    const dataset = await datasetRegistry.getDatasetMetadata(datasetId);
    expect(dataset.cid).to.equal(sampleDataset.cid);
    expect(dataset.creator).to.equal(provider1.address);
    
    // 2. Admin verifies the dataset
    await datasetRegistry.connect(owner).verifyDataset(datasetId);
    
    // Check verification status
    const verifiedDataset = await datasetRegistry.getDatasetMetadata(datasetId);
    expect(verifiedDataset.verified).to.be.true;
    
    // 3. Provider approves marketplace for dataset transfer
    await datasetRegistry.connect(provider1).approve(marketplace.address, datasetId);
    
    // 4. Provider creates a listing
    const price = ethers.utils.parseEther("0.5");
    const licenseType = "commercial";
    const duration = 30 * 24 * 60 * 60; // 30 days
    
    const listingTx = await marketplace.connect(provider1).createListing(
      datasetId,
      price,
      licenseType,
      duration
    );
    
    const listingReceipt = await listingTx.wait();
    const listingEvent = listingReceipt.events.find(e => e.event === "ListingCreated");
    const listingId = listingEvent.args.listingId;
    
    // Verify listing was created
    const listing = await marketplace.getListing(listingId);
    expect(listing.datasetId).to.equal(datasetId);
    expect(listing.price).to.equal(price);
    expect(listing.seller).to.equal(provider1.address);
    
    // Record provider's balance before purchase
    const providerBalanceBefore = await ethers.provider.getBalance(provider1.address);
    
    // 5. Developer purchases the listing
    const purchaseTx = await marketplace.connect(developer1).purchaseListing(listingId, {
      value: price
    });
    
    const purchaseReceipt = await purchaseTx.wait();
    const purchaseEvent = purchaseReceipt.events.find(e => e.event === "ListingPurchased");
    
    // Verify purchase
    expect(purchaseEvent.args.buyer).to.equal(developer1.address);
    expect(purchaseEvent.args.listingId).to.equal(listingId);
    
    // 6. Check developer has access to dataset
    const hasAccess = await marketplace.hasAccess(datasetId, developer1.address);
    expect(hasAccess).to.be.true;
    
    // 7. Verify provider received payment
    const providerBalanceAfter = await ethers.provider.getBalance(provider1.address);
    expect(providerBalanceAfter).to.be.gt(providerBalanceBefore);
    
    // 8. Developer records dataset usage in a model
    const modelId = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    const usageType = "training";
    const impactScore = 85;
    
    await attributionManager.connect(developer1).recordAttribution(
      datasetId,
      modelId,
      usageType,
      impactScore
    );
    
    // 9. Verify attribution was recorded
    const attributions = await attributionManager.getAttributionHistory(datasetId);
    expect(attributions.length).to.equal(1);
    expect(attributions[0].modelId).to.equal(modelId);
    expect(attributions[0].attributor).to.equal(developer1.address);
    
    // 10. Check usage count was updated
    const usageCount = await datasetRegistry.getUsageCount(datasetId);
    expect(usageCount).to.equal(1);
  });
});
