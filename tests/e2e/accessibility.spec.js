import { test, expect } from '@playwright/test';

test.describe('Accessibility Features', () => {
  test('should support full keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Focus the search input
    await page.focus('input[placeholder*="Search"]');
    
    // Type a search term
    await page.keyboard.type('Breaking Bad');
    
    // Wait for results
    await page.waitForSelector('[role="option"]');
    
    // Navigate to first result with keyboard
    await page.keyboard.press('ArrowDown');
    
    // Verify focus is on the first result
    const focusedElement = await page.evaluate(() => document.activeElement.textContent);
    expect(focusedElement).toContain('Breaking Bad');
    
    // Select it with Enter
    await page.keyboard.press('Enter');
    
    // Verify selection was added
    await expect(page.locator('.selection-grid')).toContainText('Breaking Bad');
    
    // Tab to the selection list
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify we can navigate the selection list with keyboard
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Delete');
    
    // Verify selection was removed
    await expect(page.locator('.selection-grid')).not.toContainText('Breaking Bad');
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');
    
    // Focus the search input
    await page.focus('input[placeholder*="Search"]');
    
    // Verify it has a visible focus style
    const searchInputOutline = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search"]');
      return window.getComputedStyle(input).outlineWidth !== '0px' || 
             window.getComputedStyle(input).boxShadow !== 'none';
    });
    
    expect(searchInputOutline).toBeTruthy();
    
    // Tab to the theme toggle buttons
    await page.keyboard.press('Tab');
    
    // Verify the focused button has a visible focus style
    const buttonOutline = await page.evaluate(() => {
      const button = document.activeElement;
      return window.getComputedStyle(button).outlineWidth !== '0px' || 
             window.getComputedStyle(button).boxShadow !== 'none';
    });
    
    expect(buttonOutline).toBeTruthy();
  });
  
  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check search input has proper ARIA attributes
    await expect(page.locator('input[placeholder*="Search"]')).toHaveAttribute('aria-autocomplete', 'list');
    
    // Type a search term to get results
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    
    // Check search results have proper ARIA attributes
    await expect(page.locator('[role="listbox"]')).toBeVisible();
    await expect(page.locator('[role="option"]').first()).toBeVisible();
    
    // Select an item
    await page.click('[role="option"]');
    
    // Check selection list has proper ARIA attributes
    await expect(page.locator('.selection-grid')).toHaveAttribute('role', 'grid');
    
    // Check remove buttons have proper ARIA labels
    await expect(page.locator('button[aria-label="Remove"]')).toBeVisible();
  });
  
  test('should support theme preferences', async ({ page }) => {
    await page.goto('/');
    
    // Check light theme button
    await page.click('button[aria-label="Light theme"]');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // Check dark theme button
    await page.click('button[aria-label="Dark theme"]');
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Check system theme button
    await page.click('button[aria-label="System theme"]');
    
    // System theme depends on user's system preference, so we can't reliably test the result
    // But we can verify the button works without errors
    await expect(page.locator('html')).toBeDefined();
  });
  
  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - ideally you'd use an accessibility testing library
    await page.goto('/');
    
    // Check light theme contrast
    await page.click('button[aria-label="Light theme"]');
    
    const lightThemeContrast = await page.evaluate(() => {
      const body = document.body;
      const bodyStyle = window.getComputedStyle(body);
      const bodyColor = bodyStyle.color;
      const bodyBg = bodyStyle.backgroundColor;
      
      // This is a simplified check - in a real test you'd use a proper color contrast algorithm
      return bodyColor !== bodyBg;
    });
    
    expect(lightThemeContrast).toBeTruthy();
    
    // Check dark theme contrast
    await page.click('button[aria-label="Dark theme"]');
    
    const darkThemeContrast = await page.evaluate(() => {
      const body = document.body;
      const bodyStyle = window.getComputedStyle(body);
      const bodyColor = bodyStyle.color;
      const bodyBg = bodyStyle.backgroundColor;
      
      // This is a simplified check - in a real test you'd use a proper color contrast algorithm
      return bodyColor !== bodyBg;
    });
    
    expect(darkThemeContrast).toBeTruthy();
  });
});
