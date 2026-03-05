import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Initialize i18n before the app renders so all t() calls work immediately
import './i18n/i18n';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
