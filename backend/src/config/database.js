/**
 * Database configuration
 */
const config = require('./app');

const dbConfig = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dataprovchain_dev',
    options: {
      logging: console.log,
      dialectOptions: {
        ssl: false
      }
    }
  },
  test: {
    url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dataprovchain_test',
    options: {
      logging: false,
      dialectOptions: {
        ssl: false
      }
    }
  },
  production: {
    url: process.env.DATABASE_URL,
    options: {
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
  }
};

module.exports = dbConfig[config.env];