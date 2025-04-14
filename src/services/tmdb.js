import { get } from './api';

/**
 * Search for movies, TV shows, and people
 * @param {string} query - Search query
 * @param {number} page - Page number (default: 1)
 * @returns {Promise} Promise resolving to search results
 */
export const searchMulti = async (query, page = 1) => {
  return get('/search/multi', { query, page, include_adult: false });
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
 * Get all credits for a TV show (across all episodes)
 * @param {number} id - TV show ID
 * @returns {Promise} Promise resolving to aggregated credits
 */
export const getShowAllCredits = async (id) => {
  try {
    // Get show details
    const show = await getShowDetails(id);
    
    // Initialize credits arrays
    const allCast = [];
    const allCrew = [];
    
    // Process each season
    for (const season of show.seasons) {
      // Skip special seasons (season 0)
      if (season.season_number === 0) continue;
      
      // Get season details with episodes
      const seasonDetails = await getSeasonEpisodes(id, season.season_number);
      
      // Process each episode
      for (const episode of seasonDetails.episodes) {
        // Get episode credits
        const credits = await getEpisodeCredits(id, season.season_number, episode.episode_number);
        
        // Process cast
        if (credits.cast) {
          for (const castMember of credits.cast) {
            // Check if this cast member is already in our list
            const existingCast = allCast.find(c => c.id === castMember.id);
            
            if (existingCast) {
              // Update existing cast member
              if (!existingCast.episodes.includes(episode.id)) {
                existingCast.episodes.push(episode.id);
                existingCast.episodeCount++;
              }
            } else {
              // Add new cast member
              allCast.push({
                ...castMember,
                episodes: [episode.id],
                episodeCount: 1,
                media: {
                  id: show.id,
                  name: show.name,
                  type: 'tv'
                }
              });
            }
          }
        }
        
        // Process crew
        if (credits.crew) {
          for (const crewMember of credits.crew) {
            // Check if this crew member is already in our list with the same job
            const existingCrew = allCrew.find(c => 
              c.id === crewMember.id && c.job === crewMember.job
            );
            
            if (existingCrew) {
              // Update existing crew member
              if (!existingCrew.episodes.includes(episode.id)) {
                existingCrew.episodes.push(episode.id);
                existingCrew.episodeCount++;
              }
            } else {
              // Add new crew member
              allCrew.push({
                ...crewMember,
                episodes: [episode.id],
                episodeCount: 1,
                media: {
                  id: show.id,
                  name: show.name,
                  type: 'tv'
                }
              });
            }
          }
        }
      }
    }
    
    return {
      id: show.id,
      name: show.name,
      type: 'tv',
      cast: allCast,
      crew: allCrew
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
        type: 'movie'
      }
    }));
    
    const crewWithMedia = credits.crew.map(crewMember => ({
      ...crewMember,
      media: {
        id: movie.id,
        title: movie.title,
        type: 'movie'
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
  getShowAllCredits,
  getMovieWithCredits
};
