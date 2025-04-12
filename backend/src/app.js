/**
 * Express application setup
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const config = require('./config/app');
const errorMiddleware = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Import routes
const userRoutes = require('./routes/user.routes');
const datasetRoutes = require('./routes/dataset.routes');
const provenanceRoutes = require('./routes/provenance.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');
const attributionRoutes = require('./routes/attribution.routes');
const filecoinRoutes = require('./routes/filecoin.routes');
const daoRoutes = require('./routes/dao.routes');

// Initialize Express app
const app = express();

// Apply middlewares
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(morgan('combined', { stream: logger.stream })); // HTTP request logging

// Apply rate limiting
app.use(rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' // Skip rate limiting for local requests
}));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Load API documentation if available
let swaggerSpec;
try {
  swaggerSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs/api-docs.json'), 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('API documentation loaded and available at /api-docs');
} catch (error) {
  logger.warn('API documentation not found or invalid', { error: error.message });
}

// API routes
app.use(`${config.apiPrefix}/users`, userRoutes);
app.use(`${config.apiPrefix}/datasets`, datasetRoutes);
app.use(`${config.apiPrefix}/provenance`, provenanceRoutes);
app.use(`${config.apiPrefix}/marketplace`, marketplaceRoutes);
app.use(`${config.apiPrefix}/attribution`, attributionRoutes);
app.use(`${config.apiPrefix}/filecoin`, filecoinRoutes);
app.use(`${config.apiPrefix}/dao`, daoRoutes);

// Error handling middleware
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Route not found' 
  });
});

module.exports = app;