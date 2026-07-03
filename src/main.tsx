/**
 * main.tsx
 *
 * Application entrypoint. Bootstraps React 18 into `#root`.
 *
 * Responsibilities:
 *   - Set the document language attribute for accessibility and SEO
 *   - Mount the React root with StrictMode
 *   - Render the new <App> from src/app/App.tsx, which owns HelmetProvider,
 *     BrowserRouter, ErrorBoundary, and the route tree
 *
 * Structured data (JSON-LD) is no longer injected here; it is emitted
 * per-route by <RouteSEO> in src/app/SEO/RouteSEO.tsx:
 *   - Person JSON-LD on "/" (home)
 *   - Article JSON-LD on "/writing/:slug"
 *
 * Validates: Requirements 1.5, 14.2, 19.5
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
// Global motion policy — MUST be the first import so the prefers-reduced-motion
// shim is installed before any module reads the query at evaluation time.
import './utils/forceMotion';
import App from './app/App';
import './index.css';

// Set document language for accessibility (WCAG 3.1.1) and SEO
document.documentElement.lang = 'en';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('[main.tsx] #root element not found in index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
