# Testing Documentation

This document provides an overview of the testing strategy and implementation for the Compare TV Shows project.

## Testing Strategy

The project uses Playwright for end-to-end testing. The tests are designed to verify the functionality of the application from a user's perspective, ensuring that all features work as expected.

### Test Structure

The tests are organized into four main categories:

1. **Application Tests** (`app.spec.js`): Basic application functionality
2. **Search Tests** (`search.spec.js`): Search functionality
3. **Selection Tests** (`selection.spec.js`): Selection management
4. **Accessibility Tests** (`accessibility.spec.js`): Accessibility features

### Test Configuration

The Playwright configuration is defined in `tests/playwright.config.js`. Key configuration options include:

- Increased timeout for API calls (60 seconds)
- Retry logic for flaky tests
- Screenshot capture on test failure
- Video recording on first retry
- Web server configuration for running the application during tests

## Running Tests

To run all tests:

```bash
npx playwright test
```

To run a specific test file:

```bash
npx playwright test tests/e2e/app.spec.js
```

To run tests with a UI:

```bash
npx playwright test --ui
```

## Test Implementation Details

### Application Tests

- **Homepage Loading**: Verifies that all required elements are present on the homepage
- **Theme Toggling**: Tests switching between light, dark, and system themes
- **Responsive Layout**: Verifies that the layout adapts to different screen sizes
- **Error Handling**: Tests that the application handles errors gracefully

### Search Tests

- **Search Results**: Verifies that search results are displayed correctly
- **Keyboard Navigation**: Tests keyboard navigation through search results
- **Empty Results**: Verifies handling of search terms with no results
- **Clearing Results**: Tests clearing the search input

### Selection Tests

- **Adding/Removing Items**: Tests adding and removing items from the selection list
- **Persistence**: Verifies that selections are maintained between page refreshes
- **Keyboard Navigation**: Tests keyboard navigation in the selection list
- **Clearing All**: Tests the "Clear All" functionality

### Accessibility Tests

- **Keyboard Navigation**: Tests full keyboard navigation through the application
- **Focus Indicators**: Verifies that focus indicators are visible
- **ARIA Attributes**: Tests that proper ARIA attributes are present
- **Theme Preferences**: Verifies theme preference functionality
- **Color Contrast**: Basic tests for sufficient color contrast

## Git Branch

All testing-related changes have been committed to the `feature/playwright-tests` branch. The branch includes:

- New test files in the `tests/e2e` directory
- Updated Playwright configuration
- Fixed CSS issues related to Tailwind utility classes
- Updated memory bank documentation

## Next Steps

1. **Role Filtering System**: Implement enhanced filtering for comparison results
2. **Caching Layer**: Add local storage caching to reduce API requests
3. **Performance Optimization**: Improve handling of large datasets
4. **AWS Deployment**: Prepare for production deployment

## Known Issues

- The tests currently use the real TMDB API, which may lead to rate limiting issues during extensive testing
- Some tests may be flaky due to network conditions and API response times
- The tests assume certain data exists in the TMDB database, which may change over time
