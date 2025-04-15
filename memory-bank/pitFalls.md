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

### 2. TMDB API Rate Limiting

**Issue:** TMDB API has rate limits of 3-4 requests per second.

**Impact:** When fetching data for TV shows with many seasons and episodes, we hit rate limits.

**Solution:**
- Implemented rate limiting middleware in the API proxy
- Added request queuing with a maximum of 3 requests per second
- Added logging for rate-limited requests
- Implemented delay mechanism for requests that exceed the rate limit

**Future Improvements:**
- Add caching layer to reduce the number of API requests
- Implement exponential backoff for failed requests
- Add batch request capability where possible

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
