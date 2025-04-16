const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Store references to spawned processes
let frontendProcess = null;
let backendProcess = null;

function killProcessOnPort(port) {
  try {
    // For Windows
    const command = `FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :${port} ^| findstr LISTENING') DO taskkill /F /PID %P`;
    execSync(command, { stdio: 'ignore' });
    console.log(`Killed process on port ${port}`);
  } catch (error) {
    // It's okay if there was no process to kill
    console.log(`No process found on port ${port}`);
  }
}

// Function to check if a server is running on a specific port
function checkServerRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
    req.setTimeout(1000, () => {
      req.abort();
      resolve(false);
    });
  });
}

// Function to wait for a server to be available
async function waitForServer(port, maxAttempts = 30, interval = 1000) {
  console.log(`Waiting for server on port ${port}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isRunning = await checkServerRunning(port);
    if (isRunning) {
      console.log(`Server on port ${port} is running!`);
      return true;
    }
    console.log(`Attempt ${attempt}/${maxAttempts}: Server on port ${port} not ready yet...`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  console.error(`Server on port ${port} did not start within the expected time`);
  return false;
}

module.exports = async () => {
  console.log('Starting test setup...');
  
  // Kill any existing processes on our ports
  killProcessOnPort(3000); // Frontend default
  killProcessOnPort(3001); // Alternate frontend port
  killProcessOnPort(3002); // API server port
  
  console.log('Starting backend server...');
  
  // Start the backend server
  backendProcess = spawn('node', ['server/index.js'], {
    stdio: 'pipe',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });
  
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });
  
  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
  
  backendProcess.on('error', (err) => {
    console.error(`Failed to start backend server: ${err.message}`);
  });
  
  // Wait for the backend server to start
  const backendReady = await waitForServer(3002);
  if (!backendReady) {
    throw new Error('Backend server failed to start');
  }
  
  console.log('Starting frontend server...');
  
  // Start the frontend server
  frontendProcess = spawn('npm', ['run', 'dev', '--', '--port', '3000'], {
    stdio: 'pipe',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });
  
  frontendProcess.stdout.on('data', (data) => {
    console.log(`Frontend: ${data}`);
  });
  
  frontendProcess.stderr.on('data', (data) => {
    console.error(`Frontend Error: ${data}`);
  });
  
  frontendProcess.on('error', (err) => {
    console.error(`Failed to start frontend server: ${err.message}`);
  });
  
  // Wait for the frontend server to start
  const frontendReady = await waitForServer(3000);
  if (!frontendReady) {
    throw new Error('Frontend server failed to start');
  }
  
  console.log('Setup complete - Both servers are running');
  
  // Store process references in global object for teardown
  global.__SERVERS__ = {
    frontendProcess,
    backendProcess
  };
};
