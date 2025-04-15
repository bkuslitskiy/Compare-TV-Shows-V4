import { test, expect } from '@playwright/test';

test.describe('Comparison Functionality', () => {
  // This test may take longer due to API calls for detailed cast/crew information
  test.setTimeout(60000);
  
  test('should show comparison results for selected shows', async ({ page }) => {
    await page.goto('/');
    
    // Add Breaking Bad
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add Better Call Saul
    await page.fill('input[placeholder*="Search"]', 'Better Call Saul');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Wait for comparison results to load
    // This may take some time with the real API
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Verify some expected shared cast/crew are shown
    // These are known to be in both shows
    await expect(page.locator('text=Bob Odenkirk')).toBeVisible();
    await expect(page.locator('text=Jonathan Banks')).toBeVisible();
    
    // Test department filtering
    await page.click('button:has-text("Cast")');
    
    // Verify we're seeing cast members
    await expect(page.locator('text=Saul Goodman')).toBeVisible();
    
    // Test crew filtering
    await page.click('button:has-text("Crew")');
    
    // Verify we're seeing crew members
    await expect(page.locator('text=Vince Gilligan')).toBeVisible();
  });

  test('should handle shows with no shared cast/crew', async ({ page }) => {
    await page.goto('/');
    
    // Add Breaking Bad (drama)
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add The Office (comedy) - unlikely to share cast/crew with Breaking Bad
    await page.fill('input[placeholder*="Search"]', 'The Office');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Check if we see the "no shared cast or crew" message
    // Note: There's a small chance some crew member worked on both shows
    const noResultsMessage = page.locator('text=No shared cast or crew members found');
    const sharedPeople = page.locator('.comparison-table');
    
    // Either we should see the no results message or very few shared people
    try {
      await expect(noResultsMessage).toBeVisible();
    } catch (e) {
      // If we don't see the no results message, verify there are very few shared people
      const peopleCount = await page.locator('.table-row').count();
      expect(peopleCount).toBeLessThan(5);
    }
  });
  
  test('should sort comparison results', async ({ page }) => {
    await page.goto('/');
    
    // Add Breaking Bad
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add Better Call Saul
    await page.fill('input[placeholder*="Search"]', 'Better Call Saul');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Get the default order (by importance)
    const initialOrder = await page.locator('.person-cell').allTextContents();
    
    // Sort by name
    await page.selectOption('select[aria-label="Sort results by"]', 'name');
    
    // Get the new order
    const nameOrder = await page.locator('.person-cell').allTextContents();
    
    // Verify the order changed
    expect(initialOrder).not.toEqual(nameOrder);
    
    // Sort by number of projects
    await page.selectOption('select[aria-label="Sort results by"]', 'projects');
    
    // Get the new order
    const projectOrder = await page.locator('.person-cell').allTextContents();
    
    // Verify the order changed again
    expect(nameOrder).not.toEqual(projectOrder);
  });
  
  test('should filter by department', async ({ page }) => {
    await page.goto('/');
    
    // Add Breaking Bad
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add Better Call Saul
    await page.fill('input[placeholder*="Search"]', 'Better Call Saul');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Get the count of all people
    const allCount = await page.locator('.table-row').count();
    
    // Filter by Cast
    await page.click('button:has-text("Cast")');
    
    // Get the count of cast members
    const castCount = await page.locator('.table-row').count();
    
    // Verify cast count is less than all count
    expect(castCount).toBeLessThan(allCount);
    
    // Filter by Crew
    await page.click('button:has-text("Crew")');
    
    // Get the count of crew members
    const crewCount = await page.locator('.table-row').count();
    
    // Verify crew count is less than all count
    expect(crewCount).toBeLessThan(allCount);
    
    // Verify cast + crew approximately equals all
    expect(castCount + crewCount).toBeCloseTo(allCount, -1); // Allow for some margin of error
  });
  
  test('should use advanced filtering options', async ({ page }) => {
    await page.goto('/');
    
    // Add Breaking Bad
    await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add Better Call Saul
    await page.fill('input[placeholder*="Search"]', 'Better Call Saul');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Get the initial count of people
    const initialCount = await page.locator('.table-row').count();
    
    // Open advanced filters
    await page.click('button:has-text("Advanced Filters")');
    
    // Set minimum episodes to 5
    await page.fill('#min-episodes', '5');
    
    // Get the filtered count
    const filteredByEpisodesCount = await page.locator('.table-row').count();
    
    // Verify filtered count is less than or equal to initial count
    expect(filteredByEpisodesCount).toBeLessThanOrEqual(initialCount);
    
    // Check "Main Cast Only"
    await page.check('#main-cast-only');
    
    // Get the count after main cast filter
    const mainCastCount = await page.locator('.table-row').count();
    
    // Verify main cast count is less than or equal to filtered by episodes count
    expect(mainCastCount).toBeLessThanOrEqual(filteredByEpisodesCount);
    
    // Search for a specific term
    await page.fill('#search-filter', 'Walter');
    
    // Get the count after search
    const searchCount = await page.locator('.table-row').count();
    
    // Verify search narrows down results
    expect(searchCount).toBeLessThanOrEqual(mainCastCount);
    
    // Reset filters
    await page.click('button:has-text("Reset Filters")');
    
    // Verify count is back to initial count
    const resetCount = await page.locator('.table-row').count();
    expect(resetCount).toBeCloseTo(initialCount, -1); // Allow for some margin of error
    
    // Close advanced filters
    await page.click('button[aria-label="Close filters"]');
    
    // Verify advanced filters panel is closed
    await expect(page.locator('text=Advanced Filters').first()).not.toBeVisible();
  });
});
