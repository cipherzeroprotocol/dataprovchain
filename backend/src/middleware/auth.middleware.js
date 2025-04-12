/**
 * Authentication middleware
 */
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    // Check auth header format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication format. Use Bearer <token>'
      });
    }
    
    const token = parts[1];
    
    // Verify token
    const decoded = await authService.verifyToken(token);
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
  
  next();
};

/**
 * Middleware to authenticate using API key
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        status: 'error',
        message: 'API key required'
      });
    }
    
    // Validate API key
    const user = await authService.validateApiKey(apiKey);
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    logger.error('API key authentication failed', { error: error.message });
    
    return res.status(401).json({
      status: 'error',
      message: 'Invalid API key'
    });
  }
};

/**
 * Middleware to authenticate using either JWT or API key
 */
const authenticateAny = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    
    if (!authHeader && !apiKey) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    if (apiKey) {
      // Try API key auth
      try {
        const user = await authService.validateApiKey(apiKey);
        req.user = user;
        return next();
      } catch (apiKeyError) {
        // Fall through to try JWT auth if API key fails
        logger.debug('API key auth failed, trying JWT', { error: apiKeyError.message });
      }
    }
    
    if (authHeader) {
      // Try JWT auth
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        try {
          const decoded = await authService.verifyToken(parts[1]);
          req.user = decoded;
          return next();
        } catch (jwtError) {
          logger.error('JWT auth failed', { error: jwtError.message });
          return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token'
          });
        }
      }
    }
    
    // If we got here, both auth methods failed
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    
    return res.status(401).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  authenticateApiKey,
  authenticateAny
};