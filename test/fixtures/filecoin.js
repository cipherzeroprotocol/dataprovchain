// Sample Filecoin deal data and related structures

const sampleDeals = [
  {
    id: 1,
    provider: "f01234",
    client: "f0abcdef",
    size: 1048576, // 1MB
    price: "1000000000000000000", // 1 FIL in attoFIL
    duration: 518400, // ~180 days in epochs
    startEpoch: 100000,
    endEpoch: 618400
  },
  {
    id: 2,
    provider: "f01235",
    client: "f0abcdef",
    size: 104857600, // 100MB
    price: "5000000000000000000", // 5 FIL in attoFIL
    duration: 518400,
    startEpoch: 100000,
    endEpoch: 618400
  }
];

// Create mock deal proposal
function createDealProposal(datasetCid, size, duration) {
  return {
    cid: datasetCid,
    size: size || 1048576,
    verified: false,
    label: "deal-proposal-" + Date.now(),
    startEpoch: Math.floor(Date.now() / 30000) + 100, // Current epoch + 100
    endEpoch: Math.floor(Date.now() / 30000) + 100 + (duration || 518400),
    price: "1000000000000000000",
    provider: "f01234",
    dealClientAddress: "f0123456"
  };
}

module.exports = {
  sampleDeals,
  createDealProposal
};
