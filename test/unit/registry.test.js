const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../fixtures/contracts");
const { sampleDatasets } = require("../fixtures/datasets");
const { getUsers } = require("../fixtures/users");

describe("DatasetRegistry", function() {
  let datasetRegistry;
  let owner, provider1, provider2;
  let sampleDataset;

  beforeEach(async function() {
    // Deploy contracts
    const contracts = await deployContracts();
    datasetRegistry = contracts.datasetRegistry;
    
    // Get test accounts
    const users = await getUsers();
    owner = users.owner;
    provider1 = users.provider1;
    provider2 = users.provider2;
    
    // Set up sample dataset
    sampleDataset = sampleDatasets[0];
  });

  describe("Dataset Registration", function() {
    it("should register a new dataset", async function() {
      const tx = await datasetRegistry.connect(provider1).registerDataset(
        sampleDataset.cid,
        sampleDataset.dataType,
        sampleDataset.contributors,
        sampleDataset.metadataURI
      );
      
      // Wait for transaction
      const receipt = await tx.wait();
      
      // Check for event
      const event = receipt.events.find(e => e.event === "DatasetRegistered");
      expect(event).to.not.be.undefined;
      
      // Get the dataset ID from the event
      const datasetId = event.args.tokenId;
      
      // Check dataset data
      const dataset = await datasetRegistry.getDatasetMetadata(datasetId);
      expect(dataset.cid).to.equal(sampleDataset.cid);
      expect(dataset.dataType).to.equal(sampleDataset.dataType);
      expect(dataset.creator).to.equal(provider1.address);
      expect(dataset.metadataURI).to.equal(sampleDataset.metadataURI);
      expect(dataset.verified).to.be.false;
    });
    
    it("should assign the correct creator", async function() {
      const tx = await datasetRegistry.connect(provider2).registerDataset(
        sampleDataset.cid,
        sampleDataset.dataType,
        sampleDataset.contributors,
        sampleDataset.metadataURI
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "DatasetRegistered");
      const datasetId = event.args.tokenId;
      
      // Check creator
      const dataset = await datasetRegistry.getDatasetMetadata(datasetId);
      expect(dataset.creator).to.equal(provider2.address);
      
      // Check ownership
      expect(await datasetRegistry.ownerOf(datasetId)).to.equal(provider2.address);
    });
    
    it("should not allow registration with empty CID", async function() {
      await expect(
        datasetRegistry.connect(provider1).registerDataset(
          "",
          sampleDataset.dataType,
          sampleDataset.contributors,
          sampleDataset.metadataURI
        )
      ).to.be.revertedWith("CID cannot be empty");
    });
  });
  
  describe("Dataset Verification", function() {
    let datasetId;
    
    beforeEach(async function() {
      // Register a dataset first
      const tx = await datasetRegistry.connect(provider1).registerDataset(
        sampleDataset.cid,
        sampleDataset.dataType,
        sampleDataset.contributors,
        sampleDataset.metadataURI
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "DatasetRegistered");
      datasetId = event.args.tokenId;
    });
    
    it("should allow owner to verify a dataset", async function() {
      await datasetRegistry.connect(owner).verifyDataset(datasetId);
      
      const dataset = await datasetRegistry.getDatasetMetadata(datasetId);
      expect(dataset.verified).to.be.true;
    });
    
    it("should emit DatasetVerified event", async function() {
      await expect(datasetRegistry.connect(owner).verifyDataset(datasetId))
        .to.emit(datasetRegistry, "DatasetVerified")
        .withArgs(datasetId);
    });
    
    it("should not allow non-verifiers to verify a dataset", async function() {
      await expect(
        datasetRegistry.connect(provider2).verifyDataset(datasetId)
      ).to.be.revertedWith("Caller is not a verifier");
    });
    
    it("should not allow verification of non-existent dataset", async function() {
      const nonExistentId = 9999;
      await expect(
        datasetRegistry.connect(owner).verifyDataset(nonExistentId)
      ).to.be.reverted;
    });
  });
  
  describe("Usage Recording", function() {
    let datasetId;
    
    beforeEach(async function() {
      // Register a dataset first
      const tx = await datasetRegistry.connect(provider1).registerDataset(
        sampleDataset.cid,
        sampleDataset.dataType,
        sampleDataset.contributors,
        sampleDataset.metadataURI
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "DatasetRegistered");
      datasetId = event.args.tokenId;
    });
    
    it("should record dataset usage", async function() {
      await datasetRegistry.connect(provider2).recordUsage(datasetId);
      
      // Check usage count
      const usageCount = await datasetRegistry.getUsageCount(datasetId);
      expect(usageCount).to.equal(1);
    });
    
    it("should emit UsageRecorded event", async function() {
      await expect(datasetRegistry.connect(provider2).recordUsage(datasetId))
        .to.emit(datasetRegistry, "UsageRecorded")
        .withArgs(datasetId, provider2.address);
    });
    
    it("should increment usage count correctly", async function() {
      await datasetRegistry.connect(provider2).recordUsage(datasetId);
      await datasetRegistry.connect(owner).recordUsage(datasetId);
      await datasetRegistry.connect(provider1).recordUsage(datasetId);
      
      const usageCount = await datasetRegistry.getUsageCount(datasetId);
      expect(usageCount).to.equal(3);
    });
  });
});
