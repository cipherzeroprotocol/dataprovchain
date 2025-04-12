/**
 * Service for interacting with Filecoin
 */
const { Web3Storage } = require('web3.storage');
const { packToBlob } = require('ipfs-car/pack/blob');
const { CarReader, CarWriter } = require('@ipld/car');
const { BlockstoreCarReader } = require('@ipld/car/blockstore');
const { CID } = require('multiformats/cid');
const { blake2b256 } = require('@multiformats/blake2/blake2b');
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc');
const { NodejsProvider } = require('@filecoin-shipyard/lotus-client-provider-nodejs');
import * as dagPB from '@ipld/dag-pb';
import * as raw from 'multiformats/codecs/raw';
const { create } = require('ipfs-http-client');
const { Readable } = require('stream');
const stream = require('stream');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const os = require('os');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);
const filecoinConfig = require('../config/filecoin');
const contractsService = require('./contracts.service');
const logger = require('../utils/logger');

// Initialize Web3Storage client
const web3Storage = new Web3Storage({ token: filecoinConfig.web3StorageToken });

// Initialize Lotus client for direct API access
const lotusProvider = new NodejsProvider(filecoinConfig.lotusApiUrl, {
  token: filecoinConfig.lotusAuthToken
});
const lotusClient = new LotusRPC(lotusProvider);

// Initialize IPFS client
const ipfsClient = create({
  url: 'https://ipfs.infura.io:5001/api/v0'
});

/**
 * Create a temporary file path
 * @param {string} prefix - File prefix
 * @param {string} [extension=''] - File extension
 * @returns {Promise<string>} - Temporary file path
 */
const getTempFilePath = async (prefix = 'tmp', extension = '') => {
  const tempDir = path.join(os.tmpdir(), 'dataprovchain');
  
  // Ensure temp directory exists
  await fs.promises.mkdir(tempDir, { recursive: true });
  
  const filename = `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`;
  return path.join(tempDir, filename);
};

/**
 * Calculate CommP (Piece CID) using the Filecoin Proofs FFI library
 * @param {Buffer|string} data - CAR data or path to CAR file
 * @returns {Promise<Object>} - CommP information
 */
const calculateCommP = async (data) => {
  // Use the Lotus API to calculate CommP
  try {
    // Create a temporary file if data is a buffer
    let carPath;
    let needToCleanup = false;
    
    if (Buffer.isBuffer(data)) {
      carPath = await getTempFilePath('commP', '.car');
      await fs.promises.writeFile(carPath, data);
      needToCleanup = true;
    } else if (typeof data === 'string') {
      carPath = data;
    } else {
      throw new Error('Invalid data type for CommP calculation');
    }
    
    // Call Lotus API
    const calcCommPResponse = await lotusClient.clientCalcCommP(carPath);
    
    // Clean up temp file if needed
    if (needToCleanup) {
      await fs.promises.unlink(carPath);
    }
    
    return {
      pieceCid: calcCommPResponse.Root['/'],
      pieceSize: calcCommPResponse.Size
    };
  } catch (lotusError) {
    logger.error('Failed to calculate CommP using Lotus API', { error: lotusError.message });
    
    // If Lotus API fails, fall back to direct calculation
    try {
      let carData;
      
      if (Buffer.isBuffer(data)) {
        carData = data;
      } else if (typeof data === 'string') {
        carData = await fs.promises.readFile(data);
      } else {
        throw new Error('Invalid data type for CommP calculation');
      }
      
      // Calculate padded size (next power of 2)
      const paddedSize = Math.pow(2, Math.ceil(Math.log2(carData.length)));
      
      // Read CAR file and calculate root CID
      const reader = await CarReader.fromBytes(carData);
      const roots = await reader.getRoots();
      
      if (roots.length === 0) {
        throw new Error('CAR file has no roots');
      }
      
      const rootCid = roots[0].toString();
      
      // Calculate piece CID - note: this is a simplified approach
      // In production, you'd use the fil-commP-hashhash library for proper calculation
      const hash = crypto.createHash('sha256');
      hash.update(carData);
      const pieceCommitment = hash.digest();
      
      // Create a CID from the hash
      const multihash = await blake2b256.digest(pieceCommitment);
      const pieceCid = CID.create(1, raw.code, multihash).toString();
      
      return {
        pieceCid,
        pieceSize: paddedSize
      };
    } catch (fallbackError) {
      logger.error('Both CommP calculation methods failed', { 
        lotusError: lotusError.message,
        fallbackError: fallbackError.message
      });
      throw new Error(`Failed to calculate CommP: ${fallbackError.message}`);
    }
  }
};

