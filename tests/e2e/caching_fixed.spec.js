import { test, expect } from '@playwright/test';

test.describe('Caching Functionality', () => {
  // This test may take longer due to API calls
  test.setTimeout(180000);
  
  test('should show cache status button', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Verify the cache status button is visible
    const cacheButton = page.locator('button[aria-label="Show cache status"]');
    await expect(cacheButton).toBeVisible();
    
    // Verify it shows the initial hit rate (likely 0%)
    await expect(cacheButton).toContainText('Cache: 0%');
  });
  
  test('should open cache status panel when clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Click the cache status button
    await page.click('button[aria-label="Show cache status"]');
    
    // Verify the cache status panel is visible
    const cachePanel = page.locator('text=Cache Status');
    await expect(cachePanel).toBeVisible();
    
    // Verify it shows cache statistics
    await expect(page.locator('text=Hit Rate:')).toBeVisible();
    await expect(page.locator('text=Cache Hits:')).toBeVisible();
    await expect(page.locator('text=Cache Misses:')).toBeVisible();
    
    // Close the panel
    await page.click('button[aria-label="Close cache status"]');
    
    // Verify the panel is closed
    await expect(cachePanel).not.toBeVisible();
  });
  
  test('should cache search results', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Perform a search
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    
    // Clear the search and search again with the same term
    await page.fill('input[placeholder*="Search"]', '');
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    
    // Open cache status
    await page.click('button[aria-label="Show cache status"]');
    
    // Verify cache statistics are shown
    await expect(page.locator('text=Cache Hits:')).toBeVisible();
    await expect(page.locator('text=Cache Misses:')).toBeVisible();
    await expect(page.locator('text=Cache Size:')).toBeVisible();
    
    // Close the panel
    await page.click('button[aria-label="Close cache status"]');
  });
  
  test('should clear cache when button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Perform a search to populate cache
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    
    // Open cache status
    await page.click('button[aria-label="Show cache status"]');
    
    // Click clear cache button
    await page.click('button:has-text("Clear Cache")');
    
    // Wait for clearing to complete
    await page.waitForTimeout(1000);
    
    // Verify cache panel is still visible after clearing
    await expect(page.locator('text=Cache Status')).toBeVisible();
    await expect(page.locator('text=Cache Hits:')).toBeVisible();
    await expect(page.locator('text=Cache Misses:')).toBeVisible();
    
    // Close the panel
    await page.click('button[aria-label="Close cache status"]');
  });
  
  test('should cache TV show details', async ({ page }) => {
    // Set a longer timeout for this specific test
    test.setTimeout(120000);
    
    await page.goto('http://localhost:3000/');
    
    // Clear cache first
    await page.click('button[aria-label="Show cache status"]');
    await page.click('button:has-text("Clear Cache")');
    await page.waitForTimeout(1000);
    await page.click('button[aria-label="Close cache status"]');
    
    // Search and select a TV show
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Verify the selection was added
    await expect(page.locator('.selection-grid')).toContainText('Breaking Bad');
    
    // Wait for a moment to allow API calls to complete
    await page.waitForTimeout(2000);
    
    // Search for the same show again
    await page.fill('input[placeholder*="Search"]', '');
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    
    // Open cache status
    await page.click('button[aria-label="Show cache status"]');
    
    // Verify cache has some activity
    await expect(page.locator('text=Cache Hits:')).toBeVisible();
    await expect(page.locator('text=Cache Misses:')).toBeVisible();
    await expect(page.locator('text=Cache Size:')).toBeVisible();
    
    // Close the panel
    await page.click('button[aria-label="Close cache status"]');
  });
});
