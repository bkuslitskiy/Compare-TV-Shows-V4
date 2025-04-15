import { test, expect } from '@playwright/test';

test.describe('Caching Functionality', () => {
  // This test may take longer due to API calls
  test.setTimeout(60000);
  
  test('should show cache status button', async ({ page }) => {
    await page.goto('/');
    
    // Verify the cache status button is visible
    const cacheButton = page.locator('button[aria-label="Show cache status"]');
    await expect(cacheButton).toBeVisible();
    
    // Verify it shows the initial hit rate (likely 0%)
    await expect(cacheButton).toContainText('Cache: 0%');
  });
  
  test('should open cache status panel when clicked', async ({ page }) => {
    await page.goto('/');
    
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
    await page.goto('/');
    
    // Perform a search
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    
    // Clear the search and search again with the same term
    await page.fill('input[placeholder*="Search"]', '');
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    
    // Open cache status
    await page.click('button[aria-label="Show cache status"]');
    
    // Verify there are cache hits
    const hitsText = await page.locator('text=Cache Hits:').locator('xpath=..').textContent();
    const hits = parseInt(hitsText.replace('Cache Hits:', '').trim());
    
    expect(hits).toBeGreaterThan(0);
    
    // Close the panel
    await page.click('button[aria-label="Close cache status"]');
  });
  
  test('should clear cache when button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Perform a search to populate cache
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    
    // Open cache status
    await page.click('button[aria-label="Show cache status"]');
    
    // Get initial cache stats
    const initialSizeText = await page.locator('text=Cache Size:').locator('xpath=..').textContent();
    const initialSize = initialSizeText.replace('Cache Size:', '').trim();
    
    // Verify cache has some data
    expect(initialSize).not.toBe('0 Bytes');
    
    // Click clear cache button
    await page.click('button:has-text("Clear Cache")');
    
    // Wait for clearing to complete
    await page.waitForTimeout(1000);
    
    // Get updated cache stats
    const updatedSizeText = await page.locator('text=Cache Size:').locator('xpath=..').textContent();
    const updatedSize = updatedSizeText.replace('Cache Size:', '').trim();
    
    // Verify cache was cleared
    expect(updatedSize).toBe('0 Bytes');
    
    // Close the panel
    await page.click('button[aria-label="Close cache status"]');
  });
  
  test('should cache TV show details', async ({ page }) => {
    await page.goto('/');
    
    // Clear cache first
    await page.click('button[aria-label="Show cache status"]');
    await page.click('button:has-text("Clear Cache")');
    await page.waitForTimeout(1000);
    await page.click('button[aria-label="Close cache status"]');
    
    // Search and select a TV show
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Search and select another TV show
    await page.fill('input[placeholder*="Search"]', 'Better Call Saul');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Open cache status
    await page.click('button[aria-label="Show cache status"]');
    
    // Verify there are cache sets
    const setsText = await page.locator('text=Cache Sets:').locator('xpath=..').textContent();
    const sets = parseInt(setsText.replace('Cache Sets:', '').trim());
    
    expect(sets).toBeGreaterThan(0);
    
    // Close the panel
    await page.click('button[aria-label="Close cache status"]');
    
    // Clear the comparison
    await page.click('button:has-text("Clear Results")');
    
    // Compare the same shows again
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Open cache status
    await page.click('button[aria-label="Show cache status"]');
    
    // Verify there are cache hits
    const hitsText = await page.locator('text=Cache Hits:').locator('xpath=..').textContent();
    const hits = parseInt(hitsText.replace('Cache Hits:', '').trim());
    
    expect(hits).toBeGreaterThan(0);
    
    // Close the panel
    await page.click('button[aria-label="Close cache status"]');
  });
});
