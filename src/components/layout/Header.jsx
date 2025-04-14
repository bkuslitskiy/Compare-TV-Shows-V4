import { useState, useEffect } from 'react';

/**
 * Header component with theme toggle
 * @returns {JSX.Element} Header component
 */
function Header() {
  const [theme, setTheme] = useState('system');
  const [systemTheme, setSystemTheme] = useState('light');
  
  // Effect to detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Compute actual theme
  const actualTheme = theme === 'system' ? systemTheme : theme;
  
  // Set theme class on document
  useEffect(() => {
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [actualTheme]);
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          Compare TV Shows
        </h1>
        <div className="flex items-center space-x-2">
          <span className="sr-only">Choose theme:</span>
          <button
            onClick={() => setTheme('light')}
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              theme === 'light' ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            aria-pressed={theme === 'light'}
            aria-label="Light theme"
          >
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-2.05-4.95a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm-9.9-1.05a1 1 0 100 2h1a1 1 0 100-2h-1zm4.95-2.05a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414z" />
            </svg>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              theme === 'dark' ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            aria-pressed={theme === 'dark'}
            aria-label="Dark theme"
          >
            <svg className="w-5 h-5 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              theme === 'system' ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            aria-pressed={theme === 'system'}
            aria-label="System theme"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
