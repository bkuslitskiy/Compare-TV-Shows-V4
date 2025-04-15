# Active Context

This document tracks the current work focus, recent changes, next steps, and active decisions for the Compare TV Shows project.

## Current Work Focus

We have completed the initial setup phase and have implemented most of the core functionality. The current focus is on:

1. Enhancing the UI/UX with keyboard navigation and role filtering
2. Optimizing performance for large datasets
3. Preparing for AWS deployment
4. Implementing comprehensive testing

## Recent Changes

- Implemented core functionality:
  - Search with autosuggestions from TMDB API
  - Selection management for TV shows and movies
  - Comparison algorithm to find shared cast and crew
  - Results display with tabs for cast and crew
  - Theme system with light/dark/system options

- Fixed Tailwind CSS utility class recognition issues:
  - Added safelist for commonly used utility classes
  - Added docs directory to content paths
  - Converted @apply directives to standard CSS
  - Updated component files to remove problematic utility classes

- Fixed duplicate function declarations in tmdb.js:
  - Removed duplicate sleep and retryWithBackoff functions
  - Added more detailed logging to api-proxy.js for better debugging
  - Verified search and comparison functionality is working correctly

- Created project structure:
  - Components organized by feature (layout, search, comparison)
  - Context providers for state management
  - Service modules for API and business logic
  - Utility functions for common operations

- Set up local development environment:
  - Express server for API proxy
  - Rate limiting for TMDB API requests
  - Error handling for API requests

## Next Steps

1. Implement keyboard navigation throughout the application
2. Create role filtering system for comparison results
3. Add caching layer to reduce API requests
4. Optimize performance for TV shows with many seasons
5. Write Playwright tests for core functionality
6. Prepare for AWS deployment

## Active Decisions and Considerations

### Technical Decisions

1. **JavaScript vs TypeScript**: Using JavaScript (ES6+) for development
2. **Styling Approach**: Using Tailwind CSS with standard CSS for base styles
3. **API Security**: Using AWS Lambda proxy in production, local server during development
4. **Testing Strategy**: Implementing Playwright tests throughout development
5. **State Management**: Using React Context API for global state
6. **Build Tool**: Using Vite for faster development experience

### Development Approach

1. **Documentation-First**: Creating comprehensive documentation before implementation
2. **Test-Driven Development**: Writing tests for each feature as it's developed
3. **Phased Implementation**: Implementing core functionality first, then adding optimizations
4. **Git Strategy**: Committing after testing all functionality since last commit
5. **Folder Structure**: Maintaining a clear separation of concerns in the project structure

## Important Patterns and Preferences

1. **Component Structure**: Using container/presentational pattern for components
2. **Custom Hooks**: Extracting complex logic into custom hooks
3. **Service Modules**: Isolating API and business logic in service modules
4. **Keyboard Navigation**: Ensuring all functionality is accessible via keyboard
5. **Theme System**: Supporting light, dark, and system themes
6. **Code Organization**: Following a modular approach with clear separation of concerns

## Learnings and Project Insights

1. **TMDB API Structure**: Understanding the relationships between shows, seasons, episodes, and credits
2. **Role Importance**: Implemented a system to rank roles by importance based on job type and episode count
3. **Performance Considerations**: Need to optimize for TV shows with many seasons and episodes
4. **Tailwind CSS Configuration**: Learned about safelist and content paths for proper utility class recognition
5. **API Rate Limiting**: Implemented rate limiting to prevent exceeding TMDB API limits

## Current Challenges

1. **API Key Security**: Ensuring the TMDB API key remains secure
2. **Data Collection Efficiency**: Optimizing collection of TV show episode data for shows with many seasons
3. **Performance Optimization**: Need to implement caching to reduce API requests
4. **Keyboard Navigation**: Implementing comprehensive keyboard navigation throughout the application
5. **Role Filtering**: Creating an intuitive filtering system for different role types
