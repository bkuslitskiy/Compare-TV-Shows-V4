/**
 * Cache service for storing API responses in localStorage
 * This service provides methods for storing, retrieving, and managing cached data
 */

// Default TTL (time to live) for cache items in milliseconds (1 hour)
const DEFAULT_TTL = 3600000;

// Cache prefix to avoid collisions with other localStorage items
const CACHE_PREFIX = 'tv_compare_cache_';

/**
 * Set a cache item with optional TTL
 * @param {string} key - The cache key
 * @param {any} data - The data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 1 hour)
 */
export const set = (key, data, ttl = DEFAULT_TTL) => {
  try {
    const item = {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
    
    // Update cache stats
    updateCacheStats('set');
    
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Get a cache item
 * @param {string} key - The cache key
 * @returns {any|null} The cached data or null if not found or expired
 */
export const get = (key) => {
  try {
    const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!item) {
      updateCacheStats('miss');
      return null;
    }
    
    const { data, expiry } = JSON.parse(item);
    
    // Check if the item has expired
    if (Date.now() > expiry) {
      // Remove expired item
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      updateCacheStats('expired');
      return null;
    }
    
    updateCacheStats('hit');
    return data;
  } catch (error) {
    console.error('Cache get error:', error);
    updateCacheStats('error');
    return null;
  }
};

/**
 * Remove a cache item
 * @param {string} key - The cache key
 */
export const remove = (key) => {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('Cache remove error:', error);
    return false;
  }
};

/**
 * Clear all cache items
 */
export const clear = () => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter keys that start with the cache prefix
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    // Remove all cache items
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    // Reset cache stats
    resetCacheStats();
    
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

/**
 * Get all cache keys
 * @returns {string[]} Array of cache keys without the prefix
 */
export const getKeys = () => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter keys that start with the cache prefix and remove the prefix
    return keys
      .filter(key => key.startsWith(CACHE_PREFIX))
      .map(key => key.slice(CACHE_PREFIX.length));
  } catch (error) {
    console.error('Cache getKeys error:', error);
    return [];
  }
};

/**
 * Get cache stats
 * @returns {Object} Cache statistics
 */
export const getStats = () => {
  try {
    const statsJson = localStorage.getItem(`${CACHE_PREFIX}stats`);
    
    if (!statsJson) {
      const initialStats = {
        hits: 0,
        misses: 0,
        sets: 0,
        expired: 0,
        errors: 0,
        lastReset: Date.now()
      };
      
      localStorage.setItem(`${CACHE_PREFIX}stats`, JSON.stringify(initialStats));
      return initialStats;
    }
    
    return JSON.parse(statsJson);
  } catch (error) {
    console.error('Cache getStats error:', error);
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      expired: 0,
      errors: 0,
      lastReset: Date.now()
    };
  }
};

/**
 * Update cache stats
 * @param {string} type - The type of operation ('hit', 'miss', 'set', 'expired', 'error')
 */
const updateCacheStats = (type) => {
  try {
    const stats = getStats();
    
    switch (type) {
      case 'hit':
        stats.hits++;
        break;
      case 'miss':
        stats.misses++;
        break;
      case 'set':
        stats.sets++;
        break;
      case 'expired':
        stats.expired++;
        break;
      case 'error':
        stats.errors++;
        break;
      default:
        break;
    }
    
    localStorage.setItem(`${CACHE_PREFIX}stats`, JSON.stringify(stats));
  } catch (error) {
    console.error('Cache updateStats error:', error);
  }
};

/**
 * Reset cache stats
 */
const resetCacheStats = () => {
  try {
    const initialStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      expired: 0,
      errors: 0,
      lastReset: Date.now()
    };
    
    localStorage.setItem(`${CACHE_PREFIX}stats`, JSON.stringify(initialStats));
  } catch (error) {
    console.error('Cache resetStats error:', error);
  }
};

/**
 * Get the total size of the cache in bytes
 * @returns {number} Size in bytes
 */
export const getSize = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let totalSize = 0;
    
    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      totalSize += item.length * 2; // Each character is 2 bytes in UTF-16
    });
    
    return totalSize;
  } catch (error) {
    console.error('Cache getSize error:', error);
    return 0;
  }
};

/**
 * Get cache item metadata without the actual data
 * @param {string} key - The cache key
 * @returns {Object|null} Metadata object or null if not found
 */
export const getMetadata = (key) => {
  try {
    const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!item) {
      return null;
    }
    
    const { expiry, timestamp } = JSON.parse(item);
    
    return {
      key,
      expiry,
      timestamp,
      ttl: expiry - timestamp,
      remainingTtl: expiry - Date.now(),
      isExpired: Date.now() > expiry,
      size: item.length * 2 // Each character is 2 bytes in UTF-16
    };
  } catch (error) {
    console.error('Cache getMetadata error:', error);
    return null;
  }
};

// Export all functions as a cache service object
const cacheService = {
  set,
  get,
  remove,
  clear,
  getKeys,
  getStats,
  getSize,
  getMetadata
};

export default cacheService;
