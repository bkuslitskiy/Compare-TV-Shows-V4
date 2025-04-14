# Compare TV Shows

A web application that compares the cast and crew of TV shows and movies, identifying shared members and ranking them by importance.

## Features

- Search for and select multiple TV shows/movies
- Identify shared cast and crew members
- Display roles in each selected project
- Rank shared members by their importance
- Filter results by role type
- Light and dark themes with system preference support
- Fully keyboard navigable
- Responsive design

## Screenshots

*Screenshots will be added once the UI is implemented*

## Tech Stack

- **Frontend**: React with JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **API**: TMDB API via secure proxy
- **State Management**: React Context API
- **Build Tool**: Vite
- **Testing**: Playwright
- **Deployment**: AWS (S3, CloudFront, Lambda)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- TMDB API key (get one at [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository:

```powershell
git clone https://github.com/yourusername/compare-tv-shows.git
cd compare-tv-shows
```

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file in the root directory with your TMDB API key:

```
VITE_TMDB_API_KEY=your_api_key_here
```

4. Start the development server:

```powershell
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
compare-tv-shows/
├── docs/                    # Project documentation
├── public/                  # Static assets
├── server/                  # Local development server
├── src/                     # Source code
│   ├── components/          # React components
│   ├── context/             # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Service layer
│   ├── styles/              # Global styles and Tailwind config
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main App component
│   ├── index.css            # Global CSS
│   └── main.jsx             # Application entry point
├── tests/                   # Playwright tests
└── ...                      # Configuration files
```

## Documentation

Detailed documentation is available in the `docs` directory:

- [Architecture](docs/architecture.md)
- [API Integration](docs/api.md)
- [Components](docs/components.md)
- [AWS Dependencies](docs/aws-dependencies.md)
- [Testing Strategy](docs/testing.md)

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production version
- `npm run preview` - Preview the production build locally
- `npm run test` - Run Playwright tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing

The application uses Playwright for testing. To run the tests:

```powershell
npm run test
```

For more information on testing, see the [Testing Strategy](docs/testing.md) documentation.

## Deployment

The application is deployed to AWS using the following services:

- **S3**: Static website hosting
- **CloudFront**: Content delivery and HTTPS support
- **Lambda**: Secure proxy for TMDB API
- **Route 53**: DNS management

For more information on AWS deployment, see the [AWS Dependencies](docs/aws-dependencies.md) documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the API
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [React](https://reactjs.org/) for the UI library
- [Vite](https://vitejs.dev/) for the build tool
- [Playwright](https://playwright.dev/) for testing
