import { useState, useEffect, useRef, useMemo } from 'react';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { searchMulti } from '../../services/cachedApi';
import { getImageUrl, getMediaType, getMediaName, getReleaseYear } from '../../utils/tmdbHelpers';
import { useSelection } from '../../context/SelectionContext';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 0,
    total_results: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const searchRef = useRef(null);
  const { selections } = useSelection();
  
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
  
  // Effect to search when query or page changes
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          console.log('Searching for:', query, 'Page:', currentPage);
          const data = await searchMulti(query, currentPage);
          console.log('Search results:', data);
          
          // Filter to only include movies and TV shows
          const filteredResults = (data.results || []).filter(
            item => item.media_type === 'movie' || item.media_type === 'tv'
          );
          console.log('Filtered results:', filteredResults);
          
          setResults(filteredResults);
          setPagination({
            page: data.page || currentPage,
            total_pages: data.total_pages || 0,
            total_results: data.total_results || 0,
            hasNextPage: data.hasNextPage || false,
            hasPrevPage: data.hasPrevPage || false
          });
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
          setPagination({
            page: currentPage,
            total_pages: 0,
            total_results: 0,
            hasNextPage: false,
            hasPrevPage: currentPage > 1
          });
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
        setPagination({
          page: 1,
          total_pages: 0,
          total_results: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    }, 500);
    
    return () => clearTimeout(searchTimeout);
  }, [query, currentPage]);
  
  // Check if an item is already selected
  const isAlreadySelected = (item) => {
    return selections.some(
      selection => selection.id === item.id && selection.media_type === item.media_type
    );
  };
  
  // Sort and filter results
  const sortedResults = useMemo(() => {
    if (!results.length) return [];
    
    // Filter out already selected items
    const filteredResults = results.filter(item => !isAlreadySelected(item));
    
    // Sort results by relevance
    return filteredResults.sort((a, b) => {
      const aName = getMediaName(a).toLowerCase();
      const bName = getMediaName(b).toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Exact title match gets highest priority
      if (aName === queryLower && bName !== queryLower) return -1;
      if (aName !== queryLower && bName === queryLower) return 1;
      
      // Then starts with query
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
      if (!aName.startsWith(queryLower) && bName.startsWith(queryLower)) return 1;
      
      // Then contains query as a word
      const aContainsWord = new RegExp(`\\b${queryLower}\\b`).test(aName);
      const bContainsWord = new RegExp(`\\b${queryLower}\\b`).test(bName);
      if (aContainsWord && !bContainsWord) return -1;
      if (!aContainsWord && bContainsWord) return 1;
      
      // Then contains query anywhere
      if (aName.includes(queryLower) && !bName.includes(queryLower)) return -1;
      if (!aName.includes(queryLower) && bName.includes(queryLower)) return 1;
      
      // Finally by popularity
      return b.popularity - a.popularity;
    });
  }, [results, query, selections]);
  
  // Keyboard navigation for search results
  const {
    focusedIndex,
    getContainerProps,
    getItemProps
  } = useKeyboardNavigation({
    items: sortedResults,
    onSelect: (item) => {
      if (onSelect) {
        onSelect(item);
      }
      setQuery('');
      setShowResults(false);
    },
    onEscape: () => setShowResults(false),
    vertical: true,
    loop: true
  });
  
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
      
      {showResults && sortedResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <ul className="py-1" {...getContainerProps()}>
            {sortedResults.map((item, index) => {
              const itemName = getMediaName(item).toLowerCase();
              const isExactMatch = itemName === query.toLowerCase();
              const startsWithQuery = itemName.startsWith(query.toLowerCase());
              
              return (
                <li key={`${item.media_type}-${item.id}`}>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center ${
                    isExactMatch ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${focusedIndex === index ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                  {...getItemProps(index)}
                  >
                    <div className="flex-shrink-0 w-12 h-16 mr-3">
                      <img
                        src={getImageUrl(item.poster_path, 'w92')}
                        alt={getMediaName(item)}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium flex items-center">
                        {getMediaName(item)}
                        {isExactMatch && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                            Exact match
                          </span>
                        )}
                        {!isExactMatch && startsWithQuery && (
                          <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">
                            Close match
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <span className="capitalize">{getMediaType(item)}</span>
                        {getReleaseYear(item) && (
                          <span className="ml-2">({getReleaseYear(item)})</span>
                        )}
                        {item.popularity && (
                          <span className="ml-2 text-xs">
                            Popularity: {Math.round(item.popularity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          
          {/* Pagination controls */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.total_pages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className={`px-2 py-1 text-sm rounded ${
                    pagination.hasPrevPage
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-2 py-1 text-sm rounded ${
                    pagination.hasNextPage
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {showResults && query.trim().length >= 2 && sortedResults.length === 0 && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center">
          {results.length > 0 ? (
            <p>All matching results have already been selected</p>
          ) : (
            <p>No results found for "{query}"</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
