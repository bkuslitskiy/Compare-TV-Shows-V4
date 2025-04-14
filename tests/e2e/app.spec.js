import { test, expect } from '@playwright/test';

test.describe('Application', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Verify the page title
    await expect(page).toHaveTitle(/Compare TV Shows/);
    
    // Verify the main heading is visible
    const heading = page.locator('h2:has-text("Compare TV Shows and Movies")');
    await expect(heading).toBeVisible();
    
    // Verify the search input is visible
    const searchInput = page.locator('input[placeholder*="Search for TV shows"]');
    await expect(searchInput).toBeVisible();
    
    // Verify the theme toggle buttons are visible
    const themeButtons = page.locator('button[aria-label*="theme"]');
    await expect(themeButtons).toHaveCount(3); // Light, Dark, System
  });
  
  test('should toggle between light and dark themes', async ({ page }) => {
    await page.goto('/');
    
    // Click the dark theme button
    await page.click('button[aria-label="Dark theme"]');
    
    // Verify the dark theme class is applied to the html element
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Click the light theme button
    await page.click('button[aria-label="Light theme"]');
    
    // Verify the dark theme class is removed from the html element
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
