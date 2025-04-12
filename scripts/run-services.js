/**
 * run-services.js - Script to run DataProvChain services
 * 
 * This script runs the backend and frontend services together.
 * Use --dev flag to run in development mode.
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const mode = isDev ? 'development' : 'production';

console.log(`Starting DataProvChain services in ${mode} mode...`);

// Configure the services to run
const services = [
  {
    name: 'backend',
    command: 'npm',
    args: [`run`, isDev ? 'dev' : 'start'],
    cwd: path.join(__dirname, '../backend')
  },
  {
    name: 'frontend',
    command: 'npm',
    args: ['run', 'start'],
    cwd: path.join(__dirname, '../frontend')
  }
];

// Function to run a service
function runService(service) {
  console.log(`Starting ${service.name} service...`);
  
  const proc = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'inherit',
    shell: true
  });
  
  proc.on('error', (error) => {
    console.error(`Error starting ${service.name} service:`, error);
  });
  
  proc.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${service.name} service exited with code ${code}`);
    }
  });
  
  return proc;
}

// Run all services
const processes = services.map(runService);

// Handle process termination
function cleanup() {
  console.log('\nShutting down services...');
  processes.forEach(proc => {
    if (!proc.killed) {
      proc.kill();
    }
  });
}

// Listen for termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);