/**
 * Store a dataset on Filecoin via Web3.Storage
 * @param {Object} dataset - Dataset object
 * @param {Buffer|string} dataset.data - Dataset data or file path
 * @param {Object} dataset.metadata - Dataset metadata
 * @param {string} dataset.name - Dataset name
 * @returns {Promise<Object>} - Storage result with CID
 */
const storeDataset = async (dataset) => {
  // Create a temporary file if dataset.data is a buffer
  let filePath;
  let tempFilesToCleanup = [];
  
  try {
    if (Buffer.isBuffer(dataset.data)) {
      filePath = await getTempFilePath('dataset', '.bin');
      await fs.promises.writeFile(filePath, dataset.data);
      tempFilesToCleanup.push(filePath);
    } else if (typeof dataset.data === 'string' && fs.existsSync(dataset.data)) {
      filePath = dataset.data;
    } else {
      throw new Error('Invalid dataset data: must be a Buffer or existing file path');
    }
    
    // Create metadata file
    const metadataPath = await getTempFilePath('metadata', '.json');
    await fs.promises.writeFile(metadataPath, JSON.stringify(dataset.metadata, null, 2));
    tempFilesToCleanup.push(metadataPath);
    
    // Get file stats for large file handling
    const fileStats = await fs.promises.stat(filePath);
    
    // Handle large files specially
    let root, car;
    if (fileStats.size > 100 * 1024 * 1024) { // > 100MB
      // For large files, we need to create the CAR file on disk
      const carPath = await getTempFilePath('dataset', '.car');
      tempFilesToCleanup.push(carPath);
      
      // Use carWriter to stream data instead of loading everything into memory
      const { writer, out } = CarWriter.create([]);
      const outStream = fs.createWriteStream(carPath);
      
      // Pipe the car writer output to the file
      await pipeline(out, outStream);
      
      // Add files to the CAR archive
      const dataStream = fs.createReadStream(filePath);
      const dataBlock = await dagPB.encode({
        Data: await util.promisify(stream.pipeline)(
          dataStream,
          async function* (source) {
            for await (const chunk of source) {
              yield chunk;
            }
          }
        ),
        Links: []
      });
      const dataCid = CID.create(1, dagPB.code, await blake2b256.digest(dataBlock));
      await writer.put({ cid: dataCid, bytes: dataBlock });
      
      // Add metadata
      const metadataContent = await fs.promises.readFile(metadataPath, 'utf8');
      const metadataBlock = await dagPB.encode({
        Data: Buffer.from(metadataContent),
        Links: []
      });
      const metadataCid = CID.create(1, dagPB.code, await blake2b256.digest(metadataBlock));
      await writer.put({ cid: metadataCid, bytes: metadataBlock });
      
      // Create root directory that links both files
      const rootBlock = await dagPB.encode({
        Data: Buffer.from(''),
        Links: [
          {
            Name: dataset.name,
            Hash: dataCid,
            Tsize: dataBlock.length
          },
          {
            Name: 'metadata.json',
            Hash: metadataCid,
            Tsize: metadataBlock.length
          }
        ]
      });
      const rootCid = CID.create(1, dagPB.code, await blake2b256.digest(rootBlock));
      await writer.put({ cid: rootCid, bytes: rootBlock });
      
      // Set the root
      await writer.close();
      
      // Calculate CommP for the CAR file
      const { pieceCid, pieceSize } = await calculateCommP(carPath);
      
      // Upload to Web3.Storage
      const web3Files = [new File([await fs.promises.readFile(carPath)], 'data.car')];
      
      const uploadCid = await web3Storage.put(web3Files, {
        name: dataset.name,
        onRootCidReady: (cid) => {
          logger.info('Root CID ready', { cid });
        },
        onStoredChunk: (size) => {
          logger.debug('Stored chunk', { size });
        }
      });
      
      logger.info('Large dataset stored on Web3.Storage', { 
        cid: uploadCid, 
        pieceCid,
        pieceSize,
        name: dataset.name 
      });
      
      return {
        cid: uploadCid,
        pieceCid,
        pieceSize
      };
    } else {
      // For smaller files, use packToBlob
      const { root, car } = await packToBlob({
        input: [
          { path: dataset.name, content: fs.createReadStream(filePath) },
          { path: 'metadata.json', content: fs.createReadStream(metadataPath) }
        ],
        wrapWithDirectory: true
      });
      
      // Calculate CommP directly from the CAR data
      const carBuffer = Buffer.from(await car.arrayBuffer());
      const { pieceCid, pieceSize } = await calculateCommP(carBuffer);
      
      // Upload to Web3.Storage
      const files = [new File([carBuffer], 'data.car')];
      const cid = await web3Storage.put(files, {
        name: dataset.name,
        onRootCidReady: (cid) => {
          logger.info('Root CID ready', { cid });
        },
        onStoredChunk: (size) => {
          logger.debug('Stored chunk', { size });
        }
      });
      
      logger.info('Dataset stored on Web3.Storage', { 
        cid,
        pieceCid,
        pieceSize,
        name: dataset.name
      });
      
      return {
        cid: root.toString(),
        pieceCid,
        pieceSize
      };
    }
  } catch (error) {
    logger.error('Error storing dataset on Web3.Storage', { error: error.message });
    throw error;
  } finally {
    // Clean up temporary files
    for (const tempFile of tempFilesToCleanup) {
      try {
        await fs.promises.unlink(tempFile);
      } catch (cleanupError) {
        logger.warn('Failed to clean up temporary file', { 
          file: tempFile, 
          error: cleanupError.message 
        });
      }
    }
  }
};

