/**
 * Swagger API documentation configuration
 */
const swaggerJsDoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const appConfig = require('../config/app');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DataProvChain API',
    version: '1.0.0',
    description: 'API documentation for the DataProvChain platform',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    contact: {
      name: 'DataProvChain Team',
      url: 'https://dataprovchain.io',
      email: 'info@dataprovchain.io'
    }
  },
  servers: [
    {
      url: `http://localhost:${appConfig.port}${appConfig.apiPrefix}`,
      description: 'Development server'
    },
    {
      url: `https://api.dataprovchain.io${appConfig.apiPrefix}`,
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key'
      }
    }
  }
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Path to the API docs (using glob pattern to match all route files)
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, './components/*.yaml') // for tag definitions and schemas
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(options);

// Write the swagger.json file
const outputPath = path.join(__dirname, 'api-docs.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

module.exports = swaggerSpec;
