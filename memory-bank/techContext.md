# Technical Context

## Technologies Used

### Frontend
- **React**: JavaScript library for building user interfaces
- **JavaScript (ES6+)**: Modern JavaScript features
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Build tool and development server

### API Integration
- **Axios**: HTTP client for API requests
- **TMDB API**: External API for TV and movie data
- **Express.js**: For local development server/API proxy

### State Management
- **React Context API**: For global state management
- **useReducer**: For complex state logic

### Testing
- **Playwright**: End-to-end testing framework
- **React Testing Library**: Component testing

### Deployment
- **AWS S3**: Static website hosting
- **AWS CloudFront**: Content delivery network
- **AWS Lambda**: Serverless functions for API proxy
- **AWS Route 53**: DNS management
- **AWS Certificate Manager**: SSL certificate management

## Development Setup

### Local Environment
- Node.js (v18+)
- npm or yarn
- Git for version control
- VSCode (recommended editor)

### Project Initialization
```powershell
# Create project with Vite
npm create vite@latest compare-tv-shows -- --template react

# Install dependencies
cd compare-tv-shows
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional dependencies
npm install axios react-router-dom

# Install development dependencies
npm install -D @playwright/test eslint prettier
```

### Local Development Server
- Express.js server to proxy TMDB API requests
- Environment variables for API key storage
- Configured to run alongside Vite development server

## Technical Constraints

### TMDB API Limitations
- Rate limiting: 3-4 requests per second
- Request quota: Approximately 50,000 requests per day
- Authentication: API key required for all requests
- Data completeness: Some shows may have incomplete data

### Browser Compatibility
- Target modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support required
- Responsive design for desktop focus, with mobile support

### Performance Requirements
- Initial load under 3 seconds
- Smooth interactions (60fps)
- Efficient handling of large datasets

### Security Considerations
- API key must not be exposed in frontend code
- AWS Lambda proxy to secure API key
- HTTPS required for all communications
- Content Security Policy implementation

## Dependencies

### Core Dependencies
- react
- react-dom
- react-router-dom
- axios
- tailwindcss

### Development Dependencies
- vite
- @playwright/test
- eslint
- prettier
- express (for local development server)

## Tool Usage Patterns

### Vite
- Development server with hot module replacement
- Build optimization for production
- Environment variable handling

### Tailwind CSS
- Utility-first approach for styling
- Custom theme configuration for colors and accessibility
- Component-specific styles when needed

### Playwright
- End-to-end testing for critical user flows
- Visual regression testing
- Accessibility testing

### Express.js (Development Server)
- API proxy to secure TMDB API key
- Request/response logging for debugging
- Mock data for offline development

## API Integration

### TMDB API Endpoints
- `/search/multi`: Search for movies, TV shows, and people
- `/tv/{id}`: Get TV show details
- `/tv/{id}/season/{season_number}`: Get season details
- `/tv/{id}/season/{season_number}/episode/{episode_number}`: Get episode details
- `/movie/{id}`: Get movie details
- `/movie/{id}/credits`: Get movie credits
- `/person/{id}`: Get person details

### Data Models
- TV Show
- Movie
- Person
- Credit (cast or crew role)
- Season
- Episode

## Deployment Process

### Development
- Local development with Vite and Express proxy server
- Playwright tests for feature validation

### Staging
- Build with production configuration
- Deploy to staging environment
- Run full test suite

### Production
- Deploy static assets to S3
- Configure CloudFront distribution
- Deploy Lambda proxy function
- Update DNS settings in Route 53
