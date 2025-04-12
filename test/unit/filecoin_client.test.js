const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../fixtures/contracts");
const { getUsers } = require("../fixtures/users");
const { createDealProposal } = require("../fixtures/filecoin");

describe("FilecoinDealClient", function() {
  let filecoinDealClient;
  let owner, provider1, developer1;
  let dealCid;
  
  beforeEach(async function() {
    // Deploy contracts
    const contracts = await deployContracts();
    filecoinDealClient = contracts.filecoinDealClient;
    
    // Get test accounts
    const users = await getUsers();
    owner = users.owner;
    provider1 = users.provider1;
    developer1 = users.developer1;
    
    // Generate a sample deal CID
    dealCid = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  });

  describe("Deal Proposals", function() {
    it("should create a deal proposal", async function() {
      const dealProposal = createDealProposal(dealCid);
      
      const tx = await filecoinDealClient.connect(provider1).makeDealProposal(
        dealProposal.cid,
        dealProposal.size,
        dealProposal.verified,
        dealProposal.price,
        dealProposal.duration,
        dealProposal.provider
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "DealProposalCreated");
      expect(event).to.not.be.undefined;
      
      // Check proposal data
      const proposalId = event.args.proposalId;
      const proposal = await filecoinDealClient.getDealProposal(proposalId);
      
      expect(proposal.client).to.equal(provider1.address);
      expect(proposal.size.toString()).to.equal(dealProposal.size.toString());
      expect(proposal.verified).to.equal(dealProposal.verified);
      expect(proposal.price).to.equal(dealProposal.price);
    });
    
    it("should validate size is not zero", async function() {
      const dealProposal = createDealProposal(dealCid);
      
      await expect(
        filecoinDealClient.connect(provider1).makeDealProposal(
          dealProposal.cid,
          0, // Zero size
          dealProposal.verified,
          dealProposal.price,
          dealProposal.duration,
          dealProposal.provider
        )
      ).to.be.revertedWith("Size must be greater than zero");
    });
    
    it("should validate deal duration", async function() {
      const dealProposal = createDealProposal(dealCid);
      
      await expect(
        filecoinDealClient.connect(provider1).makeDealProposal(
          dealProposal.cid,
          dealProposal.size,
          dealProposal.verified,
          dealProposal.price,
          10, // Too short duration
          dealProposal.provider
        )
      ).to.be.revertedWith("Deal duration too short");
    });
  });
  
  describe("Deal Status Updates", function() {
    let proposalId;
    
    beforeEach(async function() {
      // Create a deal proposal
      const dealProposal = createDealProposal(dealCid);
      
      const tx = await filecoinDealClient.connect(provider1).makeDealProposal(
        dealProposal.cid,
        dealProposal.size,
        dealProposal.verified,
        dealProposal.price,
        dealProposal.duration,
        dealProposal.provider
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "DealProposalCreated");
      proposalId = event.args.proposalId;
    });
    
    it("should update deal status", async function() {
      const dealId = 12345;
      const activationEpoch = 100000;
      
      // Update status to active
      await filecoinDealClient.connect(owner).updateDealStatus(
        proposalId,
        dealId,
        1, // Status: 1 = Active
        activationEpoch
      );
      
      // Check status was updated
      const deal = await filecoinDealClient.getDealStatus(proposalId);
      expect(deal.status).to.equal(1); // Active
      expect(deal.dealId).to.equal(dealId);
      expect(deal.activationEpoch).to.equal(activationEpoch);
    });
    
    it("should emit DealStatusUpdated event", async function() {
      const dealId = 12345;
      
      await expect(
        filecoinDealClient.connect(owner).updateDealStatus(
          proposalId,
          dealId,
          1, // Status: 1 = Active
          100000
        )
      )
        .to.emit(filecoinDealClient, "DealStatusUpdated")
        .withArgs(proposalId, dealId, 1);
    });
    
    it("should restrict deal status updates to authorized roles", async function() {
      const dealId = 12345;
      
      await expect(
        filecoinDealClient.connect(developer1).updateDealStatus(
          proposalId,
          dealId,
          1,
          100000
        )
      ).to.be.revertedWith("Not authorized");
    });
  });
});
