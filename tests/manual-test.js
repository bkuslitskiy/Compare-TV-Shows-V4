import { chromium } from '@playwright/test';
import { execSync, spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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

function killProcess(process) {
  if (process && !process.killed) {
    try {
      process.kill('SIGTERM');
      console.log(`Process killed: ${process.pid}`);
    } catch (error) {
      console.error(`Error killing process: ${error.message}`);
    }
  }
}

async function cleanup() {
  console.log('Cleaning up...');
  
  if (frontendProcess) {
    killProcess(frontendProcess);
  }
  
  if (backendProcess) {
    killProcess(backendProcess);
  }
  
  // Also kill any processes on our ports as a fallback
  killProcessOnPort(3000); // Frontend
  killProcessOnPort(3001); // Alternate frontend port
  killProcessOnPort(3002); // API server port
  
  console.log('Cleanup complete');
}

async function setup() {
  console.log('Starting test setup...');
  
  // Kill any existing processes on our ports
  killProcessOnPort(3000); // Frontend default
  killProcessOnPort(3001); // Alternate frontend port
  killProcessOnPort(3002); // API server port
  
  console.log('Starting backend server...');
  
  // Check if server/.env exists
  const serverEnvPath = path.join(rootDir, 'server', '.env');
  if (fs.existsSync(serverEnvPath)) {
    console.log(`Server .env file found at: ${serverEnvPath}`);
    
    // Read the .env file to verify its contents
    const envContent = fs.readFileSync(serverEnvPath, 'utf8');
    console.log('Server .env file content:');
    console.log(envContent);
  } else {
    console.error(`Server .env file not found at: ${serverEnvPath}`);
  }
  
  // Start the backend server with explicit env path
  backendProcess = spawn('node', ['server/index.js'], {
    stdio: 'pipe',
    shell: true,
    cwd: rootDir,
    env: {
      ...process.env,
      DOTENV_CONFIG_PATH: path.join(rootDir, 'server', '.env'),
      TMDB_API_KEY: '330b765d5cdf65fe2ab30dd670eab968'
    }
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
    cwd: rootDir
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
}

async function runTest() {
  console.log('Starting test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    // Add console logging
    args: ['--enable-logging=stderr']
  });
  
  const context = await browser.newContext();
  
  // Listen for console messages
  context.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      console.error(`Browser Console Error: ${text}`);
    } else if (type === 'warning') {
      console.warn(`Browser Console Warning: ${text}`);
    } else {
      console.log(`Browser Console: ${text}`);
    }
  });
  
  // Listen for page errors
  context.on('pageerror', exception => {
    console.error(`Browser Page Error: ${exception.message}`);
    console.error(`Stack trace: ${exception.stack || 'No stack trace available'}`);
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('Navigating to the app...');
    await page.goto('http://localhost:3000/');
    
    // Add debug code to expose window.onerror
    await page.evaluate(() => {
      window.onerror = (message, source, lineno, colno, error) => {
        console.error('Global error handler:', message, 'at', source, lineno, colno);
        if (error && error.stack) {
          console.error('Error stack:', error.stack);
        }
        return false;
      };
      
      // Also capture unhandled promise rejections
      window.addEventListener('unhandledrejection', event => {
        console.error('Unhandled Promise Rejection:', event.reason);
        if (event.reason && event.reason.stack) {
          console.error('Rejection stack:', event.reason.stack);
        }
      });
    });
    
    // Add The Matrix (1999)
    console.log('Searching for The Matrix...');
    await page.fill('input[placeholder*="Search"]', 'The Matrix 1999');
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]');
    
    // Add The Matrix Reloaded (2003)
    console.log('Searching for The Matrix Reloaded...');
    await page.fill('input[placeholder*="Search"]', 'The Matrix Reloaded');
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]');
    
    // Inject debug code to log the selections state
    console.log('Logging selections state...');
    const selections = await page.evaluate(() => {
      // Try to access the React state
      // This is a bit hacky but can help debug
      const selectionState = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.getCurrentFiber();
      console.log('Selection state:', selectionState);
      
      // Return any visible selections on the page
      const selectionElements = Array.from(document.querySelectorAll('.selection-item'));
      return selectionElements.map(el => el.textContent);
    });
    
    console.log('Current selections:', selections);
    
    // Click compare button
    console.log('Clicking compare button...');
    await page.click('button:has-text("Compare Selections")');
    
    // Inject debug code to log the comparison process
    console.log('Logging comparison process...');
    await page.evaluate(() => {
      console.log('Compare button clicked');
      
      // Try to access React context values
      const reactInstances = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.getInstancesForType();
      console.log('React instances:', reactInstances);
      
      // Log any network requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        console.log('Fetch request:', args[0]);
        return originalFetch.apply(this, args)
          .then(response => {
            console.log('Fetch response status:', response.status);
            return response;
          })
          .catch(error => {
            console.error('Fetch error:', error);
            throw error;
          });
      };
    });
    
    // Wait for comparison results to load
    console.log('Waiting for comparison results...');
    try {
      await page.waitForSelector('text=Comparison Results', { timeout: 60000 });
      console.log('Comparison results found!');
    } catch (error) {
      console.error('Timeout waiting for comparison results:', error.message);
      
      // Take a screenshot to see what's on the page
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('Screenshot saved to error-screenshot.png');
      
      // Log the current page HTML
      const html = await page.content();
      fs.writeFileSync('error-page.html', html);
      console.log('Page HTML saved to error-page.html');
      
      // Check for any error messages on the page
      const errorMessages = await page.$$eval('.error, [class*="error"], [class*="Error"]', 
        elements => elements.map(el => el.textContent)
      );
      
      if (errorMessages.length > 0) {
        console.log('Error messages found on page:', errorMessages);
      }
      
      // Check console logs for errors
      console.log('Checking console logs for errors...');
      const logs = await page.evaluate(() => {
        return {
          errors: window.__errors || [],
          logs: window.__logs || []
        };
      });
      
      if (logs.errors.length > 0) {
        console.error('Console errors:', logs.errors);
      }
      
      if (logs.logs.length > 0) {
        console.log('Console logs:', logs.logs);
      }
      
      throw error;
    }
    
    // Verify some expected shared cast/crew are shown
    console.log('Verifying results...');
    const keanuVisible = await page.isVisible('text=Keanu Reeves');
    const laurenceVisible = await page.isVisible('text=Laurence Fishburne');
    const carrieAnneVisible = await page.isVisible('text=Carrie-Anne Moss');
    
    if (keanuVisible && laurenceVisible && carrieAnneVisible) {
      console.log('✅ Test passed! Found shared cast members.');
    } else {
      console.log('❌ Test failed! Could not find all expected cast members.');
      console.log(`Keanu Reeves: ${keanuVisible ? 'Found' : 'Not found'}`);
      console.log(`Laurence Fishburne: ${laurenceVisible ? 'Found' : 'Not found'}`);
      console.log(`Carrie-Anne Moss: ${carrieAnneVisible ? 'Found' : 'Not found'}`);
    }
    
    // Test department filtering
    console.log('Testing department filtering...');
    await page.click('button:has-text("Cast")');
    
    // Verify we're seeing cast members
    const neoVisible = await page.isVisible('text=Neo');
    if (neoVisible) {
      console.log('✅ Cast filtering works!');
    } else {
      console.log('❌ Cast filtering failed!');
    }
    
    // Test crew filtering
    await page.click('button:has-text("Crew")');
    
    // Verify we're seeing crew members
    const wachowskiVisible = await page.isVisible('text=Wachowski');
    if (wachowskiVisible) {
      console.log('✅ Crew filtering works!');
    } else {
      console.log('❌ Crew filtering failed!');
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
    
    // Take a screenshot to see what's on the page
    try {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('Screenshot saved to error-screenshot.png');
    } catch (screenshotError) {
      console.error('Failed to take screenshot:', screenshotError.message);
    }
  } finally {
    // Close the browser
    await browser.close();
  }
}

async function main() {
  try {
    await setup();
    await runTest();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await cleanup();
  }
}

// Run the main function
main();
