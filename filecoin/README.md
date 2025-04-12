# Filecoin Integration for DataProvChain

A comprehensive library for integrating Filecoin storage into the DataProvChain platform, providing decentralized storage solutions for AI datasets with full provenance tracking and verification.

## Features

- **Storage Management**: Create, monitor and extend storage deals on Filecoin
- **Data Retrieval**: Retrieve data stored on Filecoin with optimal strategies
- **Storage Optimization**: Optimize storage parameters for cost efficiency and reliability
- **Verification Tools**: Generate and verify cryptographic proofs for data integrity
- **CAR File Handling**: Tools for working with Content Addressable Archives (CAR)
- **RPC Interactions**: Streamlined interfaces to Filecoin RPC endpoints

## Installation

```bash
npm install filecoin-integration
```

## Environment Setup

Create a `.env` file in your project root with the following variables:

```env
# Filecoin Network
FILECOIN_NETWORK=calibrationnet  # Options: mainnet, calibrationnet

# RPC Endpoints
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
LOTUS_API_URL=https://api.calibration.node.glif.io

# Authentication
WEB3_STORAGE_TOKEN=your_web3_storage_token
LOTUS_AUTH_TOKEN=your_lotus_auth_token
FILECOIN_WALLET_PRIVATE_KEY=your_wallet_private_key
FILECOIN_WALLET_ADDRESS=your_wallet_address

# Storage Parameters
FILECOIN_DEFAULT_DEAL_DURATION=518400  # ~180 days in epochs
FILECOIN_REPLICATION_FACTOR=3
FILECOIN_DEFAULT_VERIFIED_DEAL=true
```

## Usage Examples

### Storing Data on Filecoin

```javascript
const { createStorageDeal } = require('filecoin-integration/src/storage/deal');

async function storeDataset() {
  try {
    const dataBuffer = Buffer.from('Sample dataset content');
    
    const result = await createStorageDeal({
      data: dataBuffer,
      name: 'Sample Dataset',
      description: 'A sample dataset for demonstration',
      dataType: 'text',
      owner: '0x1234...',
      dealParams: {
        verifiedDeal: true,
        duration: 518400 // ~180 days
      }
    });
    
    console.log('Dataset stored successfully:');
    console.log(`CID: ${result.cid}`);
    console.log(`Deal ID: ${result.dealId}`);
    console.log(`Status: ${result.status}`);
    
    return result;
  } catch (error) {
    console.error('Failed to store dataset:', error.message);
  }
}

storeDataset();
```

### Retrieving Data from Filecoin

```javascript
const { retrieveData, retrieveMetadata } = require('filecoin-integration/src/storage/retrieve');
const fs = require('fs');

async function retrieveDataset(cid) {
  try {
    // First retrieve metadata to understand what we're working with
    const metadata = await retrieveMetadata(cid);
    console.log('Dataset Metadata:', metadata);
    
    // Retrieve the actual data
    const data = await retrieveData(cid, {
      fast: true, // Prioritize speed over cost
      outputPath: './retrieved-dataset.bin'
    });
    
    console.log('Dataset retrieved successfully to:', './retrieved-dataset.bin');
    return data;
  } catch (error) {
    console.error('Failed to retrieve dataset:', error.message);
  }
}

retrieveDataset('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi');
```

### Optimizing Storage Parameters

