/**
 * Authentication configuration
 */
const config = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpirationInterval: parseInt(process.env.JWT_EXPIRATION_MINUTES || '10080', 10), // 7 days in minutes
    
    // Web3 authentication
    challengeExpirationMinutes: parseInt(process.env.CHALLENGE_EXPIRATION_MINUTES || '5', 10),
    
    // Admin wallets that have special permissions
    adminWallets: (process.env.ADMIN_WALLETS || '').split(',').filter(Boolean),
    
    // Password hashing
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10)
  };
  
  module.exports = config;