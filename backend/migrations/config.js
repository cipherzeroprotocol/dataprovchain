/**
 * Migration configuration
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const dbConfig = require('../src/config/database');

module.exports = {
  development: {
    url: dbConfig.url,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData'
  },
  test: {
    url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dataprovchain_test',
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: dbConfig.url,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
