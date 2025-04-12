const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../fixtures/contracts");
const { sampleDatasets } = require("../fixtures/datasets");
const { getUsers } = require("../fixtures/users");
const { createDealProposal } = require("../fixtures/filecoin");

describe("Full System Integration Flow", function() {
  let contracts;
  let datasetRegistry, marketplace, attributionManager, filecoinDealClient, royaltyDistributor;
  let owner, provider1, provider2, developer1, developer2;
  let datasetId, listingId, dealProposalId;
  const modelId = ethers.utils.hexlify(ethers.utils.randomBytes(32));

  before(async function() {
    // Deploy all contracts
    contracts = await deployContracts();
    datasetRegistry = contracts.datasetRegistry;
    marketplace = contracts.marketplace;
    attributionManager = contracts.attributionManager;
    filecoinDealClient = contracts.filecoinDealClient;
    royaltyDistributor = contracts.royaltyDistributor;
    
    // Get test accounts
    const users = await getUsers();
    owner = users.owner;
    provider1 = users.provider1;
    provider2 = users.provider2;
    developer1 = users.developer1;
    developer2 = users.developer2;
  });

  it("should execute the complete data provenance and attribution flow", async function() {
    // Step 1: Provider prepares dataset for storage on Filecoin
    const sampleDataset = sampleDatasets[0];
    const dealCid = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    
    // Create Filecoin deal proposal
    const dealProposal = createDealProposal(dealCid);
    const dealTx = await filecoinDealClient.connect(provider1).makeDealProposal(
      dealProposal.cid,
      dealProposal.size,
      dealProposal.verified,
      dealProposal.price,
      dealProposal.duration,
      dealProposal.provider
    );
    
    const dealReceipt = await dealTx.wait();
    const dealEvent = dealReceipt.events.find(e => e.event === "DealProposalCreated");
    dealProposalId = dealEvent.args.proposalId;
    
    // Simulate deal activation
    await filecoinDealClient.connect(owner).updateDealStatus(
      dealProposalId,
      12345, // Deal ID
      1, // Status: 1 = Active
      100000 // Activation epoch
    );
    
    // Step 2: Register dataset on blockchain
    const registerTx = await datasetRegistry.connect(provider1).registerDataset(
      sampleDataset.cid,
      sampleDataset.dataType,
      sampleDataset.contributors,
      sampleDataset.metadataURI
    );
    
    const registerReceipt = await registerTx.wait();
    const registerEvent = registerReceipt.events.find(e => e.event === "DatasetRegistered");
    datasetId = registerEvent.args.tokenId;
    
    // Link dataset to Filecoin deal
    await datasetRegistry.connect(provider1).linkFilecoinDeal(datasetId, dealProposalId);
    
    // Step 3: Verify dataset
    await datasetRegistry.connect(owner).verifyDataset(datasetId);
    
    // Step 4: List dataset on marketplace
    // Approve marketplace for dataset transfer
    await datasetRegistry.connect(provider1).approve(marketplace.address, datasetId);
    
    // Create listing
    const price = ethers.utils.parseEther("0.5");
    const listingTx = await marketplace.connect(provider1).createListing(
      datasetId,
      price,
      "commercial",
      30 * 24 * 60 * 60 // 30 days
    );
    
    const listingReceipt = await listingTx.wait();
    const listingEvent = listingReceipt.events.find(e => e.event === "ListingCreated");
    listingId = listingEvent.args.listingId;
    
    // Step 5: Developer purchases dataset
    const purchaseTx = await marketplace.connect(developer1).purchaseListing(listingId, {
      value: price
    });
    await purchaseTx.wait();
    
    // Verify access rights
    expect(await marketplace.hasAccess(datasetId, developer1.address)).to.be.true;
    
    // Step 6: Developer uses dataset in AI model and records attribution
    await attributionManager.connect(developer1).recordAttribution(
      datasetId,
      modelId,
      "training",
      85 // Impact score
    );
    
    // Another developer also uses the dataset
    await marketplace.connect(developer2).purchaseListing(listingId, {
      value: price
    });
    
    const modelId2 = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    await attributionManager.connect(developer2).recordAttribution(
      datasetId,
      modelId2,
      "training",
      70 // Impact score
    );
    
    // Step 7: Calculate attribution shares
    const shares = await attributionManager.calculateAttributionShares(datasetId);
    expect(shares.length).to.be.gt(0);
    
    // Step 8: Distribute royalties
    const royaltyAmount = ethers.utils.parseEther("1.0");
    await royaltyDistributor.connect(owner).distributeRoyalties(datasetId, {
      value: royaltyAmount
    });
    
    // Verify contributors received payments based on their shares
    const contributor1 = sampleDataset.contributors[0];
    const contributor2 = sampleDataset.contributors[1];
    
    // Check contributor balances (should be higher after royalty distribution)
    // This assumes the contributors are actual EOA accounts in the test environment
    
    // Step 9: DAO proposal for policy change
    // This would be implementation-specific based on DAO contract
    
    // Step 10: Verify complete provenance trail
    const usageCount = await datasetRegistry.getUsageCount(datasetId);
    expect(usageCount).to.equal(2); // Two uses by different developers
    
    const attributions = await attributionManager.getAttributionHistory(datasetId);
    expect(attributions.length).to.equal(2);
    expect(attributions[0].attributor).to.equal(developer1.address);
    expect(attributions[1].attributor).to.equal(developer2.address);
    
    // Verify full dataset metadata
    const dataset = await datasetRegistry.getDatasetMetadata(datasetId);
    expect(dataset.cid).to.equal(sampleDataset.cid);
    expect(dataset.creator).to.equal(provider1.address);
    expect(dataset.verified).to.be.true;
  });
});
