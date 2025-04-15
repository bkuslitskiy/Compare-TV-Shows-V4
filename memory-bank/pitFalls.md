# Pitfalls

This document tracks common errors, issues, and challenges encountered during development, along with their solutions or workarounds.

## Encountered Issues

### 1. Duplicate Function Declarations in tmdb.js

**Issue:** The tmdb.js file had duplicate declarations of the `sleep` and `retryWithBackoff` functions.

**Impact:** This caused TypeScript errors about redeclaring block-scoped variables, which could potentially lead to unexpected behavior in the application.

**Root Cause:** The utility functions were defined at the top of the file and then accidentally duplicated further down in the file, likely during a refactoring or copy-paste operation.

**Solution:**
1. Removed the duplicate function declarations
2. Added more detailed logging to the API proxy for better debugging
3. Verified that the search and comparison functionality works correctly after the fix

**Prevention:**
- Use a linter to catch duplicate declarations
- Implement a code review process
- Be cautious when refactoring or copying code
- Consider extracting utility functions to a separate file to avoid duplication

### 2. Tailwind CSS Utility Class Recognition

**Issue:** Tailwind CSS was not recognizing utility classes like `bg-gray-100`, causing styling to fail.

**Impact:** Components were not styled correctly, and the application had inconsistent appearance.

**Root Cause:** Tailwind's JIT compiler was not including certain utility classes in the build because:
1. They weren't explicitly used in the HTML/JSX in a way that Tailwind could detect
2. The docs directory wasn't included in the content paths
3. Using @apply with utility classes that weren't otherwise detected in the content

**Solution:**
1. Added a safelist in tailwind.config.js for commonly used utility classes:
   ```js
   safelist: [
     'bg-gray-100',
     'bg-gray-200',
     'bg-gray-700',
     'bg-gray-800',
     'bg-gray-900',
     'text-gray-100',
     // ... other utility classes
   ]
   ```
2. Added the docs directory to the content paths:
   ```js
   content: [
     "./index.html",
     "./src/**/*.{js,jsx}",
     "./docs/**/*.{js,jsx,md}",
   ]
   ```
3. Converted @apply directives in src/index.css to standard CSS
4. Updated component files to use safelisted utility classes or standard CSS

**Prevention:**
- Use standard CSS for base styles instead of @apply
- Include all directories with content that uses utility classes in the content paths
- Add commonly used utility classes to the safelist
- Consider using explicit class names for critical styling

### 3. Responsive Utility Classes with @apply

**Issue:** Tailwind CSS was unable to process responsive utility classes like `sm:grid-cols-2` when used with the `@apply` directive.

**Impact:** This caused build errors with messages like: `[postcss] Cannot apply unknown utility class: sm:grid-cols-2`

**Root Cause:** Tailwind CSS has limitations when using responsive variants with the `@apply` directive. The responsive variants are designed to be used directly in HTML/JSX, not within CSS.

**Solution:**
1. Removed the `@apply` directive with responsive variants from the CSS
2. Replaced it with standard CSS using media queries that match Tailwind's breakpoints:
   ```css
   /* Selection grid */
   .selection-grid {
     display: grid;
     grid-template-columns: repeat(1, minmax(0, 1fr)); /* grid-cols-1 */
     gap: 1rem; /* gap-4 */
     outline: none; /* focus:outline-none */
   }

   /* sm breakpoint (640px and up) */
   @media (min-width: 640px) {
     .selection-grid {
       grid-template-columns: repeat(2, minmax(0, 1fr)); /* sm:grid-cols-2 */
     }
   }

   /* md breakpoint (768px and up) */
   @media (min-width: 768px) {
     .selection-grid {
       grid-template-columns: repeat(3, minmax(0, 1fr)); /* md:grid-cols-3 */
     }
   }

   /* lg breakpoint (1024px and up) */
   @media (min-width: 1024px) {
     .selection-grid {
       grid-template-columns: repeat(4, minmax(0, 1fr)); /* lg:grid-cols-4 */
     }
   }
   ```

**Prevention:**
- Avoid using responsive variants with `@apply`
- Use standard CSS with media queries for responsive styles
- If you must use responsive variants, add them to the safelist and use them directly in HTML/JSX
- Consider using Tailwind's responsive variants only in component templates, not in CSS

### 2. TMDB API Rate Limiting

**Issue:** TMDB API has rate limits of 3-4 requests per second.

**Impact:** When fetching data for TV shows with many seasons and episodes, we hit rate limits.

**Solution:**
- Implemented rate limiting middleware in the API proxy
- Added request queuing with a maximum of 3 requests per second
- Added logging for rate-limited requests
- Implemented delay mechanism for requests that exceed the rate limit
- Added caching layer with localStorage to reduce API requests
- Implemented batch processing for large datasets
- Added memoization for expensive calculations

**Future Improvements:**
- Implement more sophisticated caching strategies
- Add batch request capability where possible
- Consider server-side caching for frequently accessed data

### 3. Caching Implementation Issues

