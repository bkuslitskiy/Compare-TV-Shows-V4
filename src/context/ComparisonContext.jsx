import { createContext, useContext, useState, useCallback } from 'react';
import { getShowAllCredits, getMovieWithCredits } from '../services/tmdb';
import { compareProjects } from '../services/comparison';

// Create context
const ComparisonContext = createContext();

/**
 * Custom hook to use the comparison context
 * @returns {Object} Comparison context
 */
export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}

/**
 * Comparison provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} ComparisonProvider component
 */
export function ComparisonProvider({ children }) {
  const [comparisonResults, setComparisonResults] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch project details with credits
  const fetchProjectDetails = useCallback(async (project) => {
    try {
      if (project.media_type === 'tv') {
        return await getShowAllCredits(project.id);
      } else if (project.media_type === 'movie') {
        return await getMovieWithCredits(project.id);
      } else {
        throw new Error(`Unsupported media type: ${project.media_type}`);
      }
    } catch (error) {
      console.error(`Error fetching details for ${project.media_type} ${project.id}:`, error);
      throw error;
    }
  }, []);
  
  // Compare projects
  const compareSelectedProjects = useCallback(async (selections) => {
    if (selections.length < 2) {
      setError('Please select at least 2 projects to compare');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch details for all selected projects
      const projectDetailsPromises = selections.map(fetchProjectDetails);
      const projectsWithDetails = await Promise.all(projectDetailsPromises);
      
      // Store the projects for display
      setProjects(projectsWithDetails);
      
      // Compare the projects
      const results = compareProjects(projectsWithDetails);
      
      setComparisonResults(results);
    } catch (error) {
      console.error('Error comparing projects:', error);
      setError('Error comparing projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchProjectDetails]);
  
  // Clear comparison results
  const clearComparison = useCallback(() => {
    setComparisonResults(null);
    setProjects([]);
    setError(null);
  }, []);
  
  // Context value
  const value = {
    comparisonResults,
    projects,
    loading,
    error,
    compareSelectedProjects,
    clearComparison,
  };
  
  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}
