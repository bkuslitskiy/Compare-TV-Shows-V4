import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should show search results when typing in search bar', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Use a consistent search term that will likely return stable results
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    
    // Wait for results to appear
    await page.waitForSelector('[role="option"]');
    
    // Verify results contain expected content
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toContainText('Breaking Bad');
    
    // Test keyboard navigation through results
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Verify selection was added
    await expect(page.locator('.selection-grid')).toContainText('Breaking Bad');
  });

  test('should handle unusual search terms gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Use a search term unlikely to return results
    await page.fill('input[placeholder*="Search"]', 'xyzpdq12345notarealtitle');
    
    // Wait for "no results" message or empty results state
    await page.waitForSelector('text=No results found', { timeout: 10000 });
  });
  
  test('should support keyboard navigation in search results', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Type a search term
    await page.fill('input[placeholder*="Search"]', 'Game of');
    
    // Wait for results to appear
    await page.waitForSelector('[role="option"]');
    
    // Navigate through results with keyboard
    await page.keyboard.press('ArrowDown'); // First item
    await page.keyboard.press('ArrowDown'); // Second item
    await page.keyboard.press('ArrowUp');   // Back to first item
    
    // Select the first result
    await page.keyboard.press('Enter');
    
    // Verify selection was added (likely Game of Thrones)
    await expect(page.locator('.selection-grid')).toContainText('Game of');
  });
  
  test('should clear search results when input is cleared', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Type a search term
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    
    // Wait for results to appear
    await page.waitForSelector('[role="option"]');
    
    // Clear the input
    await page.fill('input[placeholder*="Search"]', '');
    
    // Verify results are cleared
    await expect(page.locator('[role="option"]')).toHaveCount(0);
  });
});
