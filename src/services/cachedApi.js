import { get } from './api';
import cacheService from './cache';

/**
 * Cache TTL values in milliseconds
 */
const CACHE_TTL = {
  SEARCH: 15 * 60 * 1000, // 15 minutes
  DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  CREDITS: 24 * 60 * 60 * 1000, // 24 hours
  SEASONS: 24 * 60 * 60 * 1000, // 24 hours
  EPISODES: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Get data from API with caching
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Promise} Promise resolving to API response
 */
export const getCached = async (endpoint, params = {}, ttl = CACHE_TTL.DETAILS) => {
  // Create a cache key from the endpoint and params
  const cacheKey = `${endpoint}${params ? '_' + JSON.stringify(params) : ''}`;
  
  // Try to get from cache first
  const cachedData = cacheService.get(cacheKey);
  
  if (cachedData) {
    console.log(`Cache hit for ${endpoint}`);
    return cachedData;
  }
  
  // If not in cache, fetch from API
  console.log(`Cache miss for ${endpoint}, fetching from API`);
  const data = await get(endpoint, params);
  
  // Store in cache
  cacheService.set(cacheKey, data, ttl);
  
  return data;
};

/**
 * Search for movies, TV shows, and people with caching
 * @param {string} query - Search query
 * @param {number} page - Page number (default: 1)
 * @returns {Promise} Promise resolving to search results
 */
export const searchMulti = async (query, page = 1) => {
  try {
    const result = await getCached('/search/multi', { query, page, include_adult: false }, CACHE_TTL.SEARCH);
    return {
      ...result,
      results: result?.results || [],
      page: result?.page || page,
      total_pages: result?.total_pages || 0,
      total_results: result?.total_results || 0,
      hasNextPage: result?.page < result?.total_pages,
      hasPrevPage: result?.page > 1
    };
  } catch (error) {
    console.error('Search error:', error);
    // Return empty results instead of throwing
    return { 
      results: [],
      page: page,
      total_pages: 0,
      total_results: 0,
      hasNextPage: false,
      hasPrevPage: page > 1
    };
  }
};

/**
 * Get TV show details with caching
 * @param {number} id - TV show ID
 * @returns {Promise} Promise resolving to TV show details
 */
export const getShowDetails = async (id) => {
  return getCached(`/tv/${id}`);
};

/**
 * Get movie details with caching
 * @param {number} id - Movie ID
 * @returns {Promise} Promise resolving to movie details
 */
export const getMovieDetails = async (id) => {
  return getCached(`/movie/${id}`);
};

/**
 * Get all seasons for a TV show with caching
 * @param {number} id - TV show ID
 * @returns {Promise} Promise resolving to array of seasons
 */
export const getShowSeasons = async (id) => {
  const show = await getShowDetails(id);
  return show.seasons;
};

/**
 * Get all episodes for a season with caching
 * @param {number} showId - TV show ID
 * @param {number} seasonNumber - Season number
 * @returns {Promise} Promise resolving to season details with episodes
 */
export const getSeasonEpisodes = async (showId, seasonNumber) => {
  return getCached(`/tv/${showId}/season/${seasonNumber}`, {}, CACHE_TTL.EPISODES);
};

/**
 * Get credits for an episode with caching
 * @param {number} showId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 * @returns {Promise} Promise resolving to episode credits
 */
export const getEpisodeCredits = async (showId, seasonNumber, episodeNumber) => {
  return getCached(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}/credits`, {}, CACHE_TTL.CREDITS);
};

/**
 * Get credits for a movie with caching
 * @param {number} id - Movie ID
 * @returns {Promise} Promise resolving to movie credits
 */
export const getMovieCredits = async (id) => {
  return getCached(`/movie/${id}/credits`, {}, CACHE_TTL.CREDITS);
};

/**
 * Get aggregated credits for a TV show with caching
 * @param {number} id - TV show ID
 * @returns {Promise} Promise resolving to aggregated credits
 */
export const getShowAggregatedCredits = async (id) => {
  return getCached(`/tv/${id}/aggregate_credits`, {}, CACHE_TTL.CREDITS);
};

/**
 * Clear all API cache
 * @returns {boolean} Success status
 */
export const clearCache = () => {
  return cacheService.clear();
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return cacheService.getStats();
};

/**
 * Get cache size in bytes
 * @returns {number} Cache size in bytes
 */
export const getCacheSize = () => {
  return cacheService.getSize();
};

export default {
  getCached,
  searchMulti,
  getShowDetails,
  getMovieDetails,
  getShowSeasons,
  getSeasonEpisodes,
  getEpisodeCredits,
  getMovieCredits,
  getShowAggregatedCredits,
  clearCache,
  getCacheStats,
  getCacheSize
};
