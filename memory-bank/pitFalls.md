# Pitfalls

This document tracks common errors, issues, and their solutions to prevent repeating the same mistakes.

## API Integration Issues

### TMDB API Key Not Found

**Issue**: The API key for TMDB might not be loaded correctly from environment variables.

**Solution**: Ensure the `.env` file is properly loaded using `dotenv.config()` in the server code. For testing environments, explicitly pass the API key in the environment variables when spawning server processes.

### Rate Limiting

**Issue**: TMDB API has rate limits that can cause failures during heavy testing or usage.

**Solution**: Implemented rate limiting middleware that delays requests to stay within TMDB's limits. The current implementation allows 3 requests per second with exponential backoff for retries.

## Caching Issues

### Cache TTL Constants Not Exported

**Issue**: The `CACHE_TTL` constant in `cachedApi.js` was defined but not exported, causing `TypeError: Cannot read properties of undefined (reading 'CREDITS')` when referenced from other modules.

**Solution**: Export the `CACHE_TTL` constant from `cachedApi.js` and include it in the default export:

```javascript
export const CACHE_TTL = {
  SEARCH: 15 * 60 * 1000, // 15 minutes
  DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  CREDITS: 24 * 60 * 60 * 1000, // 24 hours
  SEASONS: 24 * 60 * 60 * 1000, // 24 hours
  EPISODES: 24 * 60 * 60 * 1000, // 24 hours
};

// Later in the file:
export default {
  CACHE_TTL,
  // other exports...
};
```

## Testing Issues

### Test Server Setup

**Issue**: Playwright tests were failing because the servers weren't running when the tests started.

**Solution**: Created dedicated setup and teardown scripts that:
1. Start the backend and frontend servers before tests
2. Wait for servers to be available before proceeding
3. Properly clean up and kill processes after tests complete

### Browser Testing Debugging

**Issue**: Difficult to debug browser-based test failures.

**Solution**: Enhanced the test scripts to:
1. Capture and log browser console messages
2. Take screenshots on failure
3. Save page HTML on failure
4. Add detailed error logging
5. Implement global error handlers in the browser context

## Data Consistency Issues

### Movie vs TV Show Property Naming

**Issue**: Inconsistent property naming between movies and TV shows. Movies use `title` while TV shows use `name`.

**Solution**: Updated the comparison logic to handle both property names:

```javascript
// Function to get the project name (handles both TV shows and movies)
const getProjectName = (project) => {
  return project.name || project.title || 'Unknown Project';
};
```

Also ensured media objects have consistent properties by setting both when available:

```javascript
// Ensure both name and title are set for consistency
if (project.name) {
  mediaInfo.name = project.name;
}
if (project.title) {
  mediaInfo.title = project.title;
}
