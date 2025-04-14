# Project Brief: Compare TV Shows

## Project Goal
To develop a browser app that compares the cast and crew of TV shows and movies, identifying shared members and ranking them by importance.

## Core Requirements
- Allow users to select two or more TV shows/movies
- Fetch data from TMDB API (key: 330b765d5cdf65fe2ab30dd670eab968 - to be secured via AWS Lambda proxy)
- Identify shared cast and crew members
- Collect data from all episodes of a TV show before comparing projects
- Display roles in each selected project
- Rank shared members by their importance to the projects
- Support keyboard navigation throughout the app
- Run on AWS Free Tier
- Follow best practices for security, UX, and accessibility
- Host at compare.my.useless.blog without interfering with existing my.useless.blog website
- Create a local development server before AWS deployment

## Additional Requirements
- Light and dark CSS themes, defaulting to system theme, with a toggle
- Use pastel colors that are easy on the eyes and accessible
- Group project roles logically (e.g., stunts + stunt coordinator, producer + executive producer)
- Make roles visually distinct with color coding
- Use roles as filtering options
- Weight roles by importance (starring roles > cameos, showrunner > single episode director)
- Compartmentalize functionality for improved readability and maintainability
- Include thumbnails for projects and people
- Implement search with autosuggestions, ranked by popularity + recency

## Technical Decisions
- Frontend: React with JavaScript (ES6+)
- Styling: Tailwind CSS
- API Security: AWS Lambda proxy in production, local server during development
- Testing: Playwright for end-to-end testing throughout development
- Documentation: Extensive JSDoc comments and dedicated documentation files
- State Management: React Context API (unless complexity requires Redux)
- Build Tool: Vite for faster development experience

## Development Approach
- Documentation-first development
- Test-driven development with Playwright
- Phased implementation with testing integrated throughout
- Caching implementation after core functionality
- Git commits after testing all functionality since last commit
