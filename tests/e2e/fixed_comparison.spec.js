import { test, expect } from '@playwright/test';

test.describe('Fixed Comparison Functionality', () => {
  // This test may take longer due to API calls for detailed cast/crew information
  test.setTimeout(120000);
  
  test('should show comparison results for selected movies', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add The Matrix (1999)
    await page.fill('input[placeholder*="Search"]', 'The Matrix 1999');
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]');
    
    // Add The Matrix Reloaded (2003)
    await page.fill('input[placeholder*="Search"]', 'The Matrix Reloaded');
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]');
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results to load
    // This may take some time with the real API
    await page.waitForSelector('text=Comparison Results', { timeout: 60000 });
    
    // Verify some expected shared cast/crew are shown
    // These are known to be in both movies
    await expect(page.locator('text=Keanu Reeves')).toBeVisible();
    await expect(page.locator('text=Laurence Fishburne')).toBeVisible();
    await expect(page.locator('text=Carrie-Anne Moss')).toBeVisible();
    
    // Test department filtering
    await page.click('button:has-text("Cast")');
    
    // Verify we're seeing cast members
    await expect(page.locator('text=Neo')).toBeVisible();
    
    // Test crew filtering
    await page.click('button:has-text("Crew")');
    
    // Verify we're seeing crew members
    await expect(page.locator('text=Wachowski')).toBeVisible();
  });
});
