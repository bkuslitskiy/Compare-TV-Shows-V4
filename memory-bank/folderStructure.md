# Folder Structure

This document outlines the project's directory structure, explaining the purpose of each folder and file, and listing the functions defined in each file. This will be updated as the project evolves.

## Root Directory

### Current Structure

```
compare-tv-shows/
├── .env                     # Environment variables
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── docs/                    # Project documentation
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry point
├── memory-bank/             # Memory bank files
├── package-lock.json        # NPM lock file
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── public/                  # Static assets
│   ├── images/              # Image assets
│   ├── placeholder-image.png # Placeholder image
│   ├── placeholder-image.svg # Placeholder image SVG
│   └── vite.svg             # Vite logo
├── README.md                # Project readme
├── server/                  # Local development server
│   ├── .env                 # Server environment variables
│   ├── api-proxy.js         # TMDB API proxy
│   ├── index.js             # Server entry point
│   ├── package-lock.json    # Server NPM lock file
│   └── package.json         # Server dependencies
├── src/                     # Source code
│   ├── App.css              # App component styles
│   ├── App.jsx              # Main App component
│   ├── assets/              # Static assets for components
│   │   └── react.svg        # React logo
│   ├── components/          # React components
│   │   ├── comparison/      # Comparison result components
│   │   ├── layout/          # Layout components
│   │   ├── search/          # Search and selection components
│   │   └── ui/              # Reusable UI components
│   ├── context/             # React Context providers
│   │   ├── ComparisonContext.jsx # Comparison context
│   │   └── SelectionContext.jsx  # Selection context
│   ├── hooks/               # Custom React hooks
│   ├── index.css            # Global CSS
│   ├── main.jsx             # Application entry point
│   ├── services/            # Service layer
│   │   ├── api.js           # API client
│   │   ├── comparison.js    # Comparison logic
│   │   └── tmdb.js          # TMDB specific service
│   ├── styles/              # Additional styles
│   └── utils/               # Utility functions
│       └── tmdbHelpers.js   # Helper functions for TMDB data
├── tailwind.config.js       # Tailwind CSS configuration
├── tests/                   # Playwright tests
│   ├── e2e/                 # End-to-end tests
│   │   └── app.spec.js      # App tests
│   ├── fixtures/            # Test fixtures
│   │   └── sample-data.js   # Sample test data
│   └── playwright.config.js # Playwright configuration
└── vite.config.js           # Vite configuration
```

## Memory Bank

```
memory-bank/
├── activeContext.md         # Current work focus and recent changes
├── folderStructure.md       # This file - project structure documentation
├── pitFalls.md              # Common errors and issues
├── productContext.md        # Product purpose and user experience goals
├── progress.md              # Project progress tracking
├── projectbrief.md          # Core project requirements
├── systemPatterns.md        # System architecture and patterns
└── techContext.md           # Technologies and development setup
```

## Documentation

```
docs/
├── api.md                   # API integration documentation
├── architecture.md          # System architecture details
├── aws-dependencies.md      # AWS requirements tracking
├── components.md            # Component documentation
└── testing.md               # Testing strategy and examples
```

## Server

```
server/
├── .env                     # Server environment variables
├── api-proxy.js             # TMDB API proxy for development
├── index.js                 # Server entry point
├── package-lock.json        # Server NPM lock file
└── package.json             # Server dependencies
```

## Source Code

```
src/
├── App.css                  # App component styles
├── App.jsx                  # Main App component
├── assets/                  # Static assets for components
│   └── react.svg            # React logo
├── components/              # React components
│   ├── comparison/          # Comparison result components
│   │   └── ComparisonResults.jsx # Comparison results component
│   ├── layout/              # Layout components
│   │   ├── Footer.jsx       # Footer component
│   │   ├── Header.jsx       # Header component with theme toggle
│   │   └── MainLayout.jsx   # Main layout wrapper
│   ├── search/              # Search and selection components
│   │   ├── SearchBar.jsx    # Search input with autosuggestions
│   │   └── SelectionList.jsx # List of selected shows/movies
│   └── ui/                  # Reusable UI components
├── context/                 # React Context providers
│   ├── ComparisonContext.jsx # Comparison context provider
│   └── SelectionContext.jsx  # Selection context provider
├── hooks/                   # Custom React hooks
├── index.css                # Global CSS
├── main.jsx                 # Application entry point
├── services/                # Service layer
│   ├── api.js               # Base API client
│   ├── comparison.js        # Comparison logic
│   └── tmdb.js              # TMDB specific service
├── styles/                  # Additional styles
└── utils/                   # Utility functions
    └── tmdbHelpers.js       # Helper functions for TMDB data
```

## Tests

```
tests/
├── e2e/                     # End-to-end tests
│   └── app.spec.js          # App tests
├── fixtures/                # Test fixtures
│   └── sample-data.js       # Sample test data
└── playwright.config.js     # Playwright configuration
```

## Component Details

### Layout Components

