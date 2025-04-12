/**
 * @module storage/optimize
 * @description Functions for optimizing data storage on Filecoin
 */

const { calculateStorageCost, findStorageProviders, checkDealStatus } = require('./deal');
const { findStorageProvidersByCid } = require('./retrieve');
const { getDealInfo, getClientDeals, getCurrentEpoch } = require('../rpc/methods');
const { calcPaddedPieceSize } = require('../utils/conversion');
const config = require('../utils/config');
const cidUtils = require('../utils/cid');
const path = require('path');
const fs = require('fs');

/**
 * Optimizes storage parameters for a dataset
 * @param {Number} sizeBytes - Size of data in bytes
 * @param {Object} [options] - Optimization options
 * @param {String} [options.priorityFactor="balanced"] - "cost", "reliability", or "balanced"
 * @param {Number} [options.budget] - Maximum budget in FIL
 * @param {Number} [options.minReplicationFactor] - Minimum number of replicas
 * @returns {Promise<Object>} - Optimized storage parameters
 */
async function optimizeStorageParams(sizeBytes, options = {}) {
  try {
    // Default priority factor
    const priorityFactor = options.priorityFactor || "balanced";
    
    // Get configuration
    const configData = config.getConfig();
    
    // Default replication factor from config or options
    const minReplicationFactor = options.minReplicationFactor || 
                                configData.storage.replicationFactor || 2;
    
    // Calculate padded piece size
    const paddedSize = calcPaddedPieceSize(sizeBytes);
    
    // Get storage cost estimates
    const verifiedDeal = configData.storage.defaultVerifiedDeal;
    const defaultDuration = configData.storage.defaultDealDuration;
    
    // Get cost estimates for different durations
    const [shortTerm, mediumTerm, longTerm] = await Promise.all([
      calculateStorageCost(sizeBytes, defaultDuration / 2, verifiedDeal),
      calculateStorageCost(sizeBytes, defaultDuration, verifiedDeal),
      calculateStorageCost(sizeBytes, defaultDuration * 2, verifiedDeal)
    ]);
    
    // Determine optimal duration based on priority factor
    let optimalDuration = defaultDuration;
    let selectedCostEstimate = mediumTerm;
    
    if (priorityFactor === "cost") {
      // Choose the one with lowest average cost per epoch
      const shortTermCostPerEpoch = BigInt(shortTerm.avgCost) / BigInt(shortTerm.durationEpochs);
      const mediumTermCostPerEpoch = BigInt(mediumTerm.avgCost) / BigInt(mediumTerm.durationEpochs);
      const longTermCostPerEpoch = BigInt(longTerm.avgCost) / BigInt(longTerm.durationEpochs);
      
      if (longTermCostPerEpoch <= mediumTermCostPerEpoch && longTermCostPerEpoch <= shortTermCostPerEpoch) {
        optimalDuration = defaultDuration * 2;
        selectedCostEstimate = longTerm;
      } else if (mediumTermCostPerEpoch <= shortTermCostPerEpoch) {
        optimalDuration = defaultDuration;
        selectedCostEstimate = mediumTerm;
      } else {
        optimalDuration = defaultDuration / 2;
        selectedCostEstimate = shortTerm;
      }
    } else if (priorityFactor === "reliability") {
      // Choose the longest duration
      optimalDuration = defaultDuration * 2;
      selectedCostEstimate = longTerm;
    }
    // For "balanced", stick with mediumTerm (already set as default)
    
    // Calculate optimal replication factor based on budget if provided
    let replicationFactor = minReplicationFactor;
    if (options.budget) {
      const budgetAttoFil = BigInt(Math.floor(parseFloat(options.budget) * 10**18));
      const costPerReplica = BigInt(selectedCostEstimate.avgCost);
      
      if (costPerReplica > 0n) {
        const maxReplicas = Number(budgetAttoFil / costPerReplica);
        replicationFactor = Math.max(minReplicationFactor, Math.min(5, maxReplicas));
      }
    }
    
    // Select optimal providers
    const providerRankings = rankProviders(selectedCostEstimate.providerEstimates, priorityFactor);
    const optimalProviders = providerRankings.slice(0, replicationFactor);
    
    // Calculate chunking strategy if needed
    const chunkingStrategy = calculateChunkingStrategy(sizeBytes);
    
    return {
      sizeBytes,
      paddedSize,
      optimalDuration,
      replicationFactor,
      optimalProviders,
      chunkingStrategy,
      verifiedDeal,
      costEstimate: {
        perReplica: selectedCostEstimate.avgCostFil,
        total: multiplyBigIntString(selectedCostEstimate.avgCost, replicationFactor),
        totalFil: multiplyFilString(selectedCostEstimate.avgCostFil, replicationFactor)
      },
      alternativeOptions: {
        shortTerm: {
          duration: shortTerm.durationEpochs,
          avgCost: shortTerm.avgCostFil
        },
        mediumTerm: {
          duration: mediumTerm.durationEpochs,
          avgCost: mediumTerm.avgCostFil
        },
        longTerm: {
          duration: longTerm.durationEpochs,
          avgCost: longTerm.avgCostFil
        }
      }
    };
  } catch (error) {
    throw new Error(`Failed to optimize storage parameters: ${error.message}`);
  }
}

