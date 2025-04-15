import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for keyboard navigation
 * @param {Object} options - Configuration options
 * @param {Array} options.items - Array of items to navigate through
 * @param {Function} options.onSelect - Function to call when an item is selected
 * @param {Function} options.onEscape - Function to call when Escape key is pressed
 * @param {boolean} options.vertical - Whether navigation is vertical (true) or horizontal (false)
 * @param {boolean} options.loop - Whether to loop from last to first item and vice versa
 * @param {boolean} options.autoFocus - Whether to automatically focus the first item
 * @returns {Object} Keyboard navigation helpers
 */
export function useKeyboardNavigation({
  items = [],
  onSelect,
  onEscape,
  vertical = true,
  loop = true,
  autoFocus = false
}) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef([]);
  
  // Update refs array when items change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
    
    // Auto-focus first item if enabled and items exist
    if (autoFocus && items.length > 0 && focusedIndex === -1) {
      setFocusedIndex(0);
    }
  }, [items, autoFocus, focusedIndex]);
  
  // Focus the item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < itemRefs.current.length) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);
  
  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (!items.length) return;
    
    const key = event.key;
    
    // Determine navigation keys based on orientation
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
    
    switch (key) {
      case nextKey:
        event.preventDefault();
        if (focusedIndex < items.length - 1) {
          setFocusedIndex(focusedIndex + 1);
        } else if (loop) {
          setFocusedIndex(0);
        }
        break;
        
      case prevKey:
        event.preventDefault();
        if (focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1);
        } else if (loop) {
          setFocusedIndex(items.length - 1);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
        
      case 'Enter':
      case ' ': // Space key
        event.preventDefault();
        if (focusedIndex >= 0 && onSelect) {
          onSelect(items[focusedIndex], focusedIndex);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        if (onEscape) {
          onEscape();
        }
        break;
        
      default:
        break;
    }
  };
  
  // Get props for the container element
  const getContainerProps = () => ({
    onKeyDown: handleKeyDown,
    role: vertical ? 'listbox' : 'toolbar',
    'aria-orientation': vertical ? 'vertical' : 'horizontal',
    tabIndex: focusedIndex < 0 ? 0 : -1, // Make container focusable only when no item is focused
  });
  
  // Get props for an item element
  const getItemProps = (index) => ({
    ref: (el) => (itemRefs.current[index] = el),
    tabIndex: focusedIndex === index ? 0 : -1,
    role: vertical ? 'option' : 'button',
    'aria-selected': focusedIndex === index,
    onFocus: () => setFocusedIndex(index),
    onClick: () => {
      setFocusedIndex(index);
      if (onSelect) {
        onSelect(items[index], index);
      }
    },
  });
  
  return {
    focusedIndex,
    setFocusedIndex,
    getContainerProps,
    getItemProps,
  };
}

export default useKeyboardNavigation;
