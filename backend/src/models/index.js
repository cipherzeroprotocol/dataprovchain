/**
 * Database models initialization
 */
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const logger = require('../utils/logger');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.url, dbConfig.options);

// Test database connection
(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to the database', { error: error.message });
  }
})();

// Initialize models object
const DB = {
  Sequelize,
  sequelize
};

// Import all model files
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && 
           (file !== 'index.js') && 
           (file.slice(-3) === '.js');
  });

// Load models
for (const file of modelFiles) {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  DB[model.name] = model;
}

// Set up associations
Object.keys(DB).forEach(modelName => {
  if (DB[modelName].associate) {
    DB[modelName].associate(DB);
  }
});

module.exports = DB;