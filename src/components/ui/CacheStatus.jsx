import { useState, useEffect } from 'react';
import { getCacheStats, getCacheSize, clearCache } from '../../services/tmdb';

/**
 * Format bytes to a human-readable string
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format a timestamp to a human-readable string
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted string
 */
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Calculate cache hit rate
 * @param {Object} stats - Cache statistics
 * @returns {string} Hit rate percentage
 */
const calculateHitRate = (stats) => {
  const total = stats.hits + stats.misses;
  if (total === 0) return '0%';
  
  const hitRate = (stats.hits / total) * 100;
  return hitRate.toFixed(1) + '%';
};

/**
 * CacheStatus component displays cache statistics and provides a button to clear the cache
 * @returns {JSX.Element} CacheStatus component
 */
function CacheStatus() {
  const [stats, setStats] = useState(null);
  const [size, setSize] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  
  // Update cache stats and size
  useEffect(() => {
    const updateStats = () => {
      setStats(getCacheStats());
      setSize(getCacheSize());
    };
    
    updateStats();
    
    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    
    return () => clearInterval(interval);
  }, [lastUpdated]);
  
  // Handle clear cache button click
  const handleClearCache = () => {
    setIsClearing(true);
    
    setTimeout(() => {
      clearCache();
      setLastUpdated(Date.now());
      setIsClearing(false);
    }, 500);
  };
  
  if (!stats) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed view */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-lg flex items-center space-x-2"
          aria-label="Show cache status"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
          </svg>
          <span>Cache: {calculateHitRate(stats)}</span>
        </button>
      )}
      
      {/* Expanded view */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Cache Status</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close cache status"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Hit Rate:</span>
              <span className="font-medium">{calculateHitRate(stats)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cache Hits:</span>
              <span className="font-medium">{stats.hits}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cache Misses:</span>
              <span className="font-medium">{stats.misses}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cache Sets:</span>
              <span className="font-medium">{stats.sets}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Expired Items:</span>
              <span className="font-medium">{stats.expired}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Errors:</span>
              <span className="font-medium">{stats.errors}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cache Size:</span>
              <span className="font-medium">{formatBytes(size)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Reset:</span>
              <span className="font-medium">{formatTime(stats.lastReset)}</span>
            </div>
          </div>
          
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className={`w-full py-2 px-4 rounded-md ${
              isClearing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CacheStatus;
