'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // Get user IDs
    const [users] = await queryInterface.sequelize.query(
      `SELECT "walletAddress" FROM "Users" WHERE "username" IN ('alice', 'bob')`
    );
    
    if (users.length < 2) {
      throw new Error('Required seed users not found');
    }
    
    const aliceAddress = users.find(u => u.walletAddress.startsWith('0xd8dA')).walletAddress;
    const bobAddress = users.find(u => u.walletAddress.startsWith('0x71C7')).walletAddress;
    
    // Create datasets
    const datasets = [
      {
        id: uuidv4(),
        name: 'Mini ImageNet Subset',
        description: 'A curated subset of ImageNet with 100 images for testing computer vision models',
        dataType: 'image',
        cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        tokenId: '1',
        metadataUri: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
        license: 'CC-BY-4.0',
        creator: aliceAddress,
        fileSize: 1024000,
        verified: true,
        dealId: 'f01234',
        dealConfirmed: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'English-French Translation Dataset',
        description: 'Parallel corpus with 1000 sentence pairs for training translation models',
        dataType: 'text',
        cid: 'bafybeiabc123def456ghi789jklmno123456789abcdefghijklmnopqrstu',
        tokenId: '2',
        metadataUri: 'bafybeiabcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnopqrstu',
        license: 'MIT',
        creator: bobAddress,
        fileSize: 512000,
        verified: true,
        dealId: 'f05678',
        dealConfirmed: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Weather Forecasting Data',
        description: 'Historical weather data for training predictive models',
        dataType: 'tabular',
        cid: 'bafybeistuvwxyz123456789abcdefghijklmnopqrstuv123456789abcdefg',
        tokenId: '3',
        metadataUri: 'bafybeixyz123456789abcdefghijklmnopqrstuvwxyz123456789abcdefg',
        license: 'CC-BY-SA-4.0',
        creator: aliceAddress,
        fileSize: 2048000,
        verified: false,
        dealId: 'f09012',
        dealConfirmed: false,
        createdAt: now,
        updatedAt: now
      }
    ];
    
    await queryInterface.bulkInsert('Datasets', datasets, {});
    
    // Create contributors for each dataset
    const datasetIds = datasets.map(d => d.id);
    const [createdDatasets] = await queryInterface.sequelize.query(
      `SELECT "id", "creator" FROM "Datasets" WHERE "id" IN ('${datasetIds.join("','")}')`
    );
    
    const contributors = [];
    
    for (const dataset of createdDatasets) {
      // Creator gets 80% share
      contributors.push({
        id: uuidv4(),
        datasetId: dataset.id,
        address: dataset.creator,
        share: 80,
        name: dataset.creator === aliceAddress ? 'Alice' : 'Bob',
        createdAt: now,
        updatedAt: now
      });
      
      // Other user gets 20% share
      contributors.push({
        id: uuidv4(),
        datasetId: dataset.id,
        address: dataset.creator === aliceAddress ? bobAddress : aliceAddress,
        share: 20,
        name: dataset.creator === aliceAddress ? 'Bob' : 'Alice',
        createdAt: now,
        updatedAt: now
      });
    }
    
    await queryInterface.bulkInsert('Contributors', contributors, {});
    
    // Create tags for datasets
    const tags = [
      {
        id: uuidv4(),
        datasetId: datasets[0].id,
        name: 'image',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        datasetId: datasets[0].id,
        name: 'computer-vision',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        datasetId: datasets[1].id,
        name: 'text',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        datasetId: datasets[1].id,
        name: 'translation',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        datasetId: datasets[2].id,
        name: 'tabular',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        datasetId: datasets[2].id,
        name: 'weather',
        createdAt: now,
        updatedAt: now
      }
    ];
    
    return queryInterface.bulkInsert('Tags', tags, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tags', null, {});
    await queryInterface.bulkDelete('Contributors', null, {});
    return queryInterface.bulkDelete('Datasets', null, {});
  }
};