/**
 * Calculates the optimal chunking strategy for large datasets
 * @param {Number} sizeBytes - Size of data in bytes
 * @returns {Object} - Chunking strategy
 */
function calculateChunkingStrategy(sizeBytes) {
  const GiB = 1024 * 1024 * 1024;
  
  // If size is less than 32 GiB, no chunking needed
  if (sizeBytes <= 32 * GiB) {
    return {
      needsChunking: false,
      originalSize: sizeBytes,
      paddedSize: calcPaddedPieceSize(sizeBytes),
      chunks: 1,
      chunkSize: sizeBytes
    };
  }
  
  // Filecoin has sector size limits, typically 32 GiB and 64 GiB
  // Choose a chunk size that's optimized for sector sizes
  
  let chunkSize;
  if (sizeBytes <= 512 * GiB) {
    // Use 16 GiB chunks for data up to 512 GiB
    chunkSize = 16 * GiB;
  } else if (sizeBytes <= 1024 * GiB) {
    // Use 32 GiB chunks for data up to 1 TiB
    chunkSize = 32 * GiB;
  } else {
    // Use 64 GiB chunks for larger data
    chunkSize = 64 * GiB;
  }
  
  // Calculate number of chunks
  const chunks = Math.ceil(sizeBytes / chunkSize);
  
  // Calculate sizes of the last chunk
  const lastChunkSize = sizeBytes % chunkSize || chunkSize;
  const lastChunkPaddedSize = calcPaddedPieceSize(lastChunkSize);
  
  // Calculate total padded size
  const regularChunkPaddedSize = calcPaddedPieceSize(chunkSize);
  const totalPaddedSize = (chunks - 1) * regularChunkPaddedSize + lastChunkPaddedSize;
  
  return {
    needsChunking: true,
    originalSize: sizeBytes,
    paddedSize: totalPaddedSize,
    chunks,
    chunkSize,
    regularChunkPaddedSize,
    lastChunkSize,
    lastChunkPaddedSize,
    estimatedOverhead: totalPaddedSize - sizeBytes,
    estimatedOverheadPercentage: ((totalPaddedSize - sizeBytes) / sizeBytes) * 100
  };
}

/**
 * Recommends deal renewal schedule for optimal cost and availability
 * @param {String} dealId - ID of the existing deal
 * @param {Number} [targetDuration] - Target total duration in epochs
 * @returns {Promise<Object>} - Renewal recommendations
 */
