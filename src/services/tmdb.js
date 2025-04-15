import { get } from './api';

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the specified time
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise resolving to the function result
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed, retrying...`, error.message);
      lastError = error;
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, i) * (0.5 + Math.random() * 0.5);
      await sleep(delay);
    }
  }
  
  throw lastError;
};


/**
 * Search for movies, TV shows, and people
 * @param {string} query - Search query
 * @param {number} page - Page number (default: 1)
 * @returns {Promise} Promise resolving to search results
 */
export const searchMulti = async (query, page = 1) => {
  try {
    const result = await get('/search/multi', { query, page, include_adult: false });
    return result || { results: [] };
  } catch (error) {
    console.error('Search error:', error);
    // Return empty results instead of throwing
    return { results: [] };
  }
};

/**
 * Get TV show details
 * @param {number} id - TV show ID
 * @returns {Promise} Promise resolving to TV show details
 */
export const getShowDetails = async (id) => {
  return get(`/tv/${id}`);
};

/**
 * Get movie details
 * @param {number} id - Movie ID
 * @returns {Promise} Promise resolving to movie details
 */
export const getMovieDetails = async (id) => {
  return get(`/movie/${id}`);
};

/**
 * Get all seasons for a TV show
 * @param {number} id - TV show ID
 * @returns {Promise} Promise resolving to array of seasons
 */
export const getShowSeasons = async (id) => {
  const show = await getShowDetails(id);
  return show.seasons;
};

/**
 * Get all episodes for a season
 * @param {number} showId - TV show ID
 * @param {number} seasonNumber - Season number
 * @returns {Promise} Promise resolving to season details with episodes
 */
export const getSeasonEpisodes = async (showId, seasonNumber) => {
  return get(`/tv/${showId}/season/${seasonNumber}`);
};

/**
 * Get credits for an episode
 * @param {number} showId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 * @returns {Promise} Promise resolving to episode credits
 */
export const getEpisodeCredits = async (showId, seasonNumber, episodeNumber) => {
  return get(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}/credits`);
};

/**
 * Get credits for a movie
 * @param {number} id - Movie ID
 * @returns {Promise} Promise resolving to movie credits
 */
export const getMovieCredits = async (id) => {
  return get(`/movie/${id}/credits`);
};

/**
 * Get aggregated credits for a TV show
 * @param {number} id - TV show ID
 * @returns {Promise} Promise resolving to aggregated credits
 */
export const getShowAggregatedCredits = async (id) => {
  return get(`/tv/${id}/aggregate_credits`);
};


/**
 * Get all credits for a TV show (across all episodes)
 * @param {number} id - TV show ID
 * @returns {Promise} Promise resolving to aggregated credits
 */