```javascript
const { optimizeStorageParams } = require('filecoin-integration/src/storage/optimize');
const { formatBytes } = require('filecoin-integration/src/utils/conversion');

async function getOptimalStorageStrategy(fileSizeBytes) {
  try {
    const result = await optimizeStorageParams(fileSizeBytes, {
      priorityFactor: 'balanced', // Options: 'cost', 'reliability', 'balanced'
      budget: 0.5, // Max budget in FIL
      minReplicationFactor: 2
    });
    
    console.log('Optimal Storage Strategy:');
    console.log(`Original Size: ${formatBytes(result.sizeBytes)}`);
    console.log(`Padded Size: ${formatBytes(result.paddedSize)}`);
    console.log(`Optimal Duration: ${result.optimalDuration} epochs (~${Math.floor(result.optimalDuration * 30 / 86400)} days)`);
    console.log(`Replication Factor: ${result.replicationFactor}`);
    console.log(`Estimated Cost per Replica: ${result.costEstimate.perReplica} FIL`);
    console.log(`Total Estimated Cost: ${result.costEstimate.totalFil} FIL`);
    
    console.log('\nRecommended Providers:');
    result.optimalProviders.forEach((provider, index) => {
      console.log(`${index + 1}. Provider: ${provider.provider}, Region: ${provider.region}, Price: ${provider.pricePerEpochPerGiB} attoFIL/epoch/GiB`);
    });
    
    return result;
  } catch (error) {
    console.error('Failed to optimize storage parameters:', error.message);
  }
}

// Optimize for a 10 GB dataset
getOptimalStorageStrategy(10 * 1024 * 1024 * 1024);
```

### Generating and Verifying Proofs

```javascript
const { generateInclusionProof, serializeProof } = require('filecoin-integration/src/verification/proof');
const { verifyInclusionProof } = require('filecoin-integration/src/verification/verify');

async function demonstrateVerification(dealId, cid) {
  try {
    // Generate proof
    console.log(`Generating inclusion proof for deal ${dealId}, CID ${cid}...`);
    const proof = await generateInclusionProof(dealId, cid);
    console.log('Proof generated successfully:', proof);
    
    // Verify proof
    console.log('Verifying proof...');
    const isValid = await verifyInclusionProof(proof, dealId, cid);
    console.log('Proof verification result:', isValid ? 'Valid' : 'Invalid');
    
    // Serialize for on-chain use
    const serializedProof = serializeProof(proof);
    console.log('Serialized proof for on-chain verification:', serializedProof);
    
    return { proof, isValid, serializedProof };
  } catch (error) {
    console.error('Verification failed:', error.message);
  }
}

demonstrateVerification('12345', 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi');
```

### Working with CAR Files

```javascript
const { generateCarFromData } = require('filecoin-integration/src/car/generator');
const { extractFromCar, listCarContents } = require('filecoin-integration/src/car/parser');
const fs = require('fs');

async function demonstrateCarHandling() {
  try {
    // Create some sample data
    const data = {
      name: 'Sample Dataset',
      content: 'This is a sample dataset for CAR file demonstration',
      timestamp: new Date().toISOString()
    };
    
    // Generate CAR file
    console.log('Generating CAR file...');
    const carResult = await generateCarFromData(JSON.stringify(data), {
      wrapWithDirectory: true,
      outputPath: './sample-data.car'
    });
    
    console.log(`CAR file generated with root CID: ${carResult.rootCID}`);
    console.log(`CAR file size: ${carResult.carSize} bytes`);
    console.log(`Padded piece size: ${carResult.pieceSize} bytes`);
    
    // List CAR contents
    console.log('\nListing CAR contents:');
    const contents = await listCarContents('./sample-data.car');
    console.log(`Roots: ${contents.roots.join(', ')}`);
    console.log(`Number of blocks: ${contents.blocks.length}`);
    
    // Extract from CAR
    console.log('\nExtracting CAR contents:');
    const extracted = await extractFromCar('./sample-data.car', {
      outputDir: './extracted'
    });
    
    console.log(`Extracted ${extracted.files.length} files to ${extracted.outputDir}`);
    
    return { carResult, contents, extracted };
  } catch (error) {
    console.error('CAR handling failed:', error.message);
  }
}

demonstrateCarHandling();
```

## API Reference

### Storage Management

#### Deal Management (`storage/deal.js`)

- `createStorageDeal(options)` - Creates a new storage deal
- `checkDealStatus(dealId)` - Checks the status of a storage deal
- `extendDeal(dealId, additionalEpochs)` - Extends the duration of an existing deal
- `findStorageProviders(criteria)` - Finds the best storage providers based on criteria
- `calculateStorageCost(sizeBytes, durationEpochs, verifiedDeal)` - Calculates estimated cost for storage