async function recommendRenewalSchedule(dealId, targetDuration) {
  try {
    // Get deal information
    const dealInfo = await getDealInfo(dealId);
    if (!dealInfo) {
      throw new Error(`Deal not found: ${dealId}`);
    }
    
    // Get current epoch
    const currentEpoch = await getCurrentEpoch();
    
    // Calculate remaining duration
    const remainingEpochs = Math.max(0, dealInfo.endEpoch - currentEpoch);
    
    // Default target duration if not specified
    if (!targetDuration) {
      const configData = config.getConfig();
      targetDuration = configData.storage.defaultDealDuration * 2; // Twice the default duration
    }
    
    // If already exceeds target, no renewal needed
    if (remainingEpochs >= targetDuration) {
      return {
        dealId,
        currentEndEpoch: dealInfo.endEpoch,
        remainingEpochs,
        targetDuration,
        needsRenewal: false,
        message: "Current deal already exceeds target duration"
      };
    }
    
    // Calculate when to renew
    // Typically, renew when 25% of the deal duration remains
    const originalDuration = dealInfo.endEpoch - dealInfo.startEpoch;
    const renewalThreshold = Math.min(
      Math.floor(originalDuration * 0.25),  // 25% of original duration
      2880 * 7  // or 7 days in epochs, whichever is smaller
    );
    
    // Calculate renewal epoch - when we should initiate renewal
    const renewalEpoch = dealInfo.endEpoch - renewalThreshold;
    
    // Calculate new end epoch after renewal
    const additionalEpochs = targetDuration - remainingEpochs;
    const newEndEpoch = dealInfo.endEpoch + additionalEpochs;
    
    // Get updated cost estimate for the renewal
    const sizeBytes = dealInfo.pieceSize;
    const storageParams = await optimizeStorageParams(sizeBytes, {
      priorityFactor: "balanced"
    });
    
    // Determine if renewal should happen now
    const renewNow = currentEpoch >= renewalEpoch;
    
    return {
      dealId,
      currentEndEpoch: dealInfo.endEpoch,
      remainingEpochs,
      targetDuration,
      needsRenewal: true,
      renewalEpoch,
      renewalTimeframe: renewNow ? "now" : "future",
      timeUntilRenewal: Math.max(0, renewalEpoch - currentEpoch),
      additionalEpochs,
      newEndEpoch,
      estimatedCost: storageParams.costEstimate.perReplica,
      recommendedDuration: storageParams.optimalDuration,
      renewalDetails: {
        provider: dealInfo.provider,
        clientAddress: dealInfo.client,
        pieceCID: dealInfo.pieceCID,
        pieceSize: dealInfo.pieceSize,
        verifiedDeal: dealInfo.verified
      }
    };
  } catch (error) {
    throw new Error(`Failed to recommend renewal schedule: ${error.message}`);
  }
}

/**
 * Creates an automated renewal plan for deals
 * @param {Array} dealIds - Array of deal IDs to include in the plan
 * @param {Object} [options] - Plan options
 * @param {Number} [options.lookaheadDays=30] - Days before expiration to renew
 * @param {Boolean} [options.autoApprove=false] - Whether to auto-approve renewals
 * @returns {Promise<Object>} - Renewal plan
 */
async function createRenewalPlan(dealIds, options = {}) {
  try {
    // Default options
    const lookaheadDays = options.lookaheadDays || 30;
    const autoApprove = options.autoApprove || false;
    
    // Convert lookahead days to epochs (30 seconds per epoch)
    const lookaheadEpochs = lookaheadDays * 86400 / 30;
    
    // Get current epoch
    const currentEpoch = await getCurrentEpoch();
    
    // Get deal information for all deals
    const dealPromises = dealIds.map(dealId => getDealInfo(dealId));
    const dealInfos = await Promise.all(dealPromises);
    
    // Filter out not found deals
    const validDeals = dealInfos.filter(Boolean);
    
    // Create plan for each deal
    const dealsToRenewSoon = [];
    const dealsToRenewLater = [];
    const dealsNotRequiringRenewal = [];
    
    for (const dealInfo of validDeals) {
      const timeToExpiration = dealInfo.endEpoch - currentEpoch;
      
      if (timeToExpiration <= 0) {
        // Deal already expired
        dealsNotRequiringRenewal.push({
          dealId: dealInfo.dealId,
          status: 'expired',
          endEpoch: dealInfo.endEpoch,
          timeToExpiration
        });
      } else if (timeToExpiration <= lookaheadEpochs) {
        // Deal needs renewal soon
        dealsToRenewSoon.push({
          dealId: dealInfo.dealId,
          status: 'renewal-due',
          endEpoch: dealInfo.endEpoch,
          timeToExpiration,
          renewBy: currentEpoch + timeToExpiration - Math.floor(lookaheadEpochs * 0.25),
          provider: dealInfo.provider,
          pieceCID: dealInfo.pieceCID,
          pieceSize: dealInfo.pieceSize,
          verified: dealInfo.verified,
          autoRenew: autoApprove
        });
      } else {
        // Deal will need renewal later
        dealsToRenewLater.push({
          dealId: dealInfo.dealId,
          status: 'scheduled',
          endEpoch: dealInfo.endEpoch,
          timeToExpiration,
          renewOn: dealInfo.endEpoch - lookaheadEpochs,
          provider: dealInfo.provider,
          autoRenew: autoApprove
        });
      }
    }
    
    // Calculate cost estimates for soon-to-renew deals
    let totalEstimatedCost = "0";
    
    if (dealsToRenewSoon.length > 0) {
      // Get default deal duration from config
      const configData = config.getConfig();
      const defaultDuration = configData.storage.defaultDealDuration;
      
      // Calculate costs for all deals
      const costPromises = dealsToRenewSoon.map(deal => 
        calculateStorageCost(deal.pieceSize, defaultDuration, deal.verified)
      );
      
      const costEstimates = await Promise.all(costPromises);
      
      // Add cost estimates to each deal
      dealsToRenewSoon.forEach((deal, index) => {
        deal.estimatedCost = costEstimates[index].avgCostFil;
        deal.renewalDuration = defaultDuration;
      });
      
      // Calculate total cost
      totalEstimatedCost = costEstimates.reduce((total, estimate) => {
        return addBigIntString(total, estimate.avgCost);
      }, "0");
    }
    
    return {
      totalDeals: validDeals.length,
      dealsToRenewSoon,
      dealsToRenewLater,
      dealsNotRequiringRenewal,
      totalEstimatedCost,
      totalEstimatedCostFil: costToFilString(totalEstimatedCost),
      lookaheadDays,
      lookaheadEpochs,
      autoApprove,
      timestamp: new Date().toISOString(),
      currentEpoch
    };
  } catch (error) {
    throw new Error(`Failed to create renewal plan: ${error.message}`);
  }
}

