import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000, // Increased timeout for API calls
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Added retry for local tests
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001', // Updated to match the port our app is running on
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
  webServer: {
    command: 'npm run dev',
    port: 3001, // Updated to match the port our app is running on
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Increased timeout for server startup
  },
});