export const getShowAllCredits = async (id) => {
  try {
    // First try to get aggregated credits (more efficient)
    try {
      const aggregatedCredits = await getShowAggregatedCredits(id);
      const show = await getShowDetails(id);
      
      // Process aggregated cast
      const processedCast = aggregatedCredits.cast.map(castMember => ({
        ...castMember,
        episodeCount: castMember.total_episode_count,
        media: {
          id: show.id,
          name: show.name,
          type: 'tv',
          first_air_date: show.first_air_date,
          last_air_date: show.last_air_date
        }
      }));
      
      // Process aggregated crew
      const processedCrew = aggregatedCredits.crew.map(crewMember => ({
        ...crewMember,
        episodeCount: crewMember.total_episode_count,
        media: {
          id: show.id,
          name: show.name,
          type: 'tv',
          first_air_date: show.first_air_date,
          last_air_date: show.last_air_date
        }
      }));
      
      return {
        id: show.id,
        name: show.name,
        type: 'tv',
        first_air_date: show.first_air_date,
        last_air_date: show.last_air_date,
        cast: processedCast,
        crew: processedCrew
      };
    } catch (error) {
      console.warn('Aggregated credits not available, falling back to episode-by-episode collection');
      // Fall back to episode-by-episode collection
    }
    
    // Get show details
    const show = await getShowDetails(id);
    
    // Initialize credits arrays
    const allCast = new Map();
    const allCrew = new Map();
    
    // Process each season
    for (const season of show.seasons) {
      // Skip special seasons (season 0)
      if (season.season_number === 0) continue;
      
      // Get season details with episodes
      const seasonDetails = await retryWithBackoff(() => 
        getSeasonEpisodes(id, season.season_number)
      );
      
      // Process each episode with rate limiting
      for (const episode of seasonDetails.episodes) {
        // Get episode credits with retry logic
        const credits = await retryWithBackoff(() => 
          getEpisodeCredits(id, season.season_number, episode.episode_number)
        );
        
        // Process cast
        if (credits.cast) {
          for (const castMember of credits.cast) {
            const castId = castMember.id;
            
            if (allCast.has(castId)) {
              // Update existing cast member
              const existingCast = allCast.get(castId);
              if (!existingCast.episodes.includes(episode.id)) {
                existingCast.episodes.push(episode.id);
                existingCast.episodeCount++;
              }
            } else {
              // Add new cast member
              allCast.set(castId, {
                ...castMember,
                episodes: [episode.id],
                episodeCount: 1,
                media: {
                  id: show.id,
                  name: show.name,
                  type: 'tv',
                  first_air_date: show.first_air_date,
                  last_air_date: show.last_air_date
                }
              });
            }
          }
        }
        
        // Process crew
        if (credits.crew) {
          for (const crewMember of credits.crew) {
            // Create a unique key for crew member + job
            const crewKey = `${crewMember.id}-${crewMember.job}`;
            
            if (allCrew.has(crewKey)) {
              // Update existing crew member
              const existingCrew = allCrew.get(crewKey);
              if (!existingCrew.episodes.includes(episode.id)) {
                existingCrew.episodes.push(episode.id);
                existingCrew.episodeCount++;
              }
            } else {
              // Add new crew member
              allCrew.set(crewKey, {
                ...crewMember,
                episodes: [episode.id],
                episodeCount: 1,
                media: {
                  id: show.id,
                  name: show.name,
                  type: 'tv',
                  first_air_date: show.first_air_date,
                  last_air_date: show.last_air_date
                }
              });
            }
          }
        }
        
        // Add a small delay between episode requests to avoid rate limiting
        await sleep(300);
      }
    }
    
    return {
      id: show.id,
      name: show.name,
      type: 'tv',
      first_air_date: show.first_air_date,
      last_air_date: show.last_air_date,
      cast: Array.from(allCast.values()),
      crew: Array.from(allCrew.values())
    };
  } catch (error) {
    console.error(`Error getting all credits for TV show ${id}:`, error);
    throw error;
  }
};

/**
 * Get complete details for a movie with credits
 * @param {number} id - Movie ID
 * @returns {Promise} Promise resolving to movie details with credits
 */
export const getMovieWithCredits = async (id) => {
  try {
    // Get movie details and credits in parallel
    const [movie, credits] = await Promise.all([
      getMovieDetails(id),
      getMovieCredits(id)
    ]);
    
    // Add media info to each cast and crew member
    const castWithMedia = credits.cast.map(castMember => ({
      ...castMember,
      media: {
        id: movie.id,
        title: movie.title,
        type: 'movie',
        release_date: movie.release_date
      }
    }));
    
    const crewWithMedia = credits.crew.map(crewMember => ({
      ...crewMember,
      media: {
        id: movie.id,
        title: movie.title,
        type: 'movie',
        release_date: movie.release_date
      }
    }));
    
    return {
      ...movie,
      type: 'movie',
      cast: castWithMedia,
      crew: crewWithMedia
    };
  } catch (error) {
    console.error(`Error getting movie with credits ${id}:`, error);
    throw error;
  }
};

export default {
  searchMulti,
  getShowDetails,
  getMovieDetails,
  getShowSeasons,
  getSeasonEpisodes,
  getEpisodeCredits,
  getMovieCredits,
  getShowAggregatedCredits,
  getShowAllCredits,
  getMovieWithCredits
};
