/**
 * @module storage/deal
 * @description Functions for creating and managing Filecoin storage deals
 */

const { Web3Storage } = require('web3.storage');
const { ethers } = require('ethers');
const { makeRpcCall } = require('../rpc/client');
const { getDealInfo, listMiners, getCurrentEpoch, waitForMessage } = require('../rpc/methods');
const { generateCarFromData, generateCarFromDirectory, generateCarFromLargeFile } = require('../car/generator');
const config = require('../utils/config');
const cidUtils = require('../utils/cid');
const conversion = require('../utils/conversion');
const fs = require('fs');
const path = require('path');
const { CarReader } = require('@ipld/car');
const { CID } = require('multiformats/cid');
const { sha256 } = require('multiformats/hashes/sha2');
const { packToFs } = require('ipfs-car/pack/fs');
const { unpackStream } = require('ipfs-car/unpack/stream');

/**
 * Creates a new storage deal for a dataset
 * @param {Object} options - Deal options
 * @param {Buffer|String} options.data - Data to store
 * @param {String} options.name - Name of the dataset
 * @param {String} options.description - Description of the dataset
 * @param {String} options.dataType - Type of data (e.g., "image", "text")
 * @param {String} options.owner - Address of the dataset owner
 * @param {Object} [options.dealParams] - Optional deal parameters
 * @param {Number} [options.dealParams.duration] - Deal duration in epochs
 * @param {Boolean} [options.dealParams.verifiedDeal] - Whether to create a verified deal
 * @param {String} [options.dealParams.minerId] - Specific miner to target
 * @returns {Promise<Object>} - Deal information including CID and deal ID
 */
async function createStorageDeal(options) {
  try {
    // Validate options
    if (!options.data) {
      throw new Error('Data is required');
    }
    
    if (!options.name) {
      throw new Error('Dataset name is required');
    }
    
    // Get current configuration
    const configData = config.getConfig();
    
    // Prepare metadata
    const metadata = {
      name: options.name,
      description: options.description || '',
      dataType: options.dataType || 'unknown',
      owner: options.owner || configData.auth.walletAddress,
      createdAt: new Date().toISOString()
    };
    
    // Generate CAR file from data
    const carResult = await generateCarFromData(options.data, {
      metadata,
      wrapWithDirectory: true
    });
    
    // Deal parameters
    const dealParams = options.dealParams || {};
    const dealDuration = dealParams.duration || configData.storage.defaultDealDuration;
    const verifiedDeal = dealParams.verifiedDeal !== undefined 
      ? dealParams.verifiedDeal 
      : configData.storage.defaultVerifiedDeal;
    
    // Method 1: Use Web3.Storage for simple storage
    if (!dealParams.minerId) {
      return await createDealWithWeb3Storage(carResult, metadata, options);
    }
    
    // Method 2: Create a custom deal with a specific miner
    return await createCustomDeal(carResult, metadata, options);
  } catch (error) {
    throw new Error(`Failed to create storage deal: ${error.message}`);
  }
}

/**
 * Creates a storage deal using Web3.Storage
 * @private
 * @param {Object} carResult - Result from CAR file generation
 * @param {Object} metadata - Dataset metadata
 * @param {Object} options - Original deal options
 * @returns {Promise<Object>} - Deal information
 */
async function createDealWithWeb3Storage(carResult, metadata, options) {
  try {
    // Check if Web3.Storage token is available
    const token = config.getConfig().web3Storage.token;
    if (!token) {
      throw new Error('Web3Storage token is required');
    }
    
    // Create Web3.Storage client
    const web3Storage = new Web3Storage({ token });
    
    // Create file object from CAR buffer
    const file = new File([carResult.carBuffer], `${metadata.name}.car`, {
      type: 'application/car'
    });
    
    // Upload to Web3.Storage
    const rootCid = await web3Storage.put([file], {
      name: metadata.name,
      onRootCidReady: cid => {
        console.log('Root CID:', cid);
      },
      onStoredChunk: bytes => {
        console.log('Stored bytes:', bytes);
      }
    });
    
    // Get the status of the upload which includes deal information
    const status = await web3Storage.status(rootCid);
    
    // Get the deals information from the status
    let dealId = null;
    if (status && status.deals && status.deals.length > 0) {
      dealId = status.deals[0].dealId;
    }
    
    return {
      cid: rootCid,
      dealId: dealId || `web3storage-${Date.now()}`,
      provider: 'web3.storage',
      status: 'active',
      name: metadata.name,
      dataType: metadata.dataType,
      owner: metadata.owner,
      size: carResult.carSize,
      paddedSize: carResult.pieceSize,
      created: new Date().toISOString(),
      retrievalUrl: `https://${rootCid}.ipfs.dweb.link/`,
      deals: status ? status.deals : []
    };
  } catch (error) {
    throw new Error(`Failed to create deal with Web3.Storage: ${error.message}`);
  }
}

