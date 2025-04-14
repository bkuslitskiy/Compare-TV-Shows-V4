/**
 * Constructs an image URL from a TMDB path
 * @param {string} path - Image path from TMDB
 * @param {string} size - Size of the image (w92, w154, w185, w342, w500, w780, original)
 * @returns {string} Complete image URL
 */
export const getImageUrl = (path, size = 'w500') => {
  if (!path) {
    // Use placeholder.com for missing images
    return 'https://via.placeholder.com/500x750?text=No+Image';
  }
  
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Formats a release date
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
export const formatReleaseDate = (date) => {
  if (!date) return '';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

/**
 * Determines the media type (movie, TV, person)
 * @param {Object} item - Item from TMDB API
 * @returns {string} Media type
 */
export const getMediaType = (item) => {
  if (item.media_type) {
    return item.media_type;
  }
  
  if (item.title && item.release_date) {
    return 'movie';
  }
  
  if (item.name && item.first_air_date) {
    return 'tv';
  }
  
  if (item.profile_path) {
    return 'person';
  }
  
  return 'unknown';
};

/**
 * Gets a display name for a media item
 * @param {Object} item - Item from TMDB API
 * @returns {string} Display name
 */
export const getMediaName = (item) => {
  const mediaType = getMediaType(item);
  
  switch (mediaType) {
    case 'movie':
      return item.title;
    case 'tv':
      return item.name;
    case 'person':
      return item.name;
    default:
      return item.title || item.name || 'Unknown';
  }
};

/**
 * Gets a release year for a media item
 * @param {Object} item - Item from TMDB API
 * @returns {string} Release year
 */
export const getReleaseYear = (item) => {
  const mediaType = getMediaType(item);
  let dateString;
  
  switch (mediaType) {
    case 'movie':
      dateString = item.release_date;
      break;
    case 'tv':
      dateString = item.first_air_date;
      break;
    default:
      return '';
  }
  
  if (!dateString) return '';
  
  return new Date(dateString).getFullYear().toString();
};

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 150) => {
  if (!text) return '';
  
  if (text.length <= length) {
    return text;
  }
  
  return text.substring(0, length).trim() + '...';
};

export default {
  getImageUrl,
  formatReleaseDate,
  getMediaType,
  getMediaName,
  getReleaseYear,
  truncateText
};