/**
 * Recommends storage providers based on historical performance
 * @param {Object} dataset - Dataset information
 * @param {Number} dataset.sizeBytes - Size of dataset in bytes
 * @param {String} dataset.dataType - Type of data
 * @param {Number} [dataset.accessFrequency] - Expected access frequency
 * @returns {Promise<Array>} - Recommended providers
 */
async function recommendProviders(dataset) {
  try {
    // Validate required dataset properties
    if (!dataset.sizeBytes) {
      throw new Error('Dataset size is required');
    }
    
    // Default access frequency: 1 = low, 5 = medium, 10 = high
    const accessFrequency = dataset.accessFrequency || 5;
    
    // Find available providers
    const providers = await findStorageProviders({
      minFreeSpace: dataset.sizeBytes
    });
    
    if (providers.length === 0) {
      throw new Error('No suitable storage providers found');
    }
    
    // Score each provider based on multiple factors
    const scoredProviders = providers.map(provider => {
      // Convert price to score: lower price = higher score
      const priceScore = scorePrice(provider.price);
      
      // Region score: based on dataset access frequency
      // High access datasets benefit from diverse geographic distribution
      const regionScore = scoreRegion(provider.region, accessFrequency);
      
      // Reputation score: as provided
      const reputationScore = provider.reputationScore / 100;
      
      // Calculate total score based on dataset properties
      // Weights vary based on access frequency
      let weights;
      
      if (accessFrequency <= 3) {
        // Low access: price is most important
        weights = { price: 0.6, region: 0.1, reputation: 0.3 };
      } else if (accessFrequency <= 7) {
        // Medium access: balanced approach
        weights = { price: 0.4, region: 0.2, reputation: 0.4 };
      } else {
        // High access: reputation and region more important
        weights = { price: 0.2, region: 0.4, reputation: 0.4 };
      }
      
      const totalScore = 
        (priceScore * weights.price) + 
        (regionScore * weights.region) + 
        (reputationScore * weights.reputation);
      
      return {
        ...provider,
        scores: {
          price: priceScore,
          region: regionScore,
          reputation: reputationScore,
          total: totalScore
        }
      };
    });
    
    // Sort by total score in descending order
    scoredProviders.sort((a, b) => b.scores.total - a.scores.total);
    
    // Get optimal replication factor
    const storageParams = await optimizeStorageParams(dataset.sizeBytes, {
      priorityFactor: accessFrequency > 7 ? "reliability" : 
                    accessFrequency > 3 ? "balanced" : "cost"
    });
    
    const replicationFactor = storageParams.replicationFactor;
    
    // Select top providers, ensuring geographic diversity for high access frequency
    const selectedProviders = [];
    const selectedRegions = new Set();
    
    for (const provider of scoredProviders) {
      // For high access frequency, ensure geographic diversity
      if (accessFrequency > 7) {
        // If we already selected a provider from this region, only add if we need more providers
        if (selectedRegions.has(provider.region) && selectedProviders.length < replicationFactor * 0.5) {
          continue;
        }
        selectedRegions.add(provider.region);
      }
      
      selectedProviders.push(provider);
      
      // Stop once we have enough providers
      if (selectedProviders.length >= replicationFactor) {
        break;
      }
    }
    
    // If we don't have enough providers with geographic diversity, add more based on score
    if (selectedProviders.length < replicationFactor) {
      for (const provider of scoredProviders) {
        if (!selectedProviders.includes(provider)) {
          selectedProviders.push(provider);
          if (selectedProviders.length >= replicationFactor) {
            break;
          }
        }
      }
    }
    
    return {
      dataset: {
        sizeBytes: dataset.sizeBytes,
        dataType: dataset.dataType,
        accessFrequency
      },
      recommendedProviders: selectedProviders,
      replicationFactor,
      allProviders: scoredProviders
    };
  } catch (error) {
    throw new Error(`Failed to recommend providers: ${error.message}`);
  }
}

