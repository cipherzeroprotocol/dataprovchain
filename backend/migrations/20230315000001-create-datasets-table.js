'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Datasets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dataType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tokenId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      metadataUri: {
        type: Sequelize.STRING,
        allowNull: true
      },
      license: {
        type: Sequelize.STRING,
        allowNull: false
      },
      creator: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'walletAddress'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fileSize: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verifier: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'walletAddress'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      dealId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dealConfirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('Datasets', ['creator']);
    await queryInterface.addIndex('Datasets', ['dataType']);
    await queryInterface.addIndex('Datasets', ['verified']);
    await queryInterface.addIndex('Datasets', ['cid']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Datasets');
  }
};