#### Data Retrieval (`storage/retrieve.js`)

- `retrieveData(cid, options)` - Retrieves data from Filecoin by CID
- `retrieveMetadata(cid)` - Retrieves metadata for a stored dataset
- `checkDataAvailability(cid)` - Verifies availability of data on Filecoin
- `findStorageProvidersByCid(cid)` - Lists all miners storing a specific CID
- `getRetrievalCost(cid, minerId)` - Gets the retrieval cost from a specific miner
- `retrieveFileFromCid(cid, filePath)` - Retrieves a specific file from a dataset CID

#### Storage Optimization (`storage/optimize.js`)

- `optimizeStorageParams(sizeBytes, options)` - Optimizes storage parameters for a dataset
- `calculateChunkingStrategy(sizeBytes)` - Calculates the optimal chunking strategy for large datasets
- `recommendRenewalSchedule(dealId, targetDuration)` - Recommends deal renewal schedule
- `createRenewalPlan(dealIds, options)` - Creates an automated renewal plan for deals
- `recommendProviders(dataset)` - Recommends storage providers based on historical performance
- `optimizeDistribution(dataset, providers, options)` - Distributes data optimally across miners

### Verification Tools

#### Proof Generation (`verification/proof.js`)

- `generateInclusionProof(dealId, cid)` - Generates an inclusion proof for data in a Filecoin deal
- `generateMerkleProof(data, parentCid)` - Generates a merkle proof for a specific piece of data
- `generatePossessionProof(cid, options)` - Generates a proof of data possession
- `signData(data, privateKey)` - Signs data with a private key to prove ownership
- `serializeProof(proof)` - Serializes a proof for on-chain submission

#### Proof Verification (`verification/verify.js`)

- `verifyInclusionProof(proof, dealId, cid)` - Verifies an inclusion proof for data in a Filecoin deal
- `verifyMerkleProof(proof, leaf, root)` - Verifies a merkle proof
- `verifyPossessionProof(proof, cid, proverAddress)` - Verifies a proof of data possession
- `verifySignature(data, signature, address)` - Verifies a data signature
- `verifyDealValidity(dealId)` - Verifies a storage deal's validity on the Filecoin network
- `deserializeProof(serializedProof)` - Deserializes a serialized proof

### CAR File Handling

#### CAR File Generator (`car/generator.js`)

- `generateCarFromData(data, options)` - Generates a CAR file from data in memory
- `generateCarFromDirectory(directoryPath, options)` - Generates a CAR file from files in a directory
- `generateCarFromLargeFile(filePath, options)` - Generates a CAR file from a large file with streaming
- `calculatePieceCid(carData)` - Calculates the piece commitment (piece CID) for a CAR file
- `mergeCarFiles(carPaths, outputPath)` - Merges multiple CAR files into a single CAR file

#### CAR File Parser (`car/parser.js`)

- `extractFromCar(carData, options)` - Extracts data from a CAR file
- `listCarContents(carData)` - Lists contents of a CAR file without extracting
- `extractMetadata(carData)` - Extracts metadata from a CAR file
- `verifyCarIntegrity(carData)` - Verifies integrity of a CAR file
- `extractFileFromCar(carData, extractPath)` - Extracts a specific file from a CAR archive by path
- `getCarStats(carData)` - Gets stats about a CAR file

### RPC Interactions

#### RPC Client (`rpc/client.js`)

- `createLotusClient(options)` - Creates a Lotus RPC client
- `createFilecoinClient(options)` - Creates a Filecoin HTTP client
- `makeRpcCall(method, params, options)` - Makes a raw RPC call to a Filecoin node
- `makeBatchRpcCalls(calls, options)` - Executes a batch of RPC calls
- `testConnection(endpoint)` - Tests connection to a Filecoin RPC endpoint

#### RPC Methods (`rpc/methods.js`)

