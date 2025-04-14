import { useState, useEffect, useRef } from 'react';
import { searchMulti } from '../../services/tmdb';
import { getImageUrl, getMediaType, getMediaName, getReleaseYear } from '../../utils/tmdbHelpers';

/**
 * SearchBar component for searching TV shows and movies
 * @param {Object} props - Component props
 * @param {Function} props.onSelect - Function to call when an item is selected
 * @returns {JSX.Element} SearchBar component
 */
function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  
  // Effect to handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Effect to search when query changes
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const data = await searchMulti(query);
          // Filter to only include movies and TV shows
          const filteredResults = data.results.filter(
            item => item.media_type === 'movie' || item.media_type === 'tv'
          );
          setResults(filteredResults);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);
    
    return () => clearTimeout(searchTimeout);
  }, [query]);
  
  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    setQuery('');
    setShowResults(false);
  };
  
  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for TV shows or movies..."
          className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          aria-label="Search for TV shows or movies"
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 dark:border-blue-400"></div>
          </div>
        )}
      </div>
      
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <ul className="py-1">
            {results.map((item) => (
              <li key={`${item.media_type}-${item.id}`}>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex-shrink-0 w-12 h-16 mr-3">
                    <img
                      src={getImageUrl(item.poster_path, 'w92')}
                      alt={getMediaName(item)}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/92x138?text=No+Image';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium">{getMediaName(item)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="capitalize">{getMediaType(item)}</span>
                      {getReleaseYear(item) && (
                        <span className="ml-2">({getReleaseYear(item)})</span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showResults && query.trim().length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}

export default SearchBar;