```
src/components/layout/
├── Header.jsx               # Application header with theme toggle
├── Footer.jsx               # Application footer
└── MainLayout.jsx           # Main layout wrapper
```

**Functions in Header.jsx:**
- `Header()` - Renders the application header with theme toggle
  - Manages theme state (light/dark/system)
  - Detects system theme preference
  - Applies theme class to document

**Functions in Footer.jsx:**
- `Footer()` - Renders the application footer with TMDB attribution

**Functions in MainLayout.jsx:**
- `MainLayout({ children })` - Wraps the application content with header and footer

### Search Components

```
src/components/search/
├── SearchBar.jsx            # Search input with autosuggestions
└── SelectionList.jsx        # List of selected shows/movies
```

**Functions in SearchBar.jsx:**
- `SearchBar({ onSelect })` - Handles search input and displays autosuggestions
  - Manages search query state
  - Fetches search results from TMDB API
  - Displays loading state
  - Handles selection of search results

**Functions in SelectionList.jsx:**
- `SelectionList({ selections, onRemove })` - Displays selected shows/movies with remove option
  - Renders grid of selected items
  - Displays poster images with fallback
  - Provides remove button for each selection

### Comparison Components

```
src/components/comparison/
└── ComparisonResults.jsx    # Main comparison results container
```

**Functions in ComparisonResults.jsx:**
- `ComparisonResults({ sharedCast, sharedCrew, projects })` - Displays the comparison results
  - Manages tab state for cast/crew
  - Displays project thumbnails
  - Renders shared cast and crew members with their roles
  - Provides empty state for no results

## Context Providers

```
src/context/
├── SelectionContext.jsx     # Manages selected shows/movies
└── ComparisonContext.jsx    # Stores comparison results
```

**Functions in SelectionContext.jsx:**
- `SelectionProvider({ children })` - Provider for selection context
  - Manages selections state
  - Provides functions to add, remove, and clear selections
- `useSelection()` - Hook to access selection context

**Functions in ComparisonContext.jsx:**
- `ComparisonProvider({ children })` - Provider for comparison results
  - Manages comparison results state
  - Provides function to compare selected projects
  - Handles loading and error states
- `useComparison()` - Hook to access comparison context

## Services

```
src/services/
├── api.js                   # Base API client
├── tmdb.js                  # TMDB specific service
└── comparison.js            # Comparison logic
```

**Functions in api.js:**
- `createApiClient(baseURL)` - Creates an API client with Axios
  - Configures base URL, timeout, and headers
  - Adds request and response interceptors for logging
- `get(url, params)` - Makes a GET request
- `post(url, data)` - Makes a POST request

**Functions in tmdb.js:**
- `searchMulti(query, page)` - Searches for movies, TV shows, and people
- `getShowDetails(id)` - Gets TV show details
- `getMovieDetails(id)` - Gets movie details
- `getShowSeasons(id)` - Gets all seasons for a TV show
- `getSeasonEpisodes(showId, seasonNumber)` - Gets all episodes for a season
- `getEpisodeCredits(showId, seasonNumber, episodeNumber)` - Gets credits for an episode
- `getMovieCredits(id)` - Gets credits for a movie
- `getShowAllCredits(id)` - Gets all credits for a TV show across all episodes
- `getMovieWithCredits(id)` - Gets complete details for a movie with credits

**Functions in comparison.js:**
- `compareProjects(projects)` - Compares multiple projects to find shared people
  - Processes cast and crew from each project
  - Identifies people who appear in multiple projects
  - Returns shared cast and crew
- `rankByImportance(sharedPeople, type)` - Ranks shared people by importance
  - Calculates importance score based on role type and episode count
  - Sorts people by importance score
- `groupRoles(roles)` - Groups similar roles together
- `areSimilarRoles(role1, role2)` - Checks if two roles are similar
- `getPrimaryRole(roles)` - Gets the primary role from a list of similar roles

## Utility Functions

```
src/utils/
└── tmdbHelpers.js           # Helper functions for TMDB data
```

**Functions in tmdbHelpers.js:**
- `getImageUrl(path, size)` - Constructs image URL from TMDB path
- `formatReleaseDate(date)` - Formats release date
- `getMediaType(item)` - Determines media type (movie, TV, person)
- `getMediaName(item)` - Gets a display name for a media item
- `getReleaseYear(item)` - Gets a release year for a media item
- `truncateText(text, length)` - Truncates text to a specified length

## Server Components

```
server/
├── api-proxy.js             # TMDB API proxy for development
└── index.js                 # Server entry point
```

**Functions in api-proxy.js:**
- `createProxyMiddleware()` - Creates a middleware function that proxies requests to the TMDB API
  - Adds API key to requests
  - Handles errors from TMDB API
- `rateLimitMiddleware()` - Rate limiting middleware to prevent exceeding TMDB API rate limits
  - Limits requests to 3 per second
  - Delays requests that exceed the rate limit

**Functions in index.js:**
- Express server setup
- Middleware configuration
- API proxy route
- Health check endpoint
