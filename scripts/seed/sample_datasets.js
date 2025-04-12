// scripts/seed/sample_datasets.js

const { ethers } = require('hardhat');
const { getDeployedAddress } = require('../utils/contract_utils');
const { uploadToWeb3Storage } = require('../utils/ipfs_utils');

async function main() {
  console.log('Seeding sample datasets...');
  
  // Get signers
  const [deployer, user1, user2, user3] = await ethers.getSigners();
  
  // Get DatasetRegistry contract
  const registryAddress = await getDeployedAddress('DatasetRegistry');
  if (!registryAddress) {
    console.error('DatasetRegistry contract not deployed');
    return;
  }
  const registry = await ethers.getContractAt('DatasetRegistry', registryAddress);
  
  // Sample datasets
  const datasets = [
    {
      name: 'ImageNet Subset',
      description: 'A curated subset of ImageNet for testing',
      dataType: 'image',
      source: 'ImageNet',
      license: 'CC-BY-4.0',
      cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      contributors: [
        { wallet: user1.address, name: 'Researcher1', share: 60 },
        { wallet: user2.address, name: 'Researcher2', share: 40 }
      ]
    },
    {
      name: 'Text Corpus Sample',
      description: 'Sample text corpus for language model training',
      dataType: 'text',
      source: 'Project Gutenberg',
      license: 'MIT',
      cid: 'bafybeihvhgklkwu7go262rll37qwaf3k7yy7xrhpfbsf6fg7cy7cllb63e',
      contributors: [
        { wallet: user1.address, name: 'Researcher1', share: 30 },
        { wallet: user3.address, name: 'Researcher3', share: 70 }
      ]
    },
    {
      name: 'Audio Recordings Dataset',
      description: 'Collection of audio recordings for speech recognition',
      dataType: 'audio',
      source: 'Common Voice',
      license: 'CC0-1.0',
      cid: 'bafybeihsglt4d5h6nzpgiomr5zxrjgp5b4ntw6cosynmrd27illwyr4dbu',
      contributors: [
        { wallet: user2.address, name: 'Researcher2', share: 50 },
        { wallet: user3.address, name: 'Researcher3', share: 50 }
      ]
    }
  ];
  
  // Register each dataset
  for (const dataset of datasets) {
    console.log(`Registering dataset: ${dataset.name}`);
    
    // Create metadata JSON
    const metadata = {
      name: dataset.name,
      description: dataset.description,
      dataType: dataset.dataType,
      source: dataset.source,
      license: dataset.license
    };
    
    // Upload metadata to IPFS
    let metadataURI;
    try {
      const metadataJSON = JSON.stringify(metadata, null, 2);
      const cid = await uploadToWeb3Storage(metadataJSON, `${dataset.name.replace(/\s+/g, '_')}_metadata.json`);
      metadataURI = `ipfs://${cid}`;
      console.log(`Metadata uploaded to: ${metadataURI}`);
    } catch (error) {
      console.warn('Error uploading metadata to IPFS, using mock URI:', error);
      metadataURI = `ipfs://${dataset.cid}/metadata.json`;
    }
    
    // Format contributors for contract
    const contributors = dataset.contributors.map(c => ({
      wallet: c.wallet,
      name: c.name,
      share: c.share
    }));
    
    // Register dataset
    try {
      const tx = await registry.registerDataset(
        dataset.cid,
        dataset.dataType,
        dataset.source,
        dataset.license,
        contributors,
        metadataURI
      );
      
      const receipt = await tx.wait();
      // Updated to work with ethers v6 event handling
      const event = receipt.logs
        .filter(log => {
          try {
            return registry.interface.parseLog(log)?.name === 'DatasetRegistered';
          } catch (e) {
            return false;
          }
        })
        .map(log => registry.interface.parseLog(log))[0];
      
      const tokenId = event.args.tokenId;
      
      console.log(`Dataset registered with token ID: ${tokenId}`);
    } catch (error) {
      console.error(`Error registering dataset ${dataset.name}:`, error);
    }
  }
  
  console.log('Sample datasets seeded successfully');
}

// Execute if directly run
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;