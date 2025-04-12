const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../fixtures/contracts");
const { sampleDatasets } = require("../fixtures/datasets");
const { getUsers } = require("../fixtures/users");

describe("AttributionManager", function() {
  let datasetRegistry, attributionManager;
  let owner, provider1, developer1, developer2;
  let datasetId;
  const modelId = "0x1234567890123456789012345678901234567890123456789012345678901234";

  beforeEach(async function() {
    // Deploy contracts
    const contracts = await deployContracts();
    datasetRegistry = contracts.datasetRegistry;
    attributionManager = contracts.attributionManager;
    
    // Get test accounts
    const users = await getUsers();
    owner = users.owner;
    provider1 = users.provider1;
    developer1 = users.developer1;
    developer2 = users.developer2;
    
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
  });

  describe("Recording Attribution", function() {
    it("should record attribution for a dataset", async function() {
      const usageType = "training";
      const impactScore = 85;
      
      await attributionManager.connect(developer1).recordAttribution(
        datasetId,
        modelId,
        usageType,
        impactScore
      );
      
      // Get attribution record
      const attributions = await attributionManager.getAttributionHistory(datasetId);
      expect(attributions.length).to.equal(1);
      
      const record = attributions[0];
      expect(record.modelId).to.equal(modelId);
      expect(record.impactScore).to.equal(impactScore);
      expect(record.usageType).to.equal(usageType);
      expect(record.attributor).to.equal(developer1.address);
    });
    
    it("should emit AttributionRecorded event", async function() {
      const usageType = "validation";
      const impactScore = 70;
      
      await expect(
        attributionManager.connect(developer1).recordAttribution(
          datasetId,
          modelId,
          usageType,
          impactScore
        )
      )
        .to.emit(attributionManager, "AttributionRecorded")
        .withArgs(datasetId, modelId, developer1.address);
    });
    
    it("should validate impact score range", async function() {
      // Score too high
      await expect(
        attributionManager.connect(developer1).recordAttribution(
          datasetId,
          modelId,
          "training",
          101 // Above maximum 100
        )
      ).to.be.revertedWith("Impact score must be between 1 and 100");
      
      // Score too low
      await expect(
        attributionManager.connect(developer1).recordAttribution(
          datasetId,
          modelId,
          "training",
          0 // Below minimum 1
        )
      ).to.be.revertedWith("Impact score must be between 1 and 100");
    });
    
    it("should record multiple attributions correctly", async function() {
      // First attribution
      await attributionManager.connect(developer1).recordAttribution(
        datasetId,
        modelId,
        "training",
        85
      );
      
      // Second attribution with different model
      const modelId2 = "0x2234567890123456789012345678901234567890123456789012345678901234";
      await attributionManager.connect(developer2).recordAttribution(
        datasetId,
        modelId2,
        "inference",
        60
      );
      
      // Get attribution records
      const attributions = await attributionManager.getAttributionHistory(datasetId);
      expect(attributions.length).to.equal(2);
      
      // Check second record
      const record2 = attributions[1];
      expect(record2.modelId).to.equal(modelId2);
      expect(record2.usageType).to.equal("inference");
      expect(record2.attributor).to.equal(developer2.address);
    });
  });
  
  describe("Royalty Calculation", function() {
    beforeEach(async function() {
      // Record multiple attributions
      await attributionManager.connect(developer1).recordAttribution(
        datasetId,
        modelId,
        "training",
        80
      );
      
      const modelId2 = "0x2234567890123456789012345678901234567890123456789012345678901234";
      await attributionManager.connect(developer2).recordAttribution(
        datasetId,
        modelId2,
        "validation",
        60
      );
    });
    
    it("should calculate attribution shares correctly", async function() {
      // This test requires implementation of calculateAttributionShares function
      const shares = await attributionManager.calculateAttributionShares(datasetId);
      
      // Check that shares add up to 100%
      const totalShares = shares.reduce((sum, share) => sum + share.share, 0);
      expect(totalShares).to.equal(100);
      
      // Check that all attributors are included
      const attributors = shares.map(s => s.attributor);
      expect(attributors).to.include(developer1.address);
      expect(attributors).to.include(developer2.address);
    });
    
    it("should weight shares by impact score", async function() {
      const shares = await attributionManager.calculateAttributionShares(datasetId);
      
      // Find shares for each attributor
      const dev1Share = shares.find(s => s.attributor === developer1.address).share;
      const dev2Share = shares.find(s => s.attributor === developer2.address).share;
      
      // Developer 1 had higher impact score (80) than Developer 2 (60)
      // So Developer 1 should have a higher share
      expect(dev1Share).to.be.greaterThan(dev2Share);
    });
  });
});
