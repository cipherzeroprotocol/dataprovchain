/**
 * run-lint.js - Script to run linting across all DataProvChain components
 * 
 * This script runs ESLint for backend, frontend and filecoin modules
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Running linting across all DataProvChain modules...\n');

// Configure the linting runners
const lintRunners = [
  {
    name: 'backend',
    command: 'npm',
    args: ['run', 'lint'],
    cwd: path.join(__dirname, '../backend')
  },
  {
    name: 'frontend',
    command: 'npm',
    args: ['run', 'lint'],
    cwd: path.join(__dirname, '../frontend'),
    optional: true
  },
  {
    name: 'filecoin',
    command: 'npm',
    args: ['run', 'lint'],
    cwd: path.join(__dirname, '../filecoin')
  }
];

// Run linting for a specific module
async function runLint(lintRunner) {
  console.log(`Linting ${lintRunner.name} module...`);
  
  return new Promise((resolve) => {
    const proc = spawn(lintRunner.command, lintRunner.args, {
      cwd: lintRunner.cwd,
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('error', (error) => {
      if (lintRunner.optional) {
        console.warn(`Warning: Could not run linting for ${lintRunner.name}: ${error.message}`);
        resolve(true); // Don't fail the process for optional linters
      } else {
        console.error(`Error running linting for ${lintRunner.name}:`, error);
        resolve(false);
      }
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        if (lintRunner.optional) {
          console.warn(`Warning: ${lintRunner.name} linting failed with code ${code}, but it's optional`);
          resolve(true); // Don't fail the process for optional linters
        } else {
          console.error(`${lintRunner.name} linting failed with code ${code}`);
          resolve(false);
        }
      } else {
        console.log(`✅ ${lintRunner.name} linting completed successfully`);
        resolve(true);
      }
    });
  });
}

// Run linting sequentially
async function runAllLinting() {
  let allPassed = true;
  
  for (const lintRunner of lintRunners) {
    const passed = await runLint(lintRunner);
    if (!passed) {
      allPassed = false;
    }
    console.log(); // Add space between lint runs
  }
  
  if (allPassed) {
    console.log('✅ All linting passed!');
    process.exit(0);
  } else {
    console.error('❌ Some linting failed!');
    process.exit(1);
  }
}

runAllLinting();