import { test, expect } from '@playwright/test';

test.describe('Movie Comparison Functionality', () => {
  // Movies have less data than TV shows, so we can use a shorter timeout
  test.setTimeout(60000);
  
  test('should compare movies from the same franchise', async ({ page }) => {
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
    
    // Wait for comparison results to load (should be faster than TV shows)
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Verify expected shared people are shown (known to be in both Matrix movies)
    await expect(page.locator('text=Keanu Reeves')).toBeVisible();
    await expect(page.locator('text=Laurence Fishburne')).toBeVisible();
    await expect(page.locator('text=Carrie-Anne Moss')).toBeVisible();
    
    // Verify the Wachowskis are shown in crew
    await page.click('button:has-text("Crew")');
    await expect(page.locator('text=Wachowski')).toBeVisible();
    
    // Verify character names are shown correctly
    await page.click('button:has-text("Cast")');
    await expect(page.locator('text=Neo')).toBeVisible();
    await expect(page.locator('text=Morpheus')).toBeVisible();
    await expect(page.locator('text=Trinity')).toBeVisible();
  });

  test('should compare movies from the same director', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add Inception (Christopher Nolan film)
    await page.fill('input[placeholder*="Search"]', 'Inception 2010');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add The Dark Knight (also Christopher Nolan film)
    await page.fill('input[placeholder*="Search"]', 'The Dark Knight 2008');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Verify Christopher Nolan is shown in crew
    await page.click('button:has-text("Crew")');
    await expect(page.locator('text=Christopher Nolan')).toBeVisible();
    
    // Verify Hans Zimmer (composer for both) is shown
    await expect(page.locator('text=Hans Zimmer')).toBeVisible();
    
    // Verify shared actors if any (Michael Caine is in both)
    await page.click('button:has-text("Cast")');
    await expect(page.locator('text=Michael Caine')).toBeVisible();
  });
  
  test('should handle movies with minimal shared cast/crew', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add a sci-fi movie
    await page.fill('input[placeholder*="Search"]', 'Interstellar 2014');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add a comedy movie (unlikely to share much cast/crew)
    await page.fill('input[placeholder*="Search"]', 'The Hangover');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Either we should see few shared people or a "no shared cast/crew" message
    const noResultsMessage = page.locator('text=No shared cast or crew members found');
    
    try {
      await expect(noResultsMessage).toBeVisible({ timeout: 5000 });
    } catch (e) {
      // If we don't see the no results message, verify there are very few shared people
      const peopleCount = await page.locator('.table-row').count();
      expect(peopleCount).toBeLessThan(5);
    }
  });
  
  test('should sort movie comparison results correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add Pulp Fiction
    await page.fill('input[placeholder*="Search"]', 'Pulp Fiction');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add Django Unchained (both Tarantino films)
    await page.fill('input[placeholder*="Search"]', 'Django Unchained');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
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
    
    // Verify Quentin Tarantino is in the results
    await expect(page.locator('text=Quentin Tarantino')).toBeVisible();
    
    // Verify Samuel L. Jackson is in the results (he's in both films)
    await expect(page.locator('text=Samuel L. Jackson')).toBeVisible();
  });
  
  test('should use advanced filtering for movie comparisons', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Add The Lord of the Rings: The Fellowship of the Ring
    await page.fill('input[placeholder*="Search"]', 'The Lord of the Rings: The Fellowship of the Ring');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add The Lord of the Rings: The Two Towers
    await page.fill('input[placeholder*="Search"]', 'The Lord of the Rings: The Two Towers');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Get the initial count of people (should be many for LOTR films)
    const initialCount = await page.locator('.table-row').count();
    expect(initialCount).toBeGreaterThan(10);
    
    // Open advanced filters
    await page.click('button:has-text("Advanced Filters")');
    
    // Check "Main Cast Only"
    await page.check('#main-cast-only');
    
    // Get the count after main cast filter
    const mainCastCount = await page.locator('.table-row').count();
    
    // Verify main cast count is less than initial count
    expect(mainCastCount).toBeLessThan(initialCount);
    
    // Search for a specific character/actor
    await page.fill('#search-filter', 'Gandalf');
    
    // Verify we can find Gandalf/Ian McKellen
    await expect(page.locator('text=Ian McKellen')).toBeVisible();
    
    // Reset filters
    await page.click('button:has-text("Reset Filters")');
    
    // Verify count is back to initial count
    const resetCount = await page.locator('.table-row').count();
    expect(resetCount).toBeCloseTo(initialCount, -1); // Allow for some margin of error
  });
  
  test('should measure performance of movie comparison', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Clear cache first to ensure consistent timing
    await page.click('button[aria-label="Show cache status"]');
    await page.click('button:has-text("Clear Cache")');
    await page.click('button[aria-label="Close cache status"]');
    
    // Add Star Wars: A New Hope
    await page.fill('input[placeholder*="Search"]', 'Star Wars: A New Hope');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Add Star Wars: The Empire Strikes Back
    await page.fill('input[placeholder*="Search"]', 'Star Wars: The Empire Strikes Back');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');
    
    // Record start time
    const startTime = Date.now();
    
    // Click compare button
    await page.click('button:has-text("Compare Selections")');
    
    // Wait for comparison results to load
    await page.waitForSelector('text=Comparison Results', { timeout: 30000 });
    
    // Record end time
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Verify load time is reasonable (under 10 seconds for movies)
    expect(loadTime).toBeLessThan(10000);
    
    // Verify expected cast members are shown
    await expect(page.locator('text=Mark Hamill')).toBeVisible();
    await expect(page.locator('text=Harrison Ford')).toBeVisible();
    await expect(page.locator('text=Carrie Fisher')).toBeVisible();
    
    // Check cache hit on second comparison
    await page.click('button:has-text("Clear Results")');
    await page.click('button:has-text("Compare Selections")');
    
    // Open cache status
    await page.click('button[aria-label="Show cache status"]');
    
    // Verify cache hits increased
    await expect(page.locator('text=Cache Hits:')).not.toContainText('Cache Hits: 0');
    
    // Close cache panel
    await page.click('button[aria-label="Close cache status"]');
  });
});
