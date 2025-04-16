import { test, expect } from '@playwright/test';

test.describe('Movie Comparison Tests', () => {
  test.setTimeout(60000);
  
  test('should compare two movies', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add The Matrix (1999)
    await page.fill('input[placeholder*="Search"]', 'The Matrix 1999');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add The Matrix Reloaded (2003)
    await page.fill('input[placeholder*="Search"]', 'The Matrix Reloaded');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Verify some expected shared people are shown
    await expect(page.locator('text=Keanu Reeves')).toBeVisible();
  });
  
  test('should filter comparison results', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add Inception
    await page.fill('input[placeholder*="Search"]', 'Inception 2010');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add The Dark Knight
    await page.fill('input[placeholder*="Search"]', 'The Dark Knight 2008');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Filter by crew
    await page.click('button:has-text("Crew")');
    
    // Verify Christopher Nolan is shown
    await expect(page.locator('text=Christopher Nolan')).toBeVisible();
  });
});
