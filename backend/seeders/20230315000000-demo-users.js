'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    return queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@dataprovchain.io',
        walletAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
        bio: 'DataProvChain administrator',
        role: 'admin',
        verified: true,
        apiKey: '2b10exampleapikey3c99f4e2b8d1aeb498b1',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        username: 'alice',
        email: 'alice@example.com',
        walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        bio: 'AI researcher focused on NLP',
        role: 'user',
        verified: true,
        apiKey: '1a23exampleapikey6b12c9e3a7d0bfa387a0',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        username: 'bob',
        email: 'bob@example.com',
        walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        bio: 'Data scientist working on computer vision',
        role: 'user',
        verified: true,
        apiKey: '5c67exampleapikeyf238d4b0e5a1c937942',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
