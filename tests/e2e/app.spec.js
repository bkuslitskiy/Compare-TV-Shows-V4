import { test, expect } from '@playwright/test';

test.describe('Application', () => {
  test('should load the homepage with all required elements', async ({ page }) => {
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
    
    // Verify the selection grid is present (even if empty)
    await expect(page.locator('.selection-grid')).toBeVisible();
    
    // Verify the footer with attribution is present
    await expect(page.locator('footer')).toContainText('TMDB');
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
    
    // Click the system theme button
    await page.click('button[aria-label="System theme"]');
    
    // We can't reliably test the system theme result, but we can verify it doesn't crash
    await expect(page).toHaveTitle(/Compare TV Shows/);
  });
  
  test('should have responsive layout', async ({ page }) => {
    // Test with a desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    
    // Verify desktop layout
    const desktopLayout = await page.evaluate(() => {
      const selectionGrid = document.querySelector('.selection-grid');
      return window.getComputedStyle(selectionGrid).gridTemplateColumns;
    });
    
    // Should have multiple columns on desktop
    expect(desktopLayout).not.toContain('repeat(1,');
    
    // Test with a mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout
    const mobileLayout = await page.evaluate(() => {
      const selectionGrid = document.querySelector('.selection-grid');
      return window.getComputedStyle(selectionGrid).gridTemplateColumns;
    });
    
    // Should have a single column on mobile
    expect(mobileLayout).toContain('repeat(1,');
  });
  
  test('should handle errors gracefully', async ({ page }) => {
    // Test with a bad URL
    await page.goto('/#badroute');
    
    // Verify the app still loads
    await expect(page).toHaveTitle(/Compare TV Shows/);
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    
    // Verify no error messages are visible to the user
    await expect(page.locator('text=Error')).not.toBeVisible();
    await expect(page.locator('text=Exception')).not.toBeVisible();
  });
});
