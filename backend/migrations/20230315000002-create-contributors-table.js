'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Contributors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      datasetId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Datasets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'walletAddress'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      share: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 100
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.addIndex('Contributors', ['datasetId']);
    await queryInterface.addIndex('Contributors', ['address']);
    await queryInterface.addIndex('Contributors', ['datasetId', 'address'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Contributors');
  }
};