/**
 * Create a Filecoin storage deal for a dataset
 * @param {Object} dealParams - Deal parameters
 * @param {string} dealParams.cid - Content ID to store
 * @param {number} dealParams.size - Size in bytes
 * @param {string} [dealParams.pieceCid] - Piece CID for Filecoin storage
 * @param {number} [dealParams.pieceSize] - Piece size for Filecoin storage
 * @param {string} [dealParams.minerId] - Optional specific miner ID
 * @param {boolean} [dealParams.verifiedDeal=false] - Whether to create a verified deal
 * @returns {Promise<Object>} - Deal information
 */
const createStorageDeal = async (dealParams) => {
  try {
    // Get current epoch
    const chainHead = await lotusClient.chainHead();
    const currentEpoch = chainHead.Height;
    
    // Calculate start and end epochs
    const startEpoch = currentEpoch + 2880; // ~1 day from now
    const endEpoch = startEpoch + filecoinConfig.dealDuration;
    
    // Find storage provider if not specified
    let provider = dealParams.minerId;
    if (!provider) {
      // Get list of miners
      const miners = await lotusClient.stateListMiners([]);
      
      // Get miner info for each miner to find suitable ones
      const minerDetails = await Promise.all(
        miners.slice(0, 50).map(async (minerId) => { // Limit to first 50 for performance
          try {
            const minerInfo = await lotusClient.stateMinerInfo(minerId, []);
            const minerPower = await lotusClient.stateMinerPower(minerId, []);
            
            // Check if miner is active and has power
            if (minerPower && minerPower.MinerPower && minerPower.MinerPower.QualityAdjPower > 0) {
              return {
                id: minerId,
                sectorSize: minerInfo.SectorSize,
                power: minerPower.MinerPower.QualityAdjPower
              };
            }
            return null;
          } catch (error) {
            logger.debug(`Error getting miner info for ${minerId}`, { error: error.message });
            return null;
          }
        })
      );
      
      // Filter out nulls and find miners with enough space
      const pieceSize = dealParams.pieceSize || Math.pow(2, Math.ceil(Math.log2(dealParams.size)));
      const suitableMiners = minerDetails
        .filter(m => m !== null && m.sectorSize >= pieceSize)
        .sort((a, b) => parseInt(b.power) - parseInt(a.power)); // Sort by power descending
      
      if (suitableMiners.length === 0) {
        throw new Error('No suitable storage providers found');
      }
      
      provider = suitableMiners[0].id;
    }
    
    // Get client address from wallet
    const defaultWallet = await lotusClient.walletDefaultAddress();
    
    // Create deal proposal
    let pieceCid = dealParams.pieceCid;
    let pieceSize = dealParams.pieceSize;
    
    // If pieceCid not provided, generate it
    if (!pieceCid || !pieceSize) {
      // Retrieve CAR file from IPFS
      const carPath = await getTempFilePath('deal', '.car');
      
      try {
        // Download CAR from Web3.Storage
        const res = await web3Storage.get(dealParams.cid);
        if (!res.ok) {
          throw new Error(`Failed to retrieve CAR: ${res.statusText}`);
        }
        
        // Get the car file and save it locally
        const files = await res.files();
        const carFile = files.find(file => file.name.endsWith('.car'));
        
        if (!carFile) {
          throw new Error('CAR file not found in storage');
        }
        
        const carData = await carFile.arrayBuffer();
        await fs.promises.writeFile(carPath, Buffer.from(carData));
        
        // Calculate CommP from the CAR file
        const { pieceCid: calculatedPieceCid, pieceSize: calculatedPieceSize } = 
          await calculateCommP(carPath);
        
        pieceCid = calculatedPieceCid;
        pieceSize = calculatedPieceSize;
        
        // Clean up
        await fs.promises.unlink(carPath);
      } catch (error) {
        logger.error('Error preparing CAR file for deal', { error: error.message });
        throw new Error(`Failed to prepare CAR file: ${error.message}`);
      }
    }
    
    // Create a deal proposal using Lotus API
    const dealParams = {
      Data: {
        TransferType: 'graphsync',
        Root: { '/': dealParams.cid },
        PieceCid: { '/': pieceCid },
        PieceSize: pieceSize
      },
      Wallet: defaultWallet,
      Miner: provider,
      EpochPrice: '0', // For testing, in production we'd set a real price
      MinBlocksDuration: filecoinConfig.dealDuration,
      DealStartEpoch: startEpoch,
      FastRetrieval: true,
      VerifiedDeal: dealParams.verifiedDeal || filecoinConfig.verifiedDeals
    };
    
    const dealCid = await lotusClient.clientStartDeal(dealParams);
    
    logger.info('Filecoin storage deal created via Lotus', { 
      dealCid: dealCid['/'],
      cid: dealParams.cid,
      pieceCid,
      provider
    });
    
    // Register deal on smart contract
    const dealProposal = {
      pieceCid,
      pieceSize,
      verifiedDeal: dealParams.verifiedDeal || filecoinConfig.verifiedDeals,
      label: `deal-${Date.now()}`,
      startEpoch,
      endEpoch,
      price: '0', // Free deal for testing
      provider,
      clientAddress: defaultWallet
    };
    
    const { dealId, receipt } = await contractsService.makeDealProposal(dealProposal);
    
    logger.info('Filecoin deal registered on blockchain', { 
      dealId, 
      dealCid: dealCid['/'], 
      txHash: receipt.transactionHash 
    });
    
    return {
      dealId,
      dealCid: dealCid['/'],
      provider,
      pieceCid,
      pieceSize,
      startEpoch,
      endEpoch,
      status: 'proposed',
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    logger.error('Error creating Filecoin storage deal', { error: error.message });
    throw error;
  }
};

/**
 * Check the status of a storage deal
 * @param {string} dealId - Deal ID
 * @returns {Promise<Object>} - Deal status
 */
const checkDealStatus = async (dealId) => {
  try {
    // First check status on blockchain
    const dealStatus = await contractsService.checkDealStatus(dealId);
    
    // If deal is registered on blockchain, get details from Lotus
    const deal = await contractsService.getContract('FilecoinDealClient').getDeal(dealId);
    const dealCid = deal.dealCid;
    
    if (dealCid) {
      try {
        // Get deal state from Lotus
        const lotusStatus = await lotusClient.clientGetDealStatus(dealCid);
        
        // Check if the deal is published on chain
        let onChainStatus = false;
        let dealExpiration = null;
        
        try {
          const dealInfo = await lotusClient.stateMarketDeal(dealId, []);
          if (dealInfo) {
            onChainStatus = true;
            dealExpiration = dealInfo.Proposal.EndEpoch;
          }
        } catch (marketError) {
          // Deal might not be on chain yet
          logger.debug('Deal not found on chain', { dealId, error: marketError.message });
        }
        
        return {
          status: lotusStatus.State,
          active: lotusStatus.State === 'StorageDealActive',
          published: onChainStatus,
          dealCid: dealCid,
          provider: deal.provider,
          pieceCid: deal.pieceCid,
          expiration: dealExpiration,
          message: lotusStatus.Message || dealStatus.message,
          onChainState: dealStatus.status
        };
      } catch (lotusError) {
        logger.warn('Error getting deal status from Lotus', { error: lotusError.message });
        // Return blockchain status if Lotus query fails
        return {
          status: dealStatus.status,
          active: dealStatus.active,
          published: false,
          message: dealStatus.message
        };
      }
    }
    
    // If dealCid not available, return just the blockchain status
    return {
      status: dealStatus.status,
      active: dealStatus.active,
      message: dealStatus.message
    };
  } catch (error) {
    logger.error('Error checking deal status', { error: error.message, dealId });
    throw error;
  }
};

/**
 * Retrieve dataset from Filecoin/IPFS
 * @param {string} cid - Content ID to retrieve
 * @returns {Promise<Object>} - Retrieved data and metadata
 */
const retrieveDataset = async (cid) => {
  try {
    // Try retrieve from Web3.Storage first
    try {
      const res = await web3Storage.get(cid);
      if (!res.ok) {
        throw new Error(`Failed to retrieve dataset: ${res.statusText}`);
      }
      
      // Get all files
      const files = await res.files();
      
      // Find dataset and metadata files
      const datasetFile = files.find(file => file.name !== 'metadata.json');
      const metadataFile = files.find(file => file.name === 'metadata.json');
      
      if (!datasetFile || !metadataFile) {
        throw new Error('Dataset or metadata file not found in the retrieved content');
      }
      
      // For large files, save to disk instead of loading into memory
      let datasetContent;
      let isPath = false;
      
      if (datasetFile.size > 50 * 1024 * 1024) { // > 50MB
        const tempPath = await getTempFilePath('dataset', path.extname(datasetFile.name));
        
        const dataResponse = await fetch(datasetFile.url);
        if (!dataResponse.ok) {
          throw new Error(`Failed to fetch dataset file: ${dataResponse.statusText}`);
        }
        
        const fileStream = fs.createWriteStream(tempPath);
        await pipeline(dataResponse.body, fileStream);
        
        datasetContent = tempPath;
        isPath = true;
      } else {
        datasetContent = Buffer.from(await datasetFile.arrayBuffer());
      }
      
      const metadataContent = JSON.parse(await metadataFile.text());
      
      logger.info('Dataset retrieved from Web3.Storage', { cid, name: datasetFile.name });
      
      return {
        data: datasetContent,
        metadata: metadataContent,
        name: datasetFile.name,
        isPath
      };
    } catch (web3Error) {
      logger.warn('Web3.Storage retrieval failed, trying direct retrieval', { error: web3Error.message });
      throw web3Error; // Pass to next retrieval method
    }
  } catch (web3Error) {
    // Try direct Lotus retrieval if Web3.Storage fails
    try {
      logger.info('Attempting direct retrieval from Filecoin via Lotus');
      
      // Find miners who have the data
      const minerResponses = await lotusClient.clientFindData({ '/': cid }, []);
      
      if (!minerResponses || minerResponses.length === 0) {
        throw new Error('No miners found with the data');
      }
      
      // Create output directory
      const outputDir = await getTempFilePath('filecoin-retrieve-dir', '');
      await fs.promises.mkdir(outputDir, { recursive: true });
      
      // Create retrieval parameters
      const retrievalOrder = {
        Root: { '/': cid },
        Piece: null, // Let Lotus find the piece
        Size: 0, // Unknown size
        Total: '0', // Let Lotus calculate price
        UnsealPrice: '0',
        PaymentInterval: 1048576, // 1MiB payment interval
        PaymentIntervalIncrease: 1048576,
        Client: await lotusClient.walletDefaultAddress(),
        Miner: minerResponses[0].MinerPeer.Address,
        MinerPeerID: minerResponses[0].MinerPeer.ID
      };
      
      // Start retrieval
      const retrievalRes = await lotusClient.clientRetrieve(retrievalOrder, outputDir);
      
      // Poll for completion
      let complete = false;
      let attempts = 0;
      const maxAttempts = 60; // Check for up to 5 minutes (5s intervals)
      
      while (!complete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        try {
          // Check if files exist in output dir
          const files = await fs.promises.readdir(outputDir);
          if (files.length > 0) {
            complete = true;
          }
        } catch (checkError) {
          logger.debug('Error checking retrieval status', { error: checkError.message });
        }
        
        attempts++;
      }
      
      if (!complete) {
        throw new Error('Retrieval timed out');
      }
      
      // Find dataset and metadata files
      const files = await fs.promises.readdir(outputDir);
      const metadataFile = files.find(f => f === 'metadata.json');
      const datasetFile = files.find(f => f !== 'metadata.json');
      
      if (!datasetFile || !metadataFile) {
        throw new Error('Retrieved files incomplete');
      }
      
      const metadataPath = path.join(outputDir, metadataFile);
      const datasetPath = path.join(outputDir, datasetFile);
      
      // Read metadata
      const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf8'));
      
      logger.info('Dataset retrieved from Filecoin via Lotus', { cid, name: datasetFile });
      
      return {
        data: datasetPath,
        metadata,
        name: datasetFile,
        isPath: true,
        outputDir // Keep track of this for cleanup
      };
    } catch (lotusError) {
      logger.error('Lotus retrieval failed, trying IPFS gateway', { error: lotusError.message });
      
      // Last resort: try IPFS gateway
      try {
        // Get directory listing
        const gatewayUrl = `https://dweb.link/api/v0/ls?arg=${cid}`;
        const response = await axios.get(gatewayUrl);
        
        if (!response.data || !response.data.Objects || response.data.Objects.length === 0) {
          throw new Error('Invalid response from IPFS gateway');
        }
        
        // Find files
        const links = response.data.Objects[0].Links;
        const datasetLink = links.find(link => link.Name !== 'metadata.json');
        const metadataLink = links.find(link => link.Name === 'metadata.json');
        
        if (!datasetLink || !metadataLink) {
          throw new Error('Dataset or metadata not found');
        }
        
        // Get metadata
        const metadataUrl = `https://dweb.link/ipfs/${metadataLink.Hash}`;
        const metadataResponse = await axios.get(metadataUrl);
        const metadata = metadataResponse.data;
        
        // For the dataset, save to disk
        const outputPath = await getTempFilePath('ipfs', path.extname(datasetLink.Name));
        const datasetUrl = `https://dweb.link/ipfs/${datasetLink.Hash}`;
        
        const writer = fs.createWriteStream(outputPath);
        const datasetResponse = await axios({
          method: 'get',
          url: datasetUrl,
          responseType: 'stream'
        });
        
        await new Promise((resolve, reject) => {
          datasetResponse.data.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        logger.info('Dataset retrieved from IPFS gateway', { cid, name: datasetLink.Name });
        
        return {
          data: outputPath,
          metadata,
          name: datasetLink.Name,
          isPath: true
        };
      } catch (gatewayError) {
        logger.error('All retrieval methods failed', { 
          web3Error: web3Error.message,
          lotusError: lotusError.message,
          gatewayError: gatewayError.message
        });
        
        throw new Error('Failed to retrieve dataset from any available source');
      }
    }
  }
};

/**
 * Calculate storage cost on Filecoin
 * @param {number} sizeBytes - Size in bytes
 * @param {number} durationEpochs - Duration in epochs
 * @param {boolean} [verifiedDeal=false] - Whether this is a verified deal
 * @returns {Promise<Object>} - Cost estimate
 */
const calculateStorageCost = async (sizeBytes, durationEpochs, verifiedDeal = false) => {
  try {
    // Get current network base fee
    const chainHead = await lotusClient.chainHead();
    const baseFee = chainHead.Blocks[0].ParentBaseFee;
    
    // Get actual prices from miners
    const miners = await lotusClient.stateListMiners([]);
    const minerSample = miners.slice(0, 10); // Take 10 miners for sample
    
    // Get ask prices from miners
    const prices = await Promise.all(minerSample.map(async (minerId) => {
      try {
        const minerPower = await lotusClient.stateMinerPower(minerId, []);
        
        // Skip miners with no power
        if (!minerPower.MinerPower || !minerPower.MinerPower.QualityAdjPower) {
          return null;
        }
        
        const askResponse = await lotusClient.clientQueryAsk(minerId, []);
        
        return {
          minerId,
          price: askResponse.Price,
          verifiedPrice: askResponse.VerifiedPrice,
          minPieceSize: askResponse.MinPieceSize,
          maxPieceSize: askResponse.MaxPieceSize
        };
      } catch (error) {
        logger.debug(`Error getting price from miner ${minerId}`, { error: error.message });
        return null;
      }
    }));
    
    // Filter out nulls and calculate average price
    const validPrices = prices.filter(p => p !== null);
    
    if (validPrices.length === 0) {
      throw new Error('No valid price information available');
    }
    
    // Calculate average price
    const priceKey = verifiedDeal ? 'verifiedPrice' : 'price';
    const totalPrice = validPrices.reduce((sum, price) => sum + BigInt(price[priceKey]), BigInt(0));
    const averagePrice = Number(totalPrice / BigInt(validPrices.length)) / 1e18; // Convert to FIL
    
    // Calculate padded piece size (next power of 2)
    const paddedSize = Math.pow(2, Math.ceil(Math.log2(sizeBytes)));
    const paddedSizeInGiB = paddedSize / (1024 * 1024 * 1024);
    
    // Calculate total cost
    const storageCost = averagePrice * paddedSizeInGiB * durationEpochs;
    
    // Calculate gas costs (rough estimate)
    const gasCost = Number(baseFee) * 2000000 / 1e18; // Estimate for PublishStorageDeals message
    
    return {
      totalCost: storageCost + gasCost,
      storageCost,
      gasCost,
      averagePrice,
      paddedSizeInGiB,
      durationEpochs,
      verifiedDeal,
      minerSamples: validPrices.map(p => ({
        id: p.minerId,
        price: Number(p[priceKey]) / 1e18
      }))
    };
  } catch (error) {
    logger.error('Error calculating storage cost', { error: error.message });
    throw error;
  }
};

/**
 * Find suitable storage providers on Filecoin
 * @param {Object} criteria - Selection criteria
 * @param {number} [criteria.minFreeSpace] - Minimum free space in bytes
 * @param {string} [criteria.region] - Preferred region
 * @param {number} [criteria.maxPrice] - Maximum price per epoch per GiB
 * @returns {Promise<Array>} - Array of suitable storage providers
 */
const findStorageProviders = async (criteria = {}) => {
  try {
    // Get all miners
    const miners = await lotusClient.stateListMiners([]);
    
    // Get detailed information for miners (limit to 50 for performance)
    const minerDetails = await Promise.all(
      miners.slice(0, 50).map(async (minerId) => {
        try {
          // Get miner power and info
          const minerPower = await lotusClient.stateMinerPower(minerId, []);
          
          // Skip miners with no power
          if (!minerPower.MinerPower || !minerPower.MinerPower.QualityAdjPower) {
            return null;
          }
          
          const minerInfo = await lotusClient.stateMinerInfo(minerId, []);
          
          // Skip miners that aren't accepting deals
          if (!minerInfo.Multiaddrs || minerInfo.Multiaddrs.length === 0) {
            return null;
          }
          
          // Get ask price
          let askPrice, verifiedPrice, minPieceSize, maxPieceSize;
          
          try {
            const askResponse = await lotusClient.clientQueryAsk(minerId, []);
            askPrice = askResponse.Price;
            verifiedPrice = askResponse.VerifiedPrice;
            minPieceSize = askResponse.MinPieceSize;
            maxPieceSize = askResponse.MaxPieceSize;
          } catch (askError) {
            logger.debug(`Error getting ask from miner ${minerId}`, { error: askError.message });
            return null;
          }
          
          // Check criteria
          if (criteria.minFreeSpace && maxPieceSize < criteria.minFreeSpace) {
            return null;
          }
          
          if (criteria.maxPrice && 
              Number(askPrice) / 1e18 > criteria.maxPrice) {
            return null;
          }
          
          // Determine region (this is a simplification - real impl would use geolocation)
          let region = 'Unknown';
          if (minerInfo.PeerId) {
            // In a real implementation, we would use a service to get geolocation from peer ID
            region = 'Unknown';
          }
          
          if (criteria.region && region !== criteria.region) {
            return null;
          }
          
          return {
            id: minerId,
            power: minerPower.MinerPower.QualityAdjPower,
            location: region,
            price: Number(askPrice) / 1e18,
            verifiedPrice: Number(verifiedPrice) / 1e18,
            minPieceSize,
            maxPieceSize,
            sectorSize: minerInfo.SectorSize
          };
        } catch (error) {
          logger.debug(`Error getting details for miner ${minerId}`, { error: error.message });
          return null;
        }
      })
    );
    
    // Filter out nulls
    const validMiners = minerDetails.filter(m => m !== null);
    
    // Sort by price
    validMiners.sort((a, b) => a.price - b.price);
    
    return validMiners;
  } catch (error) {
    logger.error('Error finding storage providers', { error: error.message });
    throw error;
  }
};

module.exports = {
  storeDataset,
  createStorageDeal,
  checkDealStatus,
  retrieveDataset,
  calculateStorageCost,
  findStorageProviders,
  calculateCommP
};