# Active Context

This document captures the current focus of development, recent changes, and active decisions.

## Current Focus

We are currently focused on improving the reliability and testability of the comparison functionality in the application. This includes:

1. Fixing bugs in the comparison process
2. Enhancing the testing infrastructure
3. Improving error handling and debugging capabilities
4. Ensuring consistent data handling between movies and TV shows

## Recent Changes

### Fixed Comparison Functionality

We identified and fixed a critical issue with the comparison functionality:

- The `CACHE_TTL` constant in `cachedApi.js` was not being exported, causing errors when referenced from `tmdb.js`
- This resulted in a `TypeError: Cannot read properties of undefined (reading 'CREDITS')` error
- We fixed this by properly exporting the constant and including it in the default export

### Enhanced Data Consistency

We improved the handling of data inconsistencies between movies and TV shows:

- Movies use `title` property while TV shows use `name` property
- Updated the comparison logic to handle both properties consistently
- Added fallback mechanisms to ensure proper display regardless of the data source

### Improved Testing Infrastructure

We significantly enhanced the testing infrastructure:

- Created robust setup and teardown scripts for automated testing
- Implemented proper server startup and shutdown for tests
- Added detailed error logging and debugging tools
- Fixed test failures related to server availability
- Added screenshot and HTML capture on test failures

## Active Decisions

### Testing Strategy

- We've decided to use a combination of unit tests and end-to-end tests
- End-to-end tests use Playwright to simulate real user interactions
- Custom setup/teardown scripts ensure consistent test environments
- Tests are designed to be resilient to API rate limiting and network issues

### Error Handling

- We're implementing more comprehensive error handling throughout the application
- Console errors are captured and logged for debugging
- User-facing error messages are clear and actionable
- Fallbacks are provided where possible to prevent complete failure

### Caching Strategy

- We're using a multi-level caching strategy to improve performance
- API responses are cached with appropriate TTLs
- Complex operations (like movie credits) have dedicated cache keys
- Cache size is monitored to prevent memory issues

## Next Steps

1. Implement more comprehensive error handling for edge cases
2. Add more automated tests for different comparison scenarios
3. Optimize the comparison algorithm for better performance with large datasets
4. Enhance the UI with more visual indicators of relationships
5. Implement cache management tools to prevent excessive memory usage

## Technical Insights

- The TMDB API has inconsistent property naming between different endpoints
- Rate limiting is essential to prevent API failures during heavy usage
- Browser-based testing requires careful setup and teardown to be reliable
- Proper error handling significantly improves debugging and user experience
