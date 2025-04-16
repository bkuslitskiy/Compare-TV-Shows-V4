import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Creates a middleware function that proxies requests to the TMDB API
 * @returns {Function} Express middleware function
 */
export function createProxyMiddleware() {
  return async (req, res) => {
    try {
      // Get API key from environment variables
      const apiKey = process.env.TMDB_API_KEY;
      
      console.log('API Key from env:', apiKey ? 'Present' : 'Missing');
      
      if (!apiKey) {
        return res.status(500).json({
          error: 'API key not configured',
          message: 'The TMDB API key is not configured in the server environment'
        });
      }
      
      // Build the URL for the TMDB API
      const url = `${TMDB_BASE_URL}${req.url}`;
      
      // Add the API key to the query parameters
      const params = { ...req.query, api_key: apiKey };
      
      console.log(`Proxying request to: ${url}`);
      console.log('With params:', JSON.stringify(params));
      
      try {
        // Make the request to the TMDB API
        console.log('Making request to TMDB API...');
        const response = await axios.get(url, { params });
        
        // Log success
        console.log(`TMDB API response success: ${url} - Status: ${response.status}`);
        
        // Return the response data
        res.json(response.data);
      } catch (error) {
        console.error(`TMDB API request failed: ${url}`);
        console.error('Error details:', error.message);
        
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data));
        }
        
        // Re-throw the error to be caught by the outer try/catch
        throw error;
      }
    } catch (error) {
      console.error('API Proxy Error:', error.message);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { status, data } = error.response;
        
        console.error(`TMDB API Error (${status}):`, JSON.stringify(data));
        
        return res.status(status).json({
          error: 'TMDB API Error',
          status,
          message: data.status_message || 'Error from TMDB API',
          code: data.status_code
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from TMDB API');
        
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'No response received from TMDB API'
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        return res.status(500).json({
          error: 'Internal Server Error',
          message: error.message
        });
      }
    }
  };
}

/**
 * Rate limiting middleware to prevent exceeding TMDB API rate limits
 * @returns {Function} Express middleware function
 */
export function rateLimitMiddleware() {
  const requestTimestamps = [];
  const MAX_REQUESTS_PER_SECOND = 3; // TMDB allows 3-4 requests per second
  
  return (req, res, next) => {
    const now = Date.now();
    
    // Remove timestamps older than 1 second
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 1000) {
      requestTimestamps.shift();
    }
    
    if (requestTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
      // Too many requests, delay this one
      const delay = 1000 - (now - requestTimestamps[0]);
      console.log(`Rate limiting: Delaying request by ${delay}ms`);
      
      setTimeout(() => {
        requestTimestamps.push(Date.now());
        next();
      }, delay);
    } else {
      // Add current timestamp and proceed
      requestTimestamps.push(now);
      next();
    }
  };
}
