/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./docs/**/*.{js,jsx,md}",
  ],
  safelist: [
    'bg-gray-100',
    'bg-gray-200',
    'bg-gray-700',
    'bg-gray-800',
    'bg-gray-900',
    'text-gray-100',
    'text-gray-200',
    'text-gray-700',
    'text-gray-800',
    'text-gray-900',
    'hover:bg-gray-100',
    'hover:bg-gray-700',
    'dark:bg-gray-700',
    'dark:bg-gray-800',
    'dark:bg-gray-900',
    'dark:text-gray-100',
    'dark:text-gray-200',
    'dark:hover:bg-gray-700',
    'dark:focus:bg-gray-700',
    'focus:bg-gray-100',
    'h-48',
    'w-full',
    'object-cover',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors
        'primary-light': '#8a6eff',
        'secondary-light': '#ff6e91',
        'background-light': '#f8f9fa',
        'surface-light': '#ffffff',
        'text-light': '#212529',
        
        // Dark theme colors
        'primary-dark': '#bb86fc',
        'secondary-dark': '#ff7597',
        'background-dark': '#121212',
        'surface-dark': '#1e1e1e',
        'text-dark': '#e9ecef',
      },
    },
  },
  plugins: [],
}
