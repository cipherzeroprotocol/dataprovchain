/**
 * Database setup script
 * 
 * This script initializes the database schema and creates an admin user.
 */
const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Load environment config
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const dbConfig = require('../src/config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.url, dbConfig.options);

async function setupDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Run migrations
    console.log('Running migrations...');
    try {
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully');
    } catch (migrationError) {
      console.error('❌ Migration failed:', migrationError.message);
      process.exit(1);
    }
    
    // Create admin user if ADMIN_WALLET is set
    if (process.env.ADMIN_WALLET) {
      const adminWallet = process.env.ADMIN_WALLET;
      
      // Check if admin user already exists
      const [adminUser] = await sequelize.query(
        `SELECT * FROM "Users" WHERE "walletAddress" = '${adminWallet}'`
      );
      
      if (adminUser.length === 0) {
        // Create admin user
        const apiKey = crypto.randomBytes(32).toString('hex');
        const adminId = uuidv4();
        const now = new Date().toISOString();
        
        await sequelize.query(`
          INSERT INTO "Users" (
            "id", "username", "walletAddress", "role", "verified", "apiKey", "createdAt", "updatedAt"
          ) VALUES (
            '${adminId}', 'admin', '${adminWallet}', 'admin', true, '${apiKey}', '${now}', '${now}'
          )
        `);
        
        console.log(`✅ Admin user created with wallet address: ${adminWallet}`);
        console.log(`🔑 API Key: ${apiKey}`);
      } else {
        console.log(`✅ Admin user already exists with wallet address: ${adminWallet}`);
      }
    } else {
      console.log('ℹ️ No ADMIN_WALLET specified, skipping admin user creation');
    }
    
    console.log('🚀 Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
