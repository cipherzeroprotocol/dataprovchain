'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      avatarUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user'
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      apiKey: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('Users', ['walletAddress']);
    await queryInterface.addIndex('Users', ['username']);
    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['role']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
