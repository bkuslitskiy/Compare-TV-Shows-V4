import { createContext, useContext, useState, useCallback } from 'react';

// Create context
const SelectionContext = createContext();

/**
 * Custom hook to use the selection context
 * @returns {Object} Selection context
 */
export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

/**
 * Selection provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} SelectionProvider component
 */
export function SelectionProvider({ children }) {
  const [selections, setSelections] = useState([]);
  
  // Add a selection
  const addSelection = useCallback((item) => {
    setSelections((prevSelections) => {
      // Check if item is already selected
      const isAlreadySelected = prevSelections.some(
        (selection) => selection.id === item.id && selection.media_type === item.media_type
      );
      
      if (isAlreadySelected) {
        return prevSelections;
      }
      
      return [...prevSelections, item];
    });
  }, []);
  
  // Remove a selection
  const removeSelection = useCallback((item) => {
    setSelections((prevSelections) => 
      prevSelections.filter(
        (selection) => !(selection.id === item.id && selection.media_type === item.media_type)
      )
    );
  }, []);
  
  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelections([]);
  }, []);
  
  // Context value
  const value = {
    selections,
    addSelection,
    removeSelection,
    clearSelections,
  };
  
  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}
