/**
 * App.tsx
 *
 * Application root. Composes the provider tree and registers all client-side
 * routes consumed from `routeTable.ts`.
 *
 * Provider hierarchy (outer → inner):
 *   HelmetProvider   — react-helmet-async context for per-route SEO tags
 *   BrowserRouter    — react-router-dom v6 history context
 *   ErrorBoundary    — catches runtime errors across the entire tree
 *   Routes           — react-router-dom v6 declarative route matching
 *     └─ layout route (path="") → <SiteShell/>
 *          └─ child routes from routeTable.ts, each component wrapped in
 *             React.lazy for route-level code splitting per Requirement 15.2
 *
 * Validates: Requirements 1.1, 1.3, 15.2, 15.3
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import ErrorBoundary from '../components/ErrorBoundary';
import { SiteShell } from './SiteShell';
import { ComponentLoader } from './ComponentLoader';
import { routeTable } from './routeTable';
import BootSequence from './BootSequence';

/**
 * App
 *
 * Renders the full provider stack. The SiteShell is registered as a layout
 * route (no `path` prop, so it always matches) and all page routes are its
 * children. SiteShell renders <Outlet/> which react-router-dom fills with the
 * matched child route.
 *
 * Every route component reference already comes from routeTable.ts as a
 * React.lazy-wrapped import, satisfying the code-splitting requirements.
 */
const App: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <BootSequence />
        <ErrorBoundary
          name="app-root"
          fallback={(error: Error) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--color-text-primary, #fff)',
                background: 'var(--color-background, #0a0a0f)',
              }}
            >
              <h1 style={{ marginBottom: '1rem' }}>Something went wrong</h1>
              <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary, rgba(255,255,255,0.6))' }}>
                {error?.message ?? 'An unexpected error occurred.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--color-accent-primary, #6366f1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 8px)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Reload Page
              </button>
            </div>
          )}
        >
          <Routes>
            {/* Layout route — SiteShell mounts global chrome exactly once */}
            <Route element={<SiteShell />}>
              {routeTable.map(({ path, key, component: RouteComponent }) => (
                <Route
                  key={key}
                  path={path}
                  element={
                    <Suspense fallback={<ComponentLoader height="100vh" />}>
                      <RouteComponent />
                    </Suspense>
                  }
                />
              ))}
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
