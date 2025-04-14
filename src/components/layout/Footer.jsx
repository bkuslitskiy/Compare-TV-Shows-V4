/**
 * Footer component
 * @returns {JSX.Element} Footer component
 */
function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
      <div className="container mx-auto px-4 py-4 text-center">
        <p className="text-sm">
          Powered by{' '}
          <a 
            href="https://www.themoviedb.org/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            The Movie Database
          </a>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