/**
 * Creates a custom storage deal with a specific miner
 * @private
 * @param {Object} carResult - Result from CAR file generation
 * @param {Object} metadata - Dataset metadata
 * @param {Object} options - Original deal options
 * @returns {Promise<Object>} - Deal information
 */
async function createCustomDeal(carResult, metadata, options) {
  try {
    // Get client address and private key from config
    const configData = config.getConfig();
    const clientAddress = options.owner || configData.auth.walletAddress;
    const privateKey = configData.auth.privateKey;
    
    if (!clientAddress || !privateKey) {
      throw new Error('Client address and private key are required for custom deals');
    }
    
    // Get deal parameters
    const dealParams = options.dealParams || {};
    const minerId = dealParams.minerId;
    
    if (!minerId) {
      throw new Error('Miner ID is required for custom deals');
    }
    
    // Ensure CAR file is saved to disk
    let carPath = carResult.path;
    if (!carPath) {
      carPath = path.join(config.ensureTempDir(), `${Date.now()}.car`);
      fs.writeFileSync(carPath, carResult.carBuffer);
    }
    
    // Get current epoch for deal timing
    const currentEpoch = await getCurrentEpoch();
    const startEpoch = currentEpoch + 2880; // Start after ~1 day (2880 epochs)
    const dealDuration = dealParams.duration || configData.storage.defaultDealDuration;
    const endEpoch = startEpoch + dealDuration;
    
    // Import the CAR file to the local Lotus node
    const importResult = await makeRpcCall('ClientImport', [{
      Path: carPath,
      IsCAR: true
    }]);
    
    if (!importResult || !importResult.Root) {
      throw new Error('Failed to import CAR file to Lotus');
    }
    
    // Calculate piece size and commitment
    const { commP, pieceSize } = await calculateCommP(carPath);
    
    // Prepare deal proposal
    const proposalParams = {
      Data: {
        TransferType: 'graphsync',
        Root: importResult.Root,
        PieceCid: commP,
        PieceSize: pieceSize
      },
      Wallet: clientAddress,
      Miner: minerId,
      EpochPrice: dealParams.price || "100000000000", // Default price in attoFIL per epoch
      MinBlocksDuration: dealDuration,
      DealStartEpoch: startEpoch,
      FastRetrieval: true,
      VerifiedDeal: dealParams.verifiedDeal
    };
    
    // Start deal proposal
    const dealCid = await makeRpcCall('ClientStartDeal', [proposalParams]);
    
    if (!dealCid) {
      throw new Error('Failed to start deal proposal');
    }
    
    // Wait for deal to be published on chain
    console.log(`Waiting for deal to be published on chain...`);
    
    // Poll for deal information
    let dealInfo = null;
    let retries = 0;
    
    while (retries < 30) {
      try {
        // Get deal information by CID
        const deals = await makeRpcCall('ClientListDeals', []);
        
        // Find our deal
        const matchedDeal = deals.find(deal => deal.ProposalCid['/'] === dealCid['/']);
        
        if (matchedDeal && matchedDeal.DealID !== 0) {
          dealInfo = {
            dealId: matchedDeal.DealID,
            state: matchedDeal.State,
            provider: minerId,
            client: clientAddress,
            pieceCID: commP,
            pieceSize: pieceSize,
            startEpoch: startEpoch,
            endEpoch: endEpoch
          };
          break;
        }
      } catch (err) {
        console.warn(`Error checking deal status: ${err.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      retries++;
    }
    
    if (!dealInfo) {
      // Deal hasn't been assigned an ID yet, but we can return the CID
      return {
        cid: carResult.rootCID,
        dealCid: dealCid['/'],
        provider: minerId,
        client: clientAddress,
        status: 'pending',
        name: metadata.name,
        dataType: metadata.dataType,
        owner: metadata.owner,
        size: carResult.carSize,
        paddedSize: carResult.pieceSize,
        startEpoch,
        endEpoch,
        duration: dealDuration,
        created: new Date().toISOString()
      };
    }
    
    // Return deal information
    return {
      cid: carResult.rootCID,
      dealId: dealInfo.dealId.toString(),
      dealCid: dealCid['/'],
      provider: minerId,
      client: clientAddress,
      status: 'published',
      state: dealInfo.state,
      name: metadata.name,
      dataType: metadata.dataType,
      owner: metadata.owner,
      size: carResult.carSize,
      paddedSize: carResult.pieceSize,
      pieceCID: commP,
      startEpoch,
      endEpoch,
      duration: dealDuration,
      created: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to create custom deal: ${error.message}`);
  }
}

/**
 * Calculates CommP (Piece Commitment) for a CAR file
 * @private
 * @param {String} carPath - Path to the CAR file
 * @returns {Promise<Object>} - CommP and piece size
 */
async function calculateCommP(carPath) {
  try {
    // In a real implementation, we would use the Lotus RPC API
    // to calculate the piece commitment
    const commPResult = await makeRpcCall('ClientCalcCommP', [carPath]);
    
    if (!commPResult || !commPResult.Root) {
      throw new Error('Failed to calculate piece commitment');
    }
    
    return {
      commP: commPResult.Root['/'],
      pieceSize: commPResult.Size
    };
  } catch (error) {
    throw new Error(`Failed to calculate CommP: ${error.message}`);
  }
}

/**
 * Checks the status of a storage deal
 * @param {String} dealId - ID of the deal to check
 * @returns {Promise<Object>} - Deal status information
 */
async function checkDealStatus(dealId) {
  try {
    const dealInfo = await getDealInfo(dealId);
    
    if (!dealInfo) {
      throw new Error(`Deal not found: ${dealId}`);
    }
    
    // Get current epoch
    const currentEpoch = await getCurrentEpoch();
    
    // Determine status
    let status = 'unknown';
    
    if (currentEpoch < dealInfo.startEpoch) {
      status = 'pending';
    } else if (currentEpoch >= dealInfo.startEpoch && currentEpoch <= dealInfo.endEpoch) {
      status = 'active';
    } else {
      status = 'expired';
    }
    
    // Add time information
    const currentTime = new Date();
    const startTime = new Date(currentTime.getTime() + 
      (dealInfo.startEpoch - currentEpoch) * 30 * 1000); // Epochs are ~30 seconds
    const endTime = new Date(currentTime.getTime() + 
      (dealInfo.endEpoch - currentEpoch) * 30 * 1000);
    
    return {
      ...dealInfo,
      status,
      currentEpoch,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      remainingEpochs: Math.max(0, dealInfo.endEpoch - currentEpoch),
      remainingDays: Math.max(0, Math.floor((dealInfo.endEpoch - currentEpoch) * 30 / 86400))
    };
  } catch (error) {
    throw new Error(`Failed to check deal status: ${error.message}`);
  }
}

/**
 * Extends the duration of an existing deal
 * @param {String} dealId - ID of the deal to extend
 * @param {Number} additionalEpochs - Number of epochs to extend the deal
 * @returns {Promise<Object>} - Updated deal information
 */
async function extendDeal(dealId, additionalEpochs) {
  try {
    // Get current deal info
    const dealInfo = await getDealInfo(dealId);
    
    if (!dealInfo) {
      throw new Error(`Deal not found: ${dealId}`);
    }
    
    // Check if deal is still active
    const currentEpoch = await getCurrentEpoch();
    if (currentEpoch > dealInfo.endEpoch) {
      throw new Error('Cannot extend an expired deal');
    }
    
    // Get config
    const configData = config.getConfig();
    
    // In Filecoin, you typically can't extend a deal directly
    // Instead, we need to create a new deal with the same data
    
    // First, we need to retrieve the data CID
    // We can use ClientFindData to find where the data is stored
    const dataLocation = await makeRpcCall('ClientFindData', [
      { '/': dealInfo.pieceCID },
      null // optional: specify a specific miner
    ]);
    
    if (!dataLocation || !dataLocation.length) {
      throw new Error('Could not find data location for the deal');
    }
    
    // Prepare the new deal proposal with extended duration
    const proposalParams = {
      Data: {
        TransferType: 'graphsync',
        Root: { '/': dataLocation[0].Root },
        PieceCid: { '/': dealInfo.pieceCID },
        PieceSize: dealInfo.pieceSize
      },
      Wallet: dealInfo.client,
      Miner: dealInfo.provider,
      EpochPrice: "100000000000", // Default price in attoFIL per epoch
      MinBlocksDuration: additionalEpochs + (dealInfo.endEpoch - currentEpoch),
      DealStartEpoch: currentEpoch + 2880, // Start after ~1 day (2880 epochs)
      FastRetrieval: true,
      VerifiedDeal: dealInfo.verified
    };
    
    // Start deal proposal
    const newDealCid = await makeRpcCall('ClientStartDeal', [proposalParams]);
    
    if (!newDealCid) {
      throw new Error('Failed to start extension deal proposal');
    }
    
    // Return extension information
    return {
      originalDealId: dealId,
      newDealCid: newDealCid['/'],
      provider: dealInfo.provider,
      client: dealInfo.client,
      pieceCID: dealInfo.pieceCID,
      startEpoch: proposalParams.DealStartEpoch,
      originalEndEpoch: dealInfo.endEpoch,
      newEndEpoch: proposalParams.DealStartEpoch + proposalParams.MinBlocksDuration,
      additionalEpochs,
      status: 'extension-proposed'
    };
  } catch (error) {
    throw new Error(`Failed to extend deal: ${error.message}`);
  }
}

/**
 * Finds the best storage providers based on criteria
 * @param {Object} criteria - Selection criteria
 * @param {Number} [criteria.minFreeSpace] - Minimum free space in bytes
 * @param {Number} [criteria.minReputationScore] - Minimum reputation score
 * @param {String} [criteria.region] - Preferred region
 * @param {Number} [criteria.maxPrice] - Maximum price per epoch per GiB
 * @returns {Promise<Array>} - Array of suitable storage providers
 */
async function findStorageProviders(criteria) {
  try {
    // Get all miners
    const minerIds = await listMiners();
    
    // Collect miner information
    const minerInfo = [];
    const promises = [];
    
    // Create a limit of miners to check to avoid too many requests
    const minersToCheck = minerIds.slice(0, 50); // Limit to 50 miners to prevent overwhelming the API
    
    for (const minerId of minersToCheck) {
      promises.push(
        (async () => {
          try {
            // Get miner info
            const info = await makeRpcCall('StateMinerInfo', [minerId, null]);
            
            // Get miner power
            const power = await makeRpcCall('StateMinerPower', [minerId, null]);
            
            // Try to get ask info (miner might not have published an ask)
            let askInfo;
            try {
              if (info.PeerId) {
                askInfo = await makeRpcCall('ClientQueryAsk', [info.PeerId, minerId]);
              }
            } catch (askError) {
              // Miner has no ask published or is not reachable
              console.warn(`Failed to get ask for miner ${minerId}: ${askError.message}`);
            }
            
            // If we get all necessary information, add miner to results
            if (info && power && power.MinerPower && askInfo) {
              // Check if miner meets criteria
              if (meetsProviderCriteria(info, power, askInfo, criteria)) {
                // Get region information if available
                let region = 'unknown';
                if (info.Multiaddrs && info.Multiaddrs.length > 0) {
                  // Try to determine region from multiaddress (simplified)
                  const multiaddr = Buffer.from(info.Multiaddrs[0], 'base64').toString();
                  if (multiaddr.includes('/ip4/')) {
                    const ip = multiaddr.match(/\/ip4\/([^\/]+)/)[1];
                    region = await getRegionFromIp(ip);
                  }
                }
                
                minerInfo.push({
                  minerId,
                  power: power.MinerPower.RawBytePower,
                  price: askInfo.Price.toString(),
                  minPieceSize: askInfo.MinPieceSize,
                  maxPieceSize: askInfo.MaxPieceSize,
                  verifiedPrice: askInfo.VerifiedPrice.toString(),
                  region,
                  reputationScore: calculateReputationScore(info, power, askInfo)
                });
              }
            }
          } catch (error) {
            // Skip miners we can't get information for
            console.warn(`Failed to get info for miner ${minerId}: ${error.message}`);
          }
        })()
      );
    }
    
    // Wait for all promises to resolve
    await Promise.allSettled(promises);
    
    // Sort by price and reputation
    minerInfo.sort((a, b) => {
      // First by price (lower is better)
      const priceDiff = BigInt(a.price) - BigInt(b.price);
      if (priceDiff !== 0n) return priceDiff < 0n ? -1 : 1;
      
      // Then by reputation (higher is better)
      return b.reputationScore - a.reputationScore;
    });
    
    return minerInfo;
  } catch (error) {
    throw new Error(`Failed to find storage providers: ${error.message}`);
  }
}

/**
 * Calculates estimated cost for storage
 * @param {Number} sizeBytes - Size of data in bytes
 * @param {Number} durationEpochs - Duration in epochs
 * @param {Boolean} verifiedDeal - Whether this is a verified deal
 * @returns {Promise<Object>} - Cost estimate information
 */
async function calculateStorageCost(sizeBytes, durationEpochs, verifiedDeal = false) {
  try {
    // Get some storage providers to estimate cost
    const providers = await findStorageProviders({
      maxPrice: verifiedDeal 
        ? config.getConfig().storage.defaultMaxPrice 
        : config.getConfig().storage.defaultMaxPrice
    });
    
    if (providers.length === 0) {
      throw new Error('No suitable storage providers found');
    }
    
    // Calculate padded piece size
    const paddedSize = conversion.calcPaddedPieceSize(sizeBytes);
    const paddedSizeGiB = paddedSize / (1024 * 1024 * 1024);
    
    // Calculate costs for each provider
    const estimates = providers.map(provider => {
      const pricePerEpochPerGiB = verifiedDeal 
        ? BigInt(provider.verifiedPrice) 
        : BigInt(provider.price);
      
      const totalCost = pricePerEpochPerGiB * 
        BigInt(Math.ceil(paddedSizeGiB)) * 
        BigInt(durationEpochs);
      
      return {
        provider: provider.minerId,
        region: provider.region,
        pricePerEpochPerGiB: pricePerEpochPerGiB.toString(),
        totalCost: totalCost.toString(),
        totalCostFil: conversion.attoFilToFil(totalCost.toString()),
        durationEpochs,
        paddedSize,
        verifiedDeal
      };
    });
    
    // Sort by cost
    estimates.sort((a, b) => {
      const costA = BigInt(a.totalCost);
      const costB = BigInt(b.totalCost);
      return costA < costB ? -1 : costA > costB ? 1 : 0;
    });
    
    // Calculate average, min, and max
    const totalCosts = estimates.map(e => BigInt(e.totalCost));
    const minCost = totalCosts.length > 0 ? totalCosts.reduce((min, cost) => cost < min ? cost : min, totalCosts[0]) : 0n;
    const maxCost = totalCosts.length > 0 ? totalCosts.reduce((max, cost) => cost > max ? cost : max, totalCosts[0]) : 0n;
    
    // Calculate average
    let avgCost = 0n;
    if (totalCosts.length > 0) {
      const sum = totalCosts.reduce((acc, cost) => acc + cost, 0n);
      avgCost = sum / BigInt(totalCosts.length);
    }
    
    return {
      sizeBytes,
      paddedSize,
      paddedSizeGiB,
      durationEpochs,
      verifiedDeal,
      providerEstimates: estimates,
      minCost: minCost.toString(),
      maxCost: maxCost.toString(),
      avgCost: avgCost.toString(),
      minCostFil: conversion.attoFilToFil(minCost.toString()),
      maxCostFil: conversion.attoFilToFil(maxCost.toString()),
      avgCostFil: conversion.attoFilToFil(avgCost.toString())
    };
  } catch (error) {
    throw new Error(`Failed to calculate storage cost: ${error.message}`);
  }
}

/**
 * Helper function to check if a provider meets the criteria
 * @private
 * @param {Object} info - Miner info
 * @param {Object} power - Miner power info
 * @param {Object} askInfo - Miner ask info
 * @param {Object} criteria - Selection criteria
 * @returns {Boolean} - Whether the provider meets the criteria
 */
function meetsProviderCriteria(info, power, askInfo, criteria) {
  // Check minimum free space
  if (criteria.minFreeSpace && 
      BigInt(power.MinerPower.RawBytePower) < BigInt(criteria.minFreeSpace)) {
    return false;
  }
  
  // Check maximum price
  if (criteria.maxPrice && 
      BigInt(askInfo.Price) > BigInt(criteria.maxPrice)) {
    return false;
  }
  
  // Check if provider is active
  if (!info.PeerId) {
    return false;
  }
  
  // Check if provider has minimum reputation score
  if (criteria.minReputationScore) {
    const reputationScore = calculateReputationScore(info, power, askInfo);
    if (reputationScore < criteria.minReputationScore) {
      return false;
    }
  }
  
  // Check region if specified
  if (criteria.region && info.Multiaddrs && info.Multiaddrs.length > 0) {
    const multiaddr = Buffer.from(info.Multiaddrs[0], 'base64').toString();
    if (multiaddr.includes('/ip4/')) {
      const ip = multiaddr.match(/\/ip4\/([^\/]+)/)[1];
      const region = getRegionFromIp(ip);
      if (region !== criteria.region) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Calculate reputation score for a miner
 * @private
 * @param {Object} info - Miner info
 * @param {Object} power - Miner power info
 * @param {Object} askInfo - Miner ask info
 * @returns {Number} - Reputation score (0-100)
 */
function calculateReputationScore(info, power, askInfo) {
  let score = 0;
  
  // Score based on power (more power = more reliable)
  const powerBigInt = BigInt(power.MinerPower.RawBytePower);
  const totalPower = BigInt(power.TotalPower.RawBytePower);
  
  if (totalPower > 0n) {
    // Power share as percentage
    const powerShare = Number((powerBigInt * 10000n) / totalPower) / 100;
    // Up to 30 points for power
    score += Math.min(30, powerShare * 1000);
  }
  
  // Score based on price (lower price = higher score)
  const price = BigInt(askInfo.Price);
  const maxPrice = 5000000000000n; // 5 * 10^12 attoFIL per GiB per epoch
  
  if (price < maxPrice) {
    // Up to 30 points for price
    score += 30 * (1 - Number(price) / Number(maxPrice));
  }
  
  // Score based on verified deal price (lower = better)
  const verifiedPrice = BigInt(askInfo.VerifiedPrice);
  const maxVerifiedPrice = 1000000000000n; // 1 * 10^12 attoFIL per GiB per epoch
  
  if (verifiedPrice < maxVerifiedPrice) {
    // Up to 20 points for verified price
    score += 20 * (1 - Number(verifiedPrice) / Number(maxVerifiedPrice));
  }
  
  // Score based on multiaddress presence (having multiaddress = better reachability)
  if (info.Multiaddrs && info.Multiaddrs.length > 0) {
    score += 10;
  }
  
  // Score based on sector size (larger = more professional)
  if (info.SectorSize >= 34359738368) { // 32 GiB
    score += 10;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Get region from IP address
 * @private
 * @param {String} ip - IP address
 * @returns {String} - Region code
 */
async function getRegionFromIp(ip) {
  // In a production environment, you would use a GeoIP service
  // This is a simplified version returning random regions
  
  // For demo purposes we'll just return based on first octet of IP
  const firstOctet = parseInt(ip.split('.')[0]);
  
  if (firstOctet < 100) {
    return 'US';
  } else if (firstOctet < 180) {
    return 'EU';
  } else {
    return 'ASIA';
  }
}

module.exports = {
  createStorageDeal,
  checkDealStatus,
  extendDeal,
  findStorageProviders,
  calculateStorageCost
};