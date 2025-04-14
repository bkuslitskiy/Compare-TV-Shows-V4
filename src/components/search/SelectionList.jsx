import { getImageUrl, getMediaName, getMediaType, getReleaseYear } from '../../utils/tmdbHelpers';

/**
 * SelectionList component for displaying selected TV shows and movies
 * @param {Object} props - Component props
 * @param {Array} props.selections - Array of selected items
 * @param {Function} props.onRemove - Function to call when an item is removed
 * @returns {JSX.Element} SelectionList component
 */
function SelectionList({ selections = [], onRemove }) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {selections.map((item) => (
        <div 
          key={`${item.media_type}-${item.id}`}
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="relative pb-[150%]">
            <img
              src={getImageUrl(item.poster_path)}
              alt={getMediaName(item)}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
              }}
            />
            <button
              onClick={() => onRemove && onRemove(item)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={`Remove ${getMediaName(item)}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1 truncate">{getMediaName(item)}</h3>
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
