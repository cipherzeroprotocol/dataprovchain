'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // Get datasets and users
    const [datasets] = await queryInterface.sequelize.query(
      `SELECT "id", "creator" FROM "Datasets" LIMIT 3`
    );
    
    if (datasets.length === 0) {
      throw new Error('No datasets found for provenance records');
    }
    
    const provenanceRecords = [];
    
    // For each dataset, create a creation record
    for (const dataset of datasets) {
      const creationRecord = {
        id: uuidv4(),
        datasetId: dataset.id,
        actionType: 'creation',
        performedBy: dataset.creator,
        description: 'Dataset created',
        metadata: JSON.stringify({}),
        ipfsCid: `bafkreiabcdef${Math.random().toString(36).substring(2, 10)}`,
        createdAt: now,
        updatedAt: now
      };
      
      provenanceRecords.push(creationRecord);
      
      // Add a verification record for verified datasets
      if (Math.random() > 0.5) {
        const verificationRecord = {
          id: uuidv4(),
          datasetId: dataset.id,
          actionType: 'verification',
          performedBy: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', // Admin
          description: 'Dataset verified by admin',
          metadata: JSON.stringify({}),
          ipfsCid: `bafkreixyz${Math.random().toString(36).substring(2, 10)}`,
          previousRecordId: creationRecord.id,
          createdAt: new Date(now.getTime() + 86400000), // 1 day later
          updatedAt: new Date(now.getTime() + 86400000)
        };
        
        provenanceRecords.push(verificationRecord);
      }
      
      // Add a storage record for some datasets
      if (Math.random() > 0.3) {
        const storageRecord = {
          id: uuidv4(),
          datasetId: dataset.id,
          actionType: 'storage_confirmed',
          performedBy: 'system',
          description: 'Filecoin storage deal confirmed',
          metadata: JSON.stringify({
            dealId: `f0${Math.floor(Math.random() * 100000)}`,
            provider: `f0${Math.floor(Math.random() * 100000)}`
          }),
          previousRecordId: creationRecord.id,
          createdAt: new Date(now.getTime() + 172800000), // 2 days later
          updatedAt: new Date(now.getTime() + 172800000)
        };
        
        provenanceRecords.push(storageRecord);
      }
    }
    
    return queryInterface.bulkInsert('ProvenanceRecords', provenanceRecords, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('ProvenanceRecords', null, {});
  }
};
