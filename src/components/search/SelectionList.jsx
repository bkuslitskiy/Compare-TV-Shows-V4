import { useState } from 'react';
import { getImageUrl, getMediaName, getMediaType, getReleaseYear } from '../../utils/tmdbHelpers';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

/**
 * SelectionList component for displaying selected TV shows and movies
 * @param {Object} props - Component props
 * @param {Array} props.selections - Array of selected items
 * @param {Function} props.onRemove - Function to call when an item is removed
 * @returns {JSX.Element} SelectionList component
 */
function SelectionList({ selections = [], onRemove }) {
  // Keyboard navigation for selection list
  const {
    focusedIndex,
    getContainerProps,
    getItemProps
  } = useKeyboardNavigation({
    items: selections,
    onSelect: (item) => {
      if (onRemove) {
        onRemove(item);
      }
    },
    vertical: false,
    loop: true
  });
  if (selections.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          Select TV shows or movies to compare.
        </p>
      </div>
    );
  }
  
  return (
    <div 
      className="selection-grid" 
      {...getContainerProps()}
      aria-label="Selected TV shows and movies"
    >
      {selections.map((item, index) => (
        <div 
          key={`${item.media_type}-${item.id}`}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 ${
            focusedIndex === index ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
          }`}
          {...getItemProps(index)}
        >
          <div className="thumbnail-container">
            <img
              src={getImageUrl(item.poster_path, 'w342')}
              alt={getMediaName(item)}
              className="w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.png';
              }}
            />
            <button
              onClick={() => onRemove && onRemove(item)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={`Remove ${getMediaName(item)}`}
              tabIndex="-1" // Remove from tab order since the container is focusable
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-3">
            <h3 className="font-bold text-base mb-1 truncate">{getMediaName(item)}</h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="capitalize">{getMediaType(item)}</span>
              {getReleaseYear(item) && (
                <span className="ml-2">({getReleaseYear(item)})</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SelectionList;
