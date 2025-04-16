const { execSync } = require('child_process');

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

module.exports = async () => {
  // Kill the spawned processes if they exist
  if (global.__SERVERS__) {
    console.log('Killing spawned servers...');
    
    if (global.__SERVERS__.frontendProcess) {
      killProcess(global.__SERVERS__.frontendProcess);
    }
    
    if (global.__SERVERS__.backendProcess) {
      killProcess(global.__SERVERS__.backendProcess);
    }
  }
  
  // Also kill any processes on our ports as a fallback
  killProcessOnPort(3000); // Frontend
  killProcessOnPort(3001); // Alternate frontend port
  killProcessOnPort(3002); // API server port
  
  console.log('Teardown complete');
};
