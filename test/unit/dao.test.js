const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../fixtures/contracts");
const { getUsers } = require("../fixtures/users");

describe("DataDAO", function() {
  let dataDAO, datasetRegistry, verificationRegistry;
  let owner, provider1, provider2, developer1, developer2;
  
  beforeEach(async function() {
    // Deploy contracts
    const contracts = await deployContracts();
    dataDAO = contracts.dataDAO;
    datasetRegistry = contracts.datasetRegistry;
    verificationRegistry = contracts.verificationRegistry;
    
    // Get test accounts
    const users = await getUsers();
    owner = users.owner;
    provider1 = users.provider1;
    provider2 = users.provider2;
    developer1 = users.developer1;
    developer2 = users.developer2;
  });

  describe("Proposal Creation", function() {
    it("should create a new proposal", async function() {
      const title = "Update verification requirements";
      const description = "Proposal to update dataset verification criteria";
      const votingPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
      
      // Encode function call data (example: updating min verification threshold)
      const data = verificationRegistry.interface.encodeFunctionData(
        "setMinVerificationThreshold",
        [80] // New threshold value
      );
      
      const tx = await dataDAO.connect(provider1).createProposal(
        title,
        description,
        verificationRegistry.address,
        data,
        votingPeriod
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ProposalCreated");
      expect(event).to.not.be.undefined;
      
      const proposalId = event.args.proposalId;
      
      // Check proposal data
      const proposal = await dataDAO.getProposal(proposalId);
      expect(proposal.title).to.equal(title);
      expect(proposal.description).to.equal(description);
      expect(proposal.proposer).to.equal(provider1.address);
      expect(proposal.executed).to.be.false;
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(0);
    });
    
    it("should require minimum voting period", async function() {
      const shortPeriod = 3600; // 1 hour (too short)
      
      await expect(
        dataDAO.connect(provider1).createProposal(
          "Test Proposal",
          "Description",
          verificationRegistry.address,
          "0x",
          shortPeriod
        )
      ).to.be.revertedWith("Voting period too short");
    });
  });
  
  describe("Voting", function() {
    let proposalId;
    
    beforeEach(async function() {
      // Create a proposal
      const data = verificationRegistry.interface.encodeFunctionData(
        "setMinVerificationThreshold",
        [80]
      );
      
      const tx = await dataDAO.connect(provider1).createProposal(
        "Test Proposal",
        "Description",
        verificationRegistry.address,
        data,
        7 * 24 * 60 * 60
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ProposalCreated");
      proposalId = event.args.proposalId;
    });
    
    it("should allow casting a vote", async function() {
      // Vote in favor
      await dataDAO.connect(developer1).castVote(proposalId, true);
      
      // Check vote was recorded
      const proposal = await dataDAO.getProposal(proposalId);
      expect(proposal.votesFor).to.equal(1);
      expect(proposal.votesAgainst).to.equal(0);
      
      // Check voter status
      const hasVoted = await dataDAO.hasVoted(proposalId, developer1.address);
      expect(hasVoted).to.be.true;
    });
    
    it("should allow voting against", async function() {
      // Vote against
      await dataDAO.connect(developer2).castVote(proposalId, false);
      
      // Check vote was recorded
      const proposal = await dataDAO.getProposal(proposalId);
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(1);
    });
    
    it("should not allow double voting", async function() {
      // Vote once
      await dataDAO.connect(provider2).castVote(proposalId, true);
      
      // Try to vote again
      await expect(
        dataDAO.connect(provider2).castVote(proposalId, false)
      ).to.be.revertedWith("Already voted");
    });
    
    it("should not allow voting on expired proposals", async function() {
      // Create a proposal with short voting period
      const data = "0x";
      const tx = await dataDAO.connect(provider1).createProposal(
        "Short Proposal",
        "Description",
        verificationRegistry.address,
        data,
        2 * 24 * 60 * 60 // 2 days
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ProposalCreated");
      const shortProposalId = event.args.proposalId;
      
      // Advance time past voting period
      await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]); // 3 days
      await ethers.provider.send("evm_mine", []);
      
      // Try to vote
      await expect(
        dataDAO.connect(developer1).castVote(shortProposalId, true)
      ).to.be.revertedWith("Voting period has ended");
    });
  });
  
  describe("Proposal Execution", function() {
    let proposalId;
    
    beforeEach(async function() {
      // Create a proposal to change verification threshold
      const data = verificationRegistry.interface.encodeFunctionData(
        "setMinVerificationThreshold",
        [80]
      );
      
      const tx = await dataDAO.connect(provider1).createProposal(
        "Change Threshold",
        "Update verification threshold to 80%",
        verificationRegistry.address,
        data,
        7 * 24 * 60 * 60
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ProposalCreated");
      proposalId = event.args.proposalId;
      
      // Vote in favor (multiple votes to pass threshold)
      await dataDAO.connect(provider1).castVote(proposalId, true);
      await dataDAO.connect(provider2).castVote(proposalId, true);
      await dataDAO.connect(developer1).castVote(proposalId, true);
    });
    
    it("should execute successful proposals", async function() {
      // End voting period
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]); // 8 days
      await ethers.provider.send("evm_mine", []);
      
      // Get initial threshold
      const initialThreshold = await verificationRegistry.minVerificationThreshold();
      
      // Execute proposal
      await dataDAO.connect(owner).executeProposal(proposalId);
      
      // Check proposal was executed
      const proposal = await dataDAO.getProposal(proposalId);
      expect(proposal.executed).to.be.true;
      
      // Verify target contract was updated
      const newThreshold = await verificationRegistry.minVerificationThreshold();
      expect(newThreshold).to.equal(80);
      expect(newThreshold).to.not.equal(initialThreshold);
    });
    
    it("should not execute proposals with insufficient votes", async function() {
      // Create a proposal
      const data = "0x";
      const tx = await dataDAO.connect(provider1).createProposal(
        "Low Support Proposal",
        "Description",
        verificationRegistry.address,
        data,
        7 * 24 * 60 * 60
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ProposalCreated");
      const lowSupportProposalId = event.args.proposalId;
      
      // Only one vote (not enough to pass)
      await dataDAO.connect(provider1).castVote(lowSupportProposalId, true);
      
      // End voting period
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]); // 8 days
      await ethers.provider.send("evm_mine", []);
      
      // Try to execute
      await expect(
        dataDAO.connect(owner).executeProposal(lowSupportProposalId)
      ).to.be.revertedWith("Proposal did not pass");
    });
    
    it("should not execute proposals during voting period", async function() {
      // Try to execute too early
      await expect(
        dataDAO.connect(owner).executeProposal(proposalId)
      ).to.be.revertedWith("Voting period has not ended");
    });
    
    it("should not execute already executed proposals", async function() {
      // End voting period
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]); // 8 days
      await ethers.provider.send("evm_mine", []);
      
      // Execute proposal
      await dataDAO.connect(owner).executeProposal(proposalId);
      
      // Try to execute again
      await expect(
        dataDAO.connect(owner).executeProposal(proposalId)
      ).to.be.revertedWith("Proposal already executed");
    });
  });
});
