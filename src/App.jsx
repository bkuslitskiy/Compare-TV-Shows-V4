import { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import SearchBar from './components/search/SearchBar';
import SelectionList from './components/search/SelectionList';
import ComparisonResults from './components/comparison/ComparisonResults';
import { useSelection } from './context/SelectionContext';
import { useComparison } from './context/ComparisonContext';

function App() {
  const { selections, addSelection, removeSelection, clearSelections } = useSelection();
  const { 
    comparisonResults, 
    projects, 
    loading, 
    error, 
    compareSelectedProjects, 
    clearComparison 
  } = useComparison();
  
  const handleCompare = () => {
    if (selections.length >= 2) {
      compareSelectedProjects(selections);
    }
  };
  
  const handleBack = () => {
    clearComparison();
  };
  
  return (
    <MainLayout>
      {comparisonResults ? (
        <div>
          <button 
            className="mb-4 btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={handleBack}
          >
            ← Back to Selection
          </button>
          
          <ComparisonResults 
            sharedCast={comparisonResults.cast} 
            sharedCrew={comparisonResults.crew} 
            projects={projects} 
          />
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Compare TV Shows and Movies</h2>
          <p className="text-lg mb-8">
            Find shared cast and crew members between your favorite shows and movies.
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <SearchBar onSelect={addSelection} />
          </div>
          
          <div className="mb-8">
            <SelectionList 
              selections={selections} 
              onRemove={removeSelection} 
            />
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button 
              className={`btn ${selections.length >= 2 ? 'btn-primary' : 'btn-primary opacity-50 cursor-not-allowed'}`}
              onClick={handleCompare}
              disabled={selections.length < 2 || loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-b-2 border-white rounded-full mr-2"></span>
                  Comparing...
                </>
              ) : (
                <>
                  Compare Selections
                  {selections.length > 0 && (
                    <span className="ml-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm">
                      {selections.length}
                    </span>
                  )}
                </>
              )}
            </button>
            
            {selections.length > 0 && (
              <button 
                className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={clearSelections}
                disabled={loading}
              >
                Clear All
              </button>
            )}
          </div>
          
          {selections.length < 2 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Please select at least 2 TV shows or movies to compare
            </p>
          )}
        </div>
      )}
    </MainLayout>
  );
}

export default App;
