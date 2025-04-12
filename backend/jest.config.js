/**
 * Jest configuration
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageReporters: ['text', 'lcov', 'clover'],
  testTimeout: 10000
};
