# API Integration Documentation

## Overview

This document details the integration with The Movie Database (TMDB) API for the Compare TV Shows application. It covers the API endpoints used, data models, authentication, rate limiting, and implementation details.

## TMDB API

### Authentication

The TMDB API requires an API key for authentication. This key must be kept secure and not exposed in frontend code.

- **API Key**: `330b765d5cdf65fe2ab30dd670eab968` (This will be stored securely in environment variables)
- **Base URL**: `https://api.themoviedb.org/3`
- **Documentation**: [TMDB API Documentation](https://developers.themoviedb.org/3)

### Security Implementation

To secure the API key:

1. In development:
   - Local Express server acts as a proxy
   - API key stored in environment variables
   - Requests from frontend go to local server, which adds the API key before forwarding to TMDB

2. In production:
   - AWS Lambda function acts as a proxy
   - API key stored in Lambda environment variables
   - Requests from frontend go to Lambda, which adds the API key before forwarding to TMDB

## API Endpoints

### Search

#### Search for Movies, TV Shows, and People

```
GET /search/multi
```

**Parameters:**
- `query` (string, required): The search query
- `page` (integer, optional): Page number for results (default: 1)
- `include_adult` (boolean, optional): Include adult content (default: false)

**Response:**
```json
{
  "page": 1,
  "results": [
    {
      "id": 1396,
      "name": "Breaking Bad",
      "media_type": "tv",
      "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      "backdrop_path": "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      "overview": "...",
      "first_air_date": "2008-01-20"
    },
    {
      "id": 299536,
      "title": "Avengers: Infinity War",
      "media_type": "movie",
      "poster_path": "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      "backdrop_path": "/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg",
      "overview": "...",
      "release_date": "2018-04-25"
    }
  ],
  "total_results": 100,
  "total_pages": 5
}
```

### TV Shows

#### Get TV Show Details

```
GET /tv/{id}
```

**Parameters:**
- `id` (integer, required): The ID of the TV show

**Response:**
```json
{
  "id": 1396,
  "name": "Breaking Bad",
  "number_of_seasons": 5,
  "number_of_episodes": 62,
  "seasons": [
    {
      "id": 3577,
      "name": "Season 1",
      "season_number": 1,
      "episode_count": 7
    },
    ...
  ],
  "created_by": [
    {
      "id": 66633,
      "name": "Vince Gilligan"
    }
  ],
  "genres": [
    {
      "id": 18,
      "name": "Drama"
    }
  ],
  "overview": "...",
  "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  "backdrop_path": "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
  "first_air_date": "2008-01-20",
  "last_air_date": "2013-09-29"
}
```

#### Get Season Details

```
GET /tv/{id}/season/{season_number}
```

**Parameters:**
- `id` (integer, required): The ID of the TV show
- `season_number` (integer, required): The season number

**Response:**
```json
{
  "id": 3577,
  "name": "Season 1",
  "season_number": 1,
  "episodes": [
    {
      "id": 62085,
      "name": "Pilot",
      "episode_number": 1,
      "air_date": "2008-01-20"
    },
    ...
  ]
}
```

#### Get Episode Details

```
GET /tv/{id}/season/{season_number}/episode/{episode_number}
```

**Parameters:**
- `id` (integer, required): The ID of the TV show
- `season_number` (integer, required): The season number
- `episode_number` (integer, required): The episode number

**Response:**
```json
{
  "id": 62085,
  "name": "Pilot",
  "episode_number": 1,
  "season_number": 1,
  "air_date": "2008-01-20",
  "crew": [
    {
      "id": 66633,
      "name": "Vince Gilligan",
      "job": "Director"
    },
    {
      "id": 66633,
      "name": "Vince Gilligan",
      "job": "Writer"
    }
  ],
  "guest_stars": [
    {
      "id": 92495,
      "name": "John Koyama",
      "character": "Emilio Koyama"
    }
  ]
}
```

#### Get Episode Credits

```
GET /tv/{id}/season/{season_number}/episode/{episode_number}/credits
```

**Parameters:**
- `id` (integer, required): The ID of the TV show
- `season_number` (integer, required): The season number
- `episode_number` (integer, required): The episode number

**Response:**
```json
{
  "cast": [
    {
      "id": 17419,
      "name": "Bryan Cranston",
      "character": "Walter White",
      "order": 0
    },
    ...
  ],
  "crew": [
    {
      "id": 66633,
      "name": "Vince Gilligan",
      "job": "Director",
      "department": "Directing"
    },
    ...
  ],
  "guest_stars": [
    {
      "id": 92495,
      "name": "John Koyama",
      "character": "Emilio Koyama"
    },
    ...
  ]
}
```

### Movies

#### Get Movie Details

```
GET /movie/{id}
```

**Parameters:**
- `id` (integer, required): The ID of the movie

**Response:**
```json
{
  "id": 299536,
  "title": "Avengers: Infinity War",
  "overview": "...",
  "release_date": "2018-04-25",
  "runtime": 149,
  "genres": [
    {
      "id": 28,
      "name": "Action"
    },
    ...
  ],
  "poster_path": "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
  "backdrop_path": "/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg"
}
```

#### Get Movie Credits

```
GET /movie/{id}/credits
```

**Parameters:**
- `id` (integer, required): The ID of the movie

**Response:**
```json
{
  "id": 299536,
  "cast": [
    {
      "id": 3223,
      "name": "Robert Downey Jr.",
      "character": "Tony Stark / Iron Man",
      "order": 0
    },
    ...
  ],
  "crew": [
    {
      "id": 7232,
      "name": "Anthony Russo",
      "job": "Director",
      "department": "Directing"
    },
    ...
  ]
}
```

### People

#### Get Person Details

```
GET /person/{id}
```

**Parameters:**
- `id` (integer, required): The ID of the person

**Response:**
```json
{
  "id": 3223,
  "name": "Robert Downey Jr.",
  "profile_path": "/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg",
  "birthday": "1965-04-04",
  "biography": "...",
  "place_of_birth": "Manhattan, New York City, New York, USA",
  "known_for_department": "Acting"
}
```

## Implementation Details

### API Client

The application uses Axios to make HTTP requests to the TMDB API. The API client is implemented in `src/services/api.js` and provides a base for all API requests.

```javascript
import axios from 'axios';

// Create API client
const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
  });
  
  return client;
};

// Local development API client
const localApiClient = createApiClient('/api');

export const get = async (url, params = {}) => {
  try {
    const response = await localApiClient.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const post = async (url, data = {}) => {
  try {
    const response = await localApiClient.post(url, data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### TMDB Service

The TMDB service is implemented in `src/services/tmdb.js` and provides specific methods for interacting with the TMDB API.

```javascript
import { get } from './api';

// Search for movies, TV shows, and people
export const searchMulti = async (query) => {
  return get('/search/multi', { query });
};

// Get TV show details
export const getShowDetails = async (id) => {
  return get(`/tv/${id}`);
};

// Get movie details
export const getMovieDetails = async (id) => {
  return get(`/movie/${id}`);
};

// Get all seasons for a TV show
export const getShowSeasons = async (id) => {
  const show = await getShowDetails(id);
  return show.seasons;
};

// Get all episodes for a season
export const getSeasonEpisodes = async (showId, seasonNumber) => {
  return get(`/tv/${showId}/season/${seasonNumber}`);
};

// Get credits for an episode
export const getEpisodeCredits = async (showId, seasonNumber, episodeNumber) => {
  return get(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}/credits`);
};

// Get credits for a movie
export const getMovieCredits = async (id) => {
  return get(`/movie/${id}/credits`);
};
```

## Rate Limiting and Error Handling

### Rate Limiting

TMDB API has rate limits of 3-4 requests per second. To handle this:

1. Implement request throttling in the API service
2. Add exponential backoff for failed requests
3. Batch requests where possible

```javascript
// Example of request throttling
const queue = [];
let processing = false;

const processQueue = async () => {
  if (processing || queue.length === 0) return;
  
  processing = true;
  const { request, resolve, reject } = queue.shift();
  
  try {
    const result = await request();
    resolve(result);
  } catch (error) {
    reject(error);
  }
  
  processing = false;
  setTimeout(processQueue, 250); // Limit to 4 requests per second
};

export const throttledRequest = (requestFn) => {
  return new Promise((resolve, reject) => {
    queue.push({ request: requestFn, resolve, reject });
    processQueue();
  });
};
```

### Error Handling

Implement robust error handling for API requests:

1. Handle network errors
2. Handle rate limiting errors (HTTP 429)
3. Handle authentication errors (HTTP 401)
4. Handle not found errors (HTTP 404)

```javascript
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    switch (error.response.status) {
      case 401:
        console.error('Authentication error: Invalid API key');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 429:
        console.error('Rate limit exceeded');
        // Implement exponential backoff
        break;
      default:
        console.error(`API error: ${error.response.status}`);
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Network error: No response received');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error:', error.message);
  }
  
  throw error;
};
```

## Local Development Server

The local development server is implemented using Express.js and serves as a proxy for TMDB API requests during development.

```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Proxy all requests to TMDB API
app.use('/api', async (req, res) => {
  try {
    const url = `${TMDB_BASE_URL}${req.url}`;
    const params = { ...req.query, api_key: TMDB_API_KEY };
    
    const response = await axios.get(url, { params });
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

app.listen(port, () => {
  console.log(`API proxy server running on port ${port}`);
});