**Issue:** The caching implementation in tmdb.js had incorrect function calls for storing data in the cache.

**Impact:** Cache was not being properly populated, leading to repeated API calls for the same data.

**Root Cause:** The code was using `cachedApi.getCached(cacheKey, {}, result)` to store data in the cache, but `getCached` is meant for retrieving data, not storing it.

**Solution:**
1. Imported the cacheService directly in tmdb.js
2. Changed the cache storage calls to use `cacheService.set(cacheKey, result, ttl)` instead
3. Updated the cache retrieval to use `cacheService.get(cacheKey)` directly
4. Added better logging for cache hits and misses

**Prevention:**
- Clearly document the purpose and usage of each function
- Use descriptive function names that indicate their purpose
- Implement unit tests for caching functionality
- Review code that interacts with the cache for correct usage

### 4. Comparison Performance with Large TV Shows

**Issue:** Comparing TV shows with many seasons and episodes caused performance issues and timeouts.

**Impact:** Users experienced long loading times or errors when comparing popular TV shows with many seasons.

**Root Cause:** The comparison algorithm was processing all episodes sequentially without any optimization for large datasets.

**Solution:**
1. Implemented batch processing for large datasets
2. Added memoization for expensive calculations
3. Optimized the role grouping algorithm for large datasets
4. Improved error handling for API timeouts and failures
5. Added more detailed logging for debugging

**Prevention:**
- Test with realistic data sizes during development
- Implement performance monitoring
- Consider the impact of large datasets on algorithms
- Design algorithms with scalability in mind

## Anticipated Challenges

### 1. Large Dataset Handling

**Issue:** TV shows with many seasons can have hundreds of cast and crew members.

**Potential Impact:** Performance issues when processing and displaying large datasets.

**Solutions:**
- Implement pagination for results display
- Use virtualized lists for rendering large datasets
- Optimize comparison algorithm for performance
- Implement progressive loading of data
- Consider using Web Workers for heavy computation

### 2. API Key Security

**Issue:** TMDB API key must be kept secure and not exposed in frontend code.

**Potential Impact:** Security vulnerability if API key is exposed.

**Solutions:**
- Use AWS Lambda proxy for all TMDB API requests
- Implement proper CORS settings on the proxy
- Use environment variables for local development
- Never commit API keys to version control

### 3. Keyboard Navigation Complexity

**Issue:** Implementing comprehensive keyboard navigation can be complex.

**Potential Impact:** Accessibility issues if keyboard navigation is incomplete or inconsistent.

**Solutions:**
- Use established patterns for keyboard navigation
- Implement focus management
- Test thoroughly with keyboard-only navigation
- Use ARIA attributes for better screen reader support
- Create custom hooks for keyboard navigation logic

### 4. Role Grouping Accuracy

**Issue:** Grouping similar roles accurately can be challenging due to inconsistent naming in TMDB data.

**Potential Impact:** Incorrect grouping could lead to misleading results.

**Solutions:**
- Create a comprehensive mapping of role variations
- Implement fuzzy matching for role names
- Allow manual overrides for edge cases
- Continuously refine grouping logic based on testing

### 5. Performance with Multiple TV Shows

**Issue:** Comparing multiple TV shows with many seasons could lead to performance issues.

**Potential Impact:** Slow loading times and poor user experience.

**Solutions:**
- Implement loading indicators and progress feedback
- Consider limiting the number of shows that can be compared at once
- Optimize data structures for efficient comparison
- Implement caching for previously compared shows
- Use pagination and lazy loading for results

### 6. AWS Lambda Cold Starts

**Issue:** AWS Lambda functions can experience cold starts, causing initial request delays.

**Potential Impact:** Slow initial API responses.

**Solutions:**
- Optimize Lambda function size
- Consider provisioned concurrency for production
- Implement client-side caching
- Show appropriate loading indicators

### 7. Browser Compatibility

**Issue:** Different browsers may handle certain features differently.

**Potential Impact:** Inconsistent user experience across browsers.

**Solutions:**
- Use feature detection instead of browser detection
- Test across multiple browsers
- Implement polyfills where necessary
- Use progressive enhancement

## Common Errors to Watch For

### 1. CORS Issues

**Error:** Cross-Origin Resource Sharing (CORS) errors when calling the API proxy.

**Solution:**
- Ensure proper CORS headers are set on the API proxy
- Check that the request includes the correct origin
- Verify that preflight requests are handled correctly

### 2. React Key Warnings

**Error:** Warning about missing keys in lists.

**Solution:**
- Always use unique and stable keys for list items
- Avoid using array indices as keys when the list can change
- Create composite keys if necessary

### 3. State Update on Unmounted Component

**Error:** Warning about updating state on an unmounted component.

**Solution:**
- Use cleanup functions in useEffect hooks
- Track component mounted state
- Cancel pending operations on unmount

### 4. API Data Inconsistencies

**Error:** Unexpected data structure from TMDB API.

**Solution:**
- Implement robust data validation
- Use default values or fallbacks
- Handle edge cases gracefully
- Log unexpected data patterns for future handling
