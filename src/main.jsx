import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { SelectionProvider } from './context/SelectionContext';
import { ComparisonProvider } from './context/ComparisonContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SelectionProvider>
      <ComparisonProvider>
        <App />
      </ComparisonProvider>
    </SelectionProvider>
  </StrictMode>,
);
