import { test, expect } from '@playwright/test';

test.describe('Simple Port Test', () => {
  test('should search for a movie on port 3001', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    
    // Search for a movie
    await page.fill('input[placeholder*="Search"]', 'The Matrix');
    
    // Wait for results to appear
    await page.waitForSelector('[role="option"]');
    
    // Verify results contain expected content
    const firstResult = page.locator('[role="option"]').first();
    await expect(firstResult).toContainText('Matrix');
  });
});
