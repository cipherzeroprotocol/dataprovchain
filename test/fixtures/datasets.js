const { ethers } = require("hardhat");

// Sample dataset metadata
const sampleDatasets = [
  {
    name: "ImageNet Subset",
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    dataType: "image",
    contributors: ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"],
    contributorShares: [70, 30],
    metadataURI: "ipfs://bafybeihkurbbjxs5d5eo5dsillf5bouxpqxq64qnr56f5qtajqezbs5oga/metadata.json",
    license: "CC-BY-4.0",
    price: ethers.utils.parseEther("0.5"),
    verified: false
  },
  {
    name: "Text Classification Dataset",
    cid: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
    dataType: "text",
    contributors: ["0x90F79bf6EB2c4f870365E785982E1f101E93b906"],
    contributorShares: [100],
    metadataURI: "ipfs://bafybeihkurbbjxs5d5eo5dsadlf5bouxpqxq64qnr56f5qtajqezbs5ogb/metadata.json",
    license: "MIT",
    price: ethers.utils.parseEther("0.3"),
    verified: true
  },
  {
    name: "Audio Recognition Dataset",
    cid: "bafybeiecplh4wg54xseetxfwsuqdvpsgwviyhogfdcutmm64orxsb7j7nm",
    dataType: "audio",
    contributors: ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "0x90F79bf6EB2c4f870365E785982E1f101E93b906"],
    contributorShares: [40, 30, 30],
    metadataURI: "ipfs://bafybeihkurbbjxs5d5eo5dsillf5bouxpqxq64qnr56f5qtajqezbs5ogc/metadata.json",
    license: "CC-BY-SA-4.0",
    price: ethers.utils.parseEther("0.8"),
    verified: false
  }
];

module.exports = {
  sampleDatasets
};