/**
 * Distributes data optimally across miners
 * @param {Object} dataset - Dataset information
 * @param {Array} providers - Array of provider information
 * @param {Object} [options] - Distribution options
 * @returns {Object} - Distribution plan
 */
function optimizeDistribution(dataset, providers, options = {}) {
  // Calculate padded size for dataset
  const paddedSize = calcPaddedPieceSize(dataset.sizeBytes);
  
  // Check if dataset needs chunking
  const chunkingStrategy = calculateChunkingStrategy(dataset.sizeBytes);
  
  if (!chunkingStrategy.needsChunking) {
    // If no chunking needed, simple distribution
    return {
      needsChunking: false,
      dataset: {
        sizeBytes: dataset.sizeBytes,
        paddedSize
      },
      distribution: providers.map(provider => ({
        provider: provider.minerId,
        pieceSize: paddedSize,
        pieceCount: 1
      }))
    };
  }
  
  // For chunked datasets, distribute chunks across providers
  const chunks = chunkingStrategy.chunks;
  const distribution = [];
  
  // Distribute chunks evenly among providers
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const chunksPerProvider = Math.ceil(chunks / providers.length);
    
    // Calculate which chunks go to this provider
    const providerChunks = [];
    for (let j = 0; j < chunksPerProvider; j++) {
      const chunkIndex = (i * chunksPerProvider + j) % chunks;
      if (chunkIndex < chunks) {
        providerChunks.push(chunkIndex);
      }
    }
    
    // Calculate total size for this provider
    const regularChunks = providerChunks.filter(idx => idx < chunks - 1).length;
    const hasLastChunk = providerChunks.includes(chunks - 1);
    
    const totalPaddedSize = 
      (regularChunks * chunkingStrategy.regularChunkPaddedSize) + 
      (hasLastChunk ? chunkingStrategy.lastChunkPaddedSize : 0);
    
    distribution.push({
      provider: provider.minerId,
      pieceSize: totalPaddedSize,
      pieceCount: providerChunks.length,
      chunks: providerChunks
    });
  }
  
  return {
    needsChunking: true,
    chunkingStrategy,
    dataset: {
      sizeBytes: dataset.sizeBytes,
      paddedSize: chunkingStrategy.paddedSize,
      chunks
    },
    distribution
  };
}

/**
 * Ranks providers based on criteria
 * @private
 * @param {Array} providers - Array of provider estimates
 * @param {String} priorityFactor - Ranking priority
 * @returns {Array} - Ranked providers
 */