- `getChainHead()` - Gets the current chain head
- `getBalance(address)` - Gets balance for a Filecoin address
- `getDealInfo(dealId)` - Gets deal information
- `getMinerInfo(minerId)` - Gets storage provider information
- `sendMessage(message, privateKey)` - Sends a message on the Filecoin network
- `waitForMessage(messageCid, options)` - Waits for a message to be included in a block
- `getNetworkVersion()` - Gets the network version
- `getCurrentEpoch()` - Gets the current epoch
- `listMiners()` - Lists all miners on the network
- `getClientDeals(clientAddress)` - Gets deals for a specific client address
- `findDealByDataCid(clientAddress, dataCid)` - Checks if a client has a specific deal

### Utility Functions

#### CID Utilities (`utils/cid.js`)

- `createCidFromData(data, options)` - Creates a CID from data
- `isValidCid(cidString)` - Validates a CID string
- `cidToIpfsPath(cid)` - Converts a CID to IPFS path
- `convertCidV0ToV1(cidV0)` - Converts CID v0 to CID v1
- `convertCidV1ToV0(cidV1)` - Converts CID v1 to CID v0 if possible
- `getMultihashFromCid(cid)` - Gets the multihash from a CID
- `createPieceCid(pieceCommitment)` - Creates a CID from a piece commitment

#### Configuration Utilities (`utils/config.js`)

- `getConfig()` - Gets current configuration
- `getNetworkConfig(network)` - Gets configuration for a specific network
- `getRpcUrl()` - Gets RPC endpoint URL for current network
- `getAuthToken()` - Gets the authentication token for the current network
- `validateConfig()` - Validates configuration
- `ensureTempDir()` - Ensures temp directory exists
- `updateConfig(updates)` - Updates configuration values

#### Conversion Utilities (`utils/conversion.js`)

- `attoFilToFil(attoFil)` - Converts attoFIL to FIL
- `filToAttoFil(fil)` - Converts FIL to attoFIL
- `formatBytes(bytes, si)` - Converts bytes to a human-readable size
- `ethToFilecoinAddress(ethAddress)` - Converts Ethereum address to Filecoin address
- `filecoinToEthAddress(filecoinAddress)` - Converts Filecoin address to Ethereum address
- `secondsToEpochs(seconds)` - Converts seconds to Filecoin epochs
- `epochsToSeconds(epochs)` - Converts Filecoin epochs to seconds
- `calcPaddedPieceSize(size)` - Calculates padded piece size
- `formatSectorSize(sectorSizeBytes)` - Converts sector size from bytes to human readable format
- `dealIdToHex(dealId)` - Converts a deal ID to a hex string

## Error Handling

All functions include comprehensive error handling and will throw descriptive error messages when issues occur. It's recommended to wrap calls in try/catch blocks to handle errors gracefully:

```javascript
try {
  const result = await retrieveData(cid);
  console.log('Data retrieved successfully:', result);
} catch (error) {
  console.error('Error retrieving data:', error.message);
  
  // Handle specific error types
  if (error.message.includes('not found')) {
    console.log('The CID was not found. It may not be stored on Filecoin yet.');
  } else if (error.message.includes('connection')) {
    console.log('Network connection issue. Please check your internet connection.');
  }
}
```

## Logging and Debugging

For debugging purposes, you can enable verbose logging by setting the environment variable:

```
DEBUG=filecoin-integration:*
```

This will output detailed logs for all operations, helping to diagnose issues.

## Best Practices

1. **Deal Management**:
   - Always check deal status before assuming data is available
   - Use verified deals for cheaper storage when eligible
   - Consider replication across multiple miners for important data

2. **Data Retrieval**:
   - Use `checkDataAvailability` before attempting retrieval
   - Set appropriate timeouts for retrieval operations
   - Consider using the `fast` option for user-facing applications

3. **Storage Optimization**:
   - Use `optimizeStorageParams` to get cost-effective storage settings
   - Balance replication factor against budget constraints
   - Consider chunking large datasets with `calculateChunkingStrategy`

4. **Security**:
   - Keep private keys secure and never expose them in logs
   - Verify all retrieved data using the verification tools
   - Use `signData` to prove data ownership

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.