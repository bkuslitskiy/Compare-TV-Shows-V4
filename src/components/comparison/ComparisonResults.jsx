import { useState } from 'react';
import { getImageUrl } from '../../utils/tmdbHelpers';

/**
 * ComparisonResults component for displaying shared cast and crew
 * @param {Object} props - Component props
 * @param {Array} props.sharedCast - Array of shared cast members
 * @param {Array} props.sharedCrew - Array of shared crew members
 * @param {Array} props.projects - Array of projects being compared
 * @returns {JSX.Element} ComparisonResults component
 */
function ComparisonResults({ sharedCast = [], sharedCrew = [], projects = [] }) {
  const [activeTab, setActiveTab] = useState('cast');
  const [filter, setFilter] = useState('all');
  
  // Filter shared people based on the active tab and filter
  const filteredPeople = activeTab === 'cast' ? sharedCast : sharedCrew;
  
  if (projects.length < 2) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 dark:text-gray-400">
          Please select at least 2 TV shows or movies to compare.
        </p>
      </div>
    );
  }
  
  if (filteredPeople.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Comparison Results</h2>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {projects.map((project) => (
            <div 
              key={`${project.media_type}-${project.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 w-32"
            >
              <img
                src={getImageUrl(project.poster_path, 'w185')}
                alt={project.title || project.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/185x278?text=No+Image';
                }}
              />
              <div className="p-2">
                <h3 className="font-bold text-sm truncate">{project.title || project.name}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            No shared {activeTab} members found between these projects.
          </p>
        </div>
        <div className="flex justify-center space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'cast'
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setActiveTab('cast')}
          >
            Cast
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'crew'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setActiveTab('crew')}
          >
            Crew
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Comparison Results</h2>
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {projects.map((project) => (
          <div 
            key={`${project.media_type}-${project.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 w-32"
          >
            <img
              src={getImageUrl(project.poster_path, 'w185')}
              alt={project.title || project.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/185x278?text=No+Image';
              }}
            />
            <div className="p-2">
              <h3 className="font-bold text-sm truncate">{project.title || project.name}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${
            activeTab === 'cast'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
          onClick={() => setActiveTab('cast')}
        >
          Cast ({sharedCast.length})
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            activeTab === 'crew'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
          onClick={() => setActiveTab('crew')}
        >
          Crew ({sharedCrew.length})
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map((person) => (
          <div
            key={person.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="flex p-4">
              <div className="flex-shrink-0 w-16 h-16 mr-4">
                <img
                  src={getImageUrl(person.profile_path, 'w185')}
                  alt={person.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/185x185?text=No+Image';
                  }}
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg">{person.name}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === 'cast' ? (
                    <div>
                      {person.roles.map((role, index) => (
                        <div key={index} className="mb-1">
                          <span className="font-medium">{role.media.name || role.media.title}</span>: {role.character}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {person.roles.map((role, index) => (
                        <div key={index} className="mb-1">
                          <span className="font-medium">{role.media.name || role.media.title}</span>: {role.job}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComparisonResults;
