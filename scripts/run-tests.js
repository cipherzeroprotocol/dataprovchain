/**
 * run-tests.js - Script to run all DataProvChain tests
 * 
 * This script runs tests for backend, frontend and filecoin modules
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Running DataProvChain tests across all modules...\n');

// Configure the test runners
const testRunners = [
  {
    name: 'backend',
    command: 'npm',
    args: ['run', 'test'],
    cwd: path.join(__dirname, '../backend')
  },
  {
    name: 'frontend',
    command: 'npm',
    args: ['run', 'test', '--', '--watchAll=false'],
    cwd: path.join(__dirname, '../frontend')
  },
  {
    name: 'filecoin',
    command: 'npm',
    args: ['run', 'test'],
    cwd: path.join(__dirname, '../filecoin')
  }
];

// Run tests for a specific module
async function runTests(testRunner) {
  console.log(`Running ${testRunner.name} tests...`);
  
  return new Promise((resolve) => {
    const proc = spawn(testRunner.command, testRunner.args, {
      cwd: testRunner.cwd,
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('error', (error) => {
      console.error(`Error running ${testRunner.name} tests:`, error);
      resolve(false);
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`${testRunner.name} tests failed with code ${code}`);
        resolve(false);
      } else {
        console.log(`✅ ${testRunner.name} tests completed successfully`);
        resolve(true);
      }
    });
  });
}

// Run tests sequentially
async function runAllTests() {
  let allPassed = true;
  
  for (const testRunner of testRunners) {
    const passed = await runTests(testRunner);
    if (!passed) {
      allPassed = false;
    }
    console.log(); // Add space between test runs
  }
  
  if (allPassed) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed!');
    process.exit(1);
  }
}

runAllTests();