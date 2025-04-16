import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000, // Increased timeout for API calls
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Added retry for local tests
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  // Run setup script before tests
  globalSetup: './setup.js',
  
  // Add teardown to kill servers after tests
  globalTeardown: './teardown.js',
  
  use: {
    baseURL: 'http://localhost:3000', // Use a consistent port
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
    // Commented out to speed up local testing - uncomment for CI
    // {
    //   name: 'firefox',
    //   use: {
    //     browserName: 'firefox',
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     browserName: 'webkit',
    //   },
    // },
  ],
  // We're handling the web server in our setup.js and teardown.js scripts
});
