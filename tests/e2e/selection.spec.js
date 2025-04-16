import { test, expect } from '@playwright/test';

test.describe('Selection Management', () => {
  test('should add and remove items from selection list', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add first item
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add second item
    await page.fill('input[placeholder*="Search"]', 'Better Call Saul');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Verify both items are in selection list
    const selectionList = page.locator('.selection-grid');
    await expect(selectionList).toContainText('Breaking Bad');
    await expect(selectionList).toContainText('Better Call Saul');
    
    // Remove first item
    await page.click('.selection-grid >> text=Breaking Bad >> .. >> button[aria-label="Remove"]');
    
    // Verify first item is removed
    await expect(selectionList).not.toContainText('Breaking Bad');
    await expect(selectionList).toContainText('Better Call Saul');
  });

  test('should maintain selections between page refreshes', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add an item
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Verify it's in the selection list
    await expect(page.locator('.selection-grid')).toContainText('Breaking Bad');
    
    // Refresh the page
    await page.reload();
    
    // Verify the selection is still there
    await expect(page.locator('.selection-grid')).toContainText('Breaking Bad');
  });
  
  test('should support keyboard navigation in selection list', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add first item
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add second item
    await page.fill('input[placeholder*="Search"]', 'Better Call Saul');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Focus the selection list
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Navigate through selection items with keyboard
    await page.keyboard.press('ArrowRight'); // Move to second item
    await page.keyboard.press('ArrowLeft');  // Move back to first item
    
    // Remove the first item with keyboard
    await page.keyboard.press('Delete');
    
    // Verify first item is removed
    await expect(page.locator('.selection-grid')).not.toContainText('Breaking Bad');
    await expect(page.locator('.selection-grid')).toContainText('Better Call Saul');
  });
  
  test('should clear all selections when clear button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add first item
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add second item
    await page.fill('input[placeholder*="Search"]', 'Better Call Saul');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Click the clear all button
    await page.click('button:has-text("Clear All")');
    
    // Verify all selections are removed
    await expect(page.locator('.selection-grid')).not.toContainText('Breaking Bad');
    await expect(page.locator('.selection-grid')).not.toContainText('Better Call Saul');
  });
});
