import axios from 'axios';

// Get the API base URL from environment variables or use a default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

/**
 * Create an API client with Axios
 * @param {string} baseURL - Base URL for API requests
 * @returns {Object} Axios instance
 */
const createApiClient = (baseURL = API_BASE_URL) => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor for logging
  client.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(`API Error ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        console.error('API Error: No response received');
      } else {
        console.error('API Error:', error.message);
      }
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Create the default API client
const apiClient = createApiClient();

/**
 * Make a GET request
 * @param {string} url - URL to request
 * @param {Object} params - Query parameters
 * @returns {Promise} Promise resolving to response data
 */
export const get = async (url, params = {}) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`GET ${url} Error:`, error);
    throw error;
  }
};

/**
 * Make a POST request
 * @param {string} url - URL to request
 * @param {Object} data - Request body
 * @returns {Promise} Promise resolving to response data
 */
export const post = async (url, data = {}) => {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    console.error(`POST ${url} Error:`, error);
    throw error;
  }
};

export default {
  get,
  post,
  createApiClient,
};
