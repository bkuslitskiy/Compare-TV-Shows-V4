import { useState, useMemo, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { getImageUrl, getReleaseYear } from '../../utils/tmdbHelpers';

/**
 * ComparisonResults component for displaying shared cast and crew
 * @param {Object} props - Component props
 * @param {Array} props.sharedCast - Array of shared cast members
 * @param {Array} props.sharedCrew - Array of shared crew members
 * @param {Array} props.projects - Array of projects being compared
 * @returns {JSX.Element} ComparisonResults component
 */
function ComparisonResults({ sharedCast = [], sharedCrew = [], projects = [] }) {
  const [filters, setFilters] = useState({
    department: 'all',
    minEpisodes: 0,
    onlyMainCast: false,
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState('importance'); // 'importance', 'name', 'projects'
  const [departments, setDepartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // References for keyboard navigation
  const filterButtonsRef = useRef(null);
  const resultsTableRef = useRef(null);
  
  // Combine cast and crew with type indicators
  const combinedPeople = useMemo(() => {
    const castWithType = sharedCast.map(person => ({
      ...person,
      roleType: 'cast',
      department: 'Cast'
    }));
    
    const crewWithType = sharedCrew.map(person => ({
      ...person,
      roleType: 'crew'
    }));
    
    return [...castWithType, ...crewWithType];
  }, [sharedCast, sharedCrew]);
  
  // Create filter button items for keyboard navigation
  const filterButtons = useMemo(() => {
    const buttons = [
      { id: 'all', label: `All (${combinedPeople.length})` },
      { id: 'cast', label: `Cast (${sharedCast.length})` },
      { id: 'crew', label: `Crew (${sharedCrew.length})` }
    ];
    
    // Add department filters
    departments.forEach(dept => {
      buttons.push({ id: dept, label: dept });
    });
    
    return buttons;
  }, [combinedPeople.length, sharedCast.length, sharedCrew.length, departments]);
  
  // Keyboard navigation for filter buttons
  const {
    focusedIndex: focusedFilterIndex,
    getContainerProps: getFilterContainerProps,
    getItemProps: getFilterItemProps
  } = useKeyboardNavigation({
    items: filterButtons,
    onSelect: (item) => setFilters(prev => ({ ...prev, department: item.id })),
    vertical: false,
    loop: true
  });
  
  // Extract unique departments from crew
  useEffect(() => {
    if (sharedCrew.length > 0) {
      const deptSet = new Set();
      sharedCrew.forEach(person => {
        person.roles.forEach(role => {
          if (role.department) {
            deptSet.add(role.department);
          }
        });
      });
      setDepartments(Array.from(deptSet).sort());
    }
  }, [sharedCrew]);
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Filter the combined people array based on the filter state
  const filteredPeople = useMemo(() => {
    return combinedPeople.filter(person => {
      // Department filter
      if (filters.department !== 'all') {
        if (filters.department === 'cast' && person.roleType !== 'cast') {
          return false;
        }
        if (filters.department === 'crew' && person.roleType !== 'crew') {
          return false;
        }
        if (person.roleType === 'crew' && 
            filters.department !== 'crew' && 
            !person.roles.some(role => role.department === filters.department)) {
          return false;
        }
      }
      
      // Minimum episodes filter
      if (filters.minEpisodes > 0) {
        const maxEpisodes = Math.max(...person.roles.map(role => role.episodeCount || 0));
        if (maxEpisodes < filters.minEpisodes) {
          return false;
        }
      }
      
      // Main cast filter
      if (filters.onlyMainCast && person.roleType === 'cast') {
        // Assume main cast has order < 10
        const isMainCast = person.roles.some(role => role.order !== undefined && role.order < 10);
        if (!isMainCast) {
          return false;
        }
      }
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatch = person.name.toLowerCase().includes(searchLower);
        const roleMatch = person.roles.some(role => {
          const character = role.character?.toLowerCase() || '';
          const job = role.job?.toLowerCase() || '';
          const department = role.department?.toLowerCase() || '';
          return character.includes(searchLower) || 
                 job.includes(searchLower) || 
                 department.includes(searchLower);
        });
        
        if (!nameMatch && !roleMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [combinedPeople, filters]);
  
  // Sort the filtered people array based on the sortBy state
  const sortedPeople = useMemo(() => {
    if (!filteredPeople.length) return [];
    
    return [...filteredPeople].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'projects') {
        return b.projectCount - a.projectCount;
      } else { // 'importance'
        return b.importanceScore - a.importanceScore;
      }
    });
  }, [filteredPeople, sortBy]);
  
  // Function to get the release years for a project
  const getProjectYears = (project) => {
    if (project.media_type === 'tv' || project.type === 'tv') {
      const firstYear = project.first_air_date ? new Date(project.first_air_date).getFullYear() : null;
      const lastYear = project.last_air_date ? new Date(project.last_air_date).getFullYear() : null;
      
      if (firstYear && lastYear && firstYear !== lastYear) {
        return `(${firstYear}-${lastYear})`;
      } else if (firstYear) {
        return `(${firstYear})`;
      }
      return '';
    } else {
      const year = getReleaseYear(project);
      return year ? `(${year})` : '';
    }
  };
  
  // Function to find a person's role in a specific project
  const findPersonRoleInProject = (person, project) => {
    return person.roles.find(role => 
      (role.media.id === project.id) && 
      ((role.media.type === project.type) || (role.media.type === project.media_type))
    );
  };
  
  // Function to format role information
  const formatRole = (role, roleType) => {
    if (roleType === 'cast') {
      return role.character;
    } else {
      return role.job;
    }
  };
  
  // Function to get the primary department color
  const getDepartmentColor = (department) => {
    const colorMap = {
      'Cast': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'Directing': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      'Writing': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'Production': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'Sound': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'Camera': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
      'Editing': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
      'Art': 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
      'Costume & Make-Up': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      'Visual Effects': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
      'Crew': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    };
    
    return colorMap[department] || colorMap['Crew'];
  };
  
  // Function to get department badge
  const getDepartmentBadge = (department) => {
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${getDepartmentColor(department)}`}>
        {department}
      </span>
    );
  };
  
  // Render the advanced filter panel
  const renderFilterPanel = () => {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg">Advanced Filters</h3>
          <button 
            onClick={() => setShowFilters(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department filter */}
          <div>
            <label htmlFor="department-filter" className="block text-sm font-medium mb-1">
              Department
            </label>
            <select
              id="department-filter"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Departments</option>
              <option value="cast">Cast</option>
              <option value="crew">All Crew</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {/* Minimum episodes filter */}
          <div>
            <label htmlFor="min-episodes" className="block text-sm font-medium mb-1">
              Minimum Episodes
            </label>
            <input
              id="min-episodes"
              type="number"
              min="0"
              max="100"
              value={filters.minEpisodes}
              onChange={(e) => handleFilterChange('minEpisodes', parseInt(e.target.value) || 0)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
          
          {/* Main cast filter */}
          <div className="flex items-center">
            <input
              id="main-cast-only"
              type="checkbox"
              checked={filters.onlyMainCast}
              onChange={(e) => handleFilterChange('onlyMainCast', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="main-cast-only" className="ml-2 block text-sm">
              Main Cast Only
            </label>
          </div>
          
          {/* Search term filter */}
          <div>
            <label htmlFor="search-filter" className="block text-sm font-medium mb-1">
              Search
            </label>
            <input
              id="search-filter"
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search names, roles..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({
              department: 'all',
              minEpisodes: 0,
              onlyMainCast: false,
              searchTerm: ''
            })}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm mr-2"
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  };
  
  if (projects.length < 2) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 dark:text-gray-400">
          Please select at least 2 TV shows or movies to compare.
        </p>
      </div>
    );
  }
  
  if (combinedPeople.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Comparison Results</h2>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {projects.map((project) => (
            <div 
              key={`${project.media_type || project.type}-${project.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 w-32"
            >
              <img
                src={getImageUrl(project.poster_path, 'w185')}
                alt={project.title || project.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.png';
                }}
              />
              <div className="p-2">
                <h3 className="font-bold text-sm truncate">{project.title || project.name}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {getProjectYears(project)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            No shared cast or crew members found between these projects.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Comparison Results</h2>
      
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div 
            className="flex flex-wrap gap-2"
            ref={filterButtonsRef}
            {...getFilterContainerProps()}
            aria-label="Filter options"
          >
            {filterButtons.slice(0, 3).map((button, index) => (
              <button
                key={button.id}
                className={`px-3 py-1 rounded-md text-sm ${
                  filters.department === button.id
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                } ${focusedFilterIndex === index ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                onClick={() => handleFilterChange('department', button.id)}
                {...getFilterItemProps(index)}
              >
                {button.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== '' && v !== false) ? 
              'Filters Active' : 'Advanced Filters'}
          </button>
          
          {filters.searchTerm && (
            <div className="px-3 py-1 rounded-md text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center">
              <span className="mr-1">Search: {filters.searchTerm}</span>
              <button 
                onClick={() => handleFilterChange('searchTerm', '')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <label 
            htmlFor="sort-select" 
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            Sort by:
          </label>
          <select 
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
            aria-label="Sort results by"
          >
            <option value="importance">Importance</option>
            <option value="name">Name</option>
            <option value="projects">Number of Projects</option>
          </select>
        </div>
      </div>
      
      {/* Advanced filter panel */}
      {showFilters && renderFilterPanel()}
      
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {sortedPeople.length} of {combinedPeople.length} people
      </div>
      
      {/* Table-like layout using CSS Grid */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow">
        <div className="comparison-table">
          {/* Header row with projects */}
          <div className="table-header grid" style={{ gridTemplateColumns: `280px repeat(${projects.length}, minmax(180px, 1fr))` }}>
            <div className="header-cell bg-gray-100 dark:bg-gray-800 p-4 font-bold sticky left-0 z-10 border-b border-r border-gray-200 dark:border-gray-700">
              Person
            </div>
            
            {projects.map((project) => (
              <div 
                key={`header-${project.media_type || project.type}-${project.id}`}
                className="header-cell bg-gray-100 dark:bg-gray-800 p-4 text-center border-b border-r border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={getImageUrl(project.poster_path, 'w92')}
                    alt={project.title || project.name}
                    className="w-16 h-24 object-cover mb-2 rounded shadow"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                  <div className="font-bold text-sm">{project.title || project.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getProjectYears(project)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Body rows with people and their roles */}
          {sortedPeople.length > 0 ? (
            <div style={{ height: Math.min(600, sortedPeople.length * 100) }}>
              <List
                height={Math.min(600, sortedPeople.length * 100)}
                itemCount={sortedPeople.length}
                itemSize={100}
                width="100%"
                className="virtualized-list"
              >
                {({ index, style }) => {
                  const person = sortedPeople[index];
                  return (
                    <div 
                      key={`row-${person.id}`}
                      className="table-row grid" 
                      style={{ 
                        ...style,
                        gridTemplateColumns: `280px repeat(${projects.length}, minmax(180px, 1fr))`,
                        width: `calc(280px + ${projects.length * 180}px)`
                      }}
                    >
                      {/* Person cell */}
                      <div className="person-cell bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 p-4 flex items-center sticky left-0 z-5">
                        <img
                          src={getImageUrl(person.profile_path, 'w92')}
                          alt={person.name}
                          className="w-12 h-12 object-cover rounded-full mr-3 shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                        <div>
                          <div className="font-medium">{person.name}</div>
                          <div className="flex items-center mt-1 gap-1">
                            {getDepartmentBadge(person.department || (person.roleType === 'cast' ? 'Cast' : 'Crew'))}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                              {person.projectCount} projects
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Role cells for each project */}
                      {projects.map((project) => {
                        const role = findPersonRoleInProject(person, project);
                        return (
                          <div 
                            key={`cell-${person.id}-${project.id}`}
                            className="bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 p-4"
                          >
                            {role ? (
                              <div className="text-sm">
                                <div className="font-medium">{formatRole(role, person.roleType)}</div>
                                {role.department && role.department !== formatRole(role, person.roleType) && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {role.department}
                                  </div>
                                )}
                                {role.episodeCount && role.episodeCount > 1 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {role.episodeCount} episodes
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                                Not Involved
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              </List>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results match your filters. Try adjusting your filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComparisonResults;