function rankProviders(providers, priorityFactor) {
  const rankedProviders = [...providers];
  
  if (priorityFactor === "cost") {
    // Sort by price (lower is better)
    rankedProviders.sort((a, b) => {
      return BigInt(a.totalCost) - BigInt(b.totalCost);
    });
  } else if (priorityFactor === "reliability") {
    // For demo, we'll use a mock reliability metric based on the provider ID
    // In a real implementation, you would use actual reliability metrics
    rankedProviders.sort((a, b) => {
      // Use last character of provider ID as a mock reliability score
      const aReliability = parseInt(a.provider.slice(-1), 16) || 0;
      const bReliability = parseInt(b.provider.slice(-1), 16) || 0;
      
      if (aReliability !== bReliability) {
        return bReliability - aReliability; // Higher is better
      }
      
      // If reliability is the same, use price as tiebreaker
      return BigInt(a.totalCost) - BigInt(b.totalCost);
    });
  } else {
    // Balanced approach: rank based on a combined score
    rankedProviders.sort((a, b) => {
      // Normalize price (lower is better)
      const aPrice = BigInt(a.totalCost);
      const bPrice = BigInt(b.totalCost);
      const priceDiff = aPrice - bPrice;
      
      // Use mock reliability score
      const aReliability = parseInt(a.provider.slice(-1), 16) || 0;
      const bReliability = parseInt(b.provider.slice(-1), 16) || 0;
      const reliabilityDiff = bReliability - aReliability;
      
      // Balanced score considers both factors
      // For simplicity, we'll use a basic comparison
      if (Math.abs(Number(priceDiff)) > 1000000000000000) {
        // If price difference is significant, prioritize price
        return priceDiff < 0n ? -1 : 1;
      } else {
        // Otherwise, prioritize reliability
        return reliabilityDiff;
      }
    });
  }
  
  return rankedProviders;
}

/**
 * Scores price for provider ranking
 * @private
 * @param {String} price - Price in attoFIL
 * @returns {Number} - Score between 0 and 1 (higher is better)
 */
function scorePrice(price) {
  // Convert price to number for scoring
  const priceValue = Number(BigInt(price) / 10n**12n) / 1000000;
  
  // Normalize price (lower price = higher score)
  // Using a sigmoid function to map prices to scores
  const score = 1 / (1 + Math.exp((priceValue - 0.5) * 10));
  
  return score;
}

/**
 * Scores region for provider ranking
 * @private
 * @param {String} region - Provider region
 * @param {Number} accessFrequency - Access frequency
 * @returns {Number} - Score between 0 and 1
 */
function scoreRegion(region, accessFrequency) {
  // For low access frequency, all regions score the same
  if (accessFrequency <= 3) {
    return 0.8;
  }
  
  // For medium and high access, prefer diverse regions
  // This is a simplified implementation - in reality you would 
  // consider the client's geographical location
  
  // Mock scoring based on region
  switch (region) {
    case 'US':
      return 0.9;
    case 'EU':
      return 0.85;
    case 'ASIA':
      return 0.8;
    default:
      return 0.7;
  }
}

/**
 * Utility function to add two big integer strings
 * @private
 * @param {String} a - First big integer as string
 * @param {String} b - Second big integer as string
 * @returns {String} - Result as string
 */
function addBigIntString(a, b) {
  return (BigInt(a) + BigInt(b)).toString();
}

/**
 * Utility function to multiply a big integer string by a number
 * @private
 * @param {String} a - Big integer as string
 * @param {Number} b - Number to multiply by
 * @returns {String} - Result as string
 */
function multiplyBigIntString(a, b) {
  return (BigInt(a) * BigInt(Math.floor(b))).toString();
}

/**
 * Utility function to multiply a FIL string by a number
 * @private
 * @param {String} filString - FIL amount as string
 * @param {Number} multiplier - Number to multiply by
 * @returns {String} - Result as string
 */
function multiplyFilString(filString, multiplier) {
  const value = parseFloat(filString) * multiplier;
  return value.toFixed(value < 0.01 ? 8 : 6);
}

/**
 * Utility function to convert attoFIL cost to FIL string
 * @private
 * @param {String} attoFil - Amount in attoFIL
 * @returns {String} - Amount in FIL
 */
function costToFilString(attoFil) {
  const value = Number(BigInt(attoFil) / 10n**14n) / 10000;
  return value.toFixed(value < 0.01 ? 8 : 6);
}

module.exports = {
  optimizeStorageParams,
  calculateChunkingStrategy,
  recommendRenewalSchedule,
  createRenewalPlan,
  recommendProviders,
  optimizeDistribution
};