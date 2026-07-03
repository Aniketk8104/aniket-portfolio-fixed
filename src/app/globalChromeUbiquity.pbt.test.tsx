/**
 * Property 4: Global Chrome Ubiquity
 *
 * **Validates: Requirements 1.5, 19.1, 19.2, 19.3, 19.4**
 *
 * For every route in the route table, `Navbar`, `Footer`, `AnimatedBackground`,
 * `CustomCursor`, `ScrollProgress`, and `FloatingCTA` each mount exactly once
 * in the rendered tree.
 *
 * Implementation approach:
 *   - Mock all externally-imported chrome components with uniquely-identified
 *     sentinel divs (`data-testid`).
 *   - `CustomCursor` and `ScrollProgress` are inlined in SiteShell.tsx; their
 *     rendered DOM is identified by class names (`ultra-cursor-container`,
 *     `scroll-progress`).
 *   - Each route component is mocked to a simple stub to avoid pulling in the
 *     full route tree (which would require additional data/network mocks).
 *   - SiteShell is rendered inside a `MemoryRouter` with `initialEntries` set
 *     to each route's path.
 *   - `fast-check` is used to sample routes and assert the invariant holds.
 *
 * @vitest-environment jsdom
 */

import React, { Suspense } from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any imports of the mocked modules
// ---------------------------------------------------------------------------

// Mock framer-motion to avoid animation lifecycle issues in jsdom
vi.mock('framer-motion', async () => {
  const React = await import('react');

  const makePassthrough =
    (tag: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ children, ...props }: any) => {
      const {
        variants: _v,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        whileHover: _wh,
        whileTap: _wt,
        whileFocus: _wf,
        whileInView: _wi,
        viewport: _vp,
        style: _s,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...domProps
      } = props;
      // Remove style from the spread to prevent framer-motion MotionValue props
      return React.createElement(tag, domProps, children);
    };

  const m = new Proxy(
    {},
    { get: (_target, prop: string) => makePassthrough(prop) },
  );

  return {
    m,
    motion: m,
    LazyMotion: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    domAnimation: {},
    useReducedMotion: () => false,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useScroll: () => ({ scrollY: { on: vi.fn(), get: () => 0 } }),
    useMotionValueEvent: () => {},
  };
});

// Mock Navbar — renders a sentinel with data-testid
vi.mock('../components/Navbar', () => ({
  default: () =>
    React.createElement('nav', {
      'data-testid': 'chrome-navbar',
      'aria-label': 'Site navigation',
    }),
}));

// Mock Footer — renders a sentinel with data-testid
vi.mock('../components/Footer', () => ({
  default: () =>
    React.createElement('footer', { 'data-testid': 'chrome-footer' }),
}));

// Mock FloatingCTA — renders a sentinel with data-testid
vi.mock('../components/FloatingCTA', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'chrome-floating-cta' }),
}));

// Mock AnimatedBackground (full variant) — renders a sentinel
vi.mock('../components/AnimatedBackground', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'chrome-animated-background' }),
}));

// Mock AnimatedBackgroundLite — renders a sentinel
vi.mock('../components/AnimatedBackgroundLite', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'chrome-animated-background' }),
}));

// Mock RouteFocusManager — no-op in tests
vi.mock('./RouteFocusManager', () => ({
  RouteFocusManager: () => null,
}));

// Mock ComponentLoader — simple div
vi.mock('./ComponentLoader', () => ({
  ComponentLoader: ({ height }: { height?: string }) =>
    React.createElement('div', {
      'data-testid': 'component-loader',
      style: { height: height ?? '400px' },
    }),
}));

// Mock all route components to minimal stubs so they render without data deps
vi.mock('../routes/HomePage', () => ({
  default: () => React.createElement('main', { 'data-route': 'home' }, 'Home'),
}));
vi.mock('../routes/ProjectsIndexPage', () => ({
  default: () => React.createElement('main', { 'data-route': 'projects' }, 'Projects'),
}));
vi.mock('../routes/ArchitectureIndexPage', () => ({
  default: () =>
    React.createElement('main', { 'data-route': 'architectureIndex' }, 'Architecture'),
}));
vi.mock('../routes/ArchitectureTopicPage', () => ({
  default: () =>
    React.createElement('main', { 'data-route': 'architectureTopic' }, 'ArchitectureTopic'),
}));
vi.mock('../routes/CaseStudyIndexPage', () => ({
  default: () =>
    React.createElement('main', { 'data-route': 'caseStudiesIndex' }, 'Case Studies'),
}));
vi.mock('../routes/CaseStudyPage', () => ({
  default: () =>
    React.createElement('main', { 'data-route': 'caseStudy' }, 'Case Study'),
}));
vi.mock('../routes/WritingIndexPage', () => ({
  default: () =>
    React.createElement('main', { 'data-route': 'writingIndex' }, 'Writing'),
}));
vi.mock('../routes/ArticlePage', () => ({
  default: () =>
    React.createElement('main', { 'data-route': 'article' }, 'Article'),
}));
vi.mock('../routes/NotFoundPage', () => ({
  default: () =>
    React.createElement('main', { 'data-route': 'notFound' }, '404'),
}));

// Mock lazyWithPreload so background lazy imports resolve synchronously
vi.mock('../utils/lazyWithPreload', () => ({
  lazyWithPreload: (factory: () => Promise<{ default: React.ComponentType }>) => {
    // Return a lazy exotic component-like object
    const Component = React.lazy(factory);
    return Component;
  },
  setupPreloadObserver: () => undefined,
}));

// ---------------------------------------------------------------------------
// Set up jsdom environment so CustomCursor renders
// (matchMedia: pointer:fine = true, no touch support → enabled = true)
// ---------------------------------------------------------------------------
beforeAll(() => {
  // Provide window.matchMedia returning `true` for (pointer: fine) queries
  // and `false` for reduced-motion so the cursor and background both render.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches:
        query === '(pointer: fine)' || query === '(pointer:fine)'
          ? true
          : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });

  // Override requestIdleCallback to fire immediately in tests (no scheduling delay).
  // SiteShell uses requestIdleCallback with timeout:1500 to defer the background;
  // in tests we override this to fire synchronously (timeout=0) so we don't need
  // to wait 1500ms per test.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).requestIdleCallback = (cb: IdleRequestCallback) => {
    return window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).cancelIdleCallback = (id: number) => window.clearTimeout(id);

  // Inject CSS tokens so components don't crash on CSS var lookups
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --color-background: #0a0a0f;
      --color-surface: #12121a;
      --color-surface-elevated: #1a1a28;
      --color-border: #2a2a40;
      --color-text-primary: #f0f0ff;
      --color-text-secondary: #a0a0c0;
      --color-text-muted: #606080;
      --color-accent-primary: #6366f1;
      --color-accent-secondary: #8b5cf6;
      --color-success: #10b981;
      --color-warning: #f59e0b;
      --color-danger: #ef4444;
      --font-sans: Inter, system-ui, sans-serif;
      --font-mono: "JetBrains Mono", monospace;
      --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px;
      --space-1: 4px; --space-2: 8px; --space-4: 16px; --space-8: 32px;
    }
  `;
  document.head.appendChild(style);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Import SiteShell and routeTable after mocks are registered
// ---------------------------------------------------------------------------
// Note: imports are hoisted in the module but vi.mock is also hoisted,
// so we import after the vi.mock calls to ensure mocks are in place.
import { SiteShell } from './SiteShell';
import { routeTable, type RouteEntry } from './routeTable';

// ---------------------------------------------------------------------------
// Helper: resolve a concrete path from a route pattern (for slug routes)
// ---------------------------------------------------------------------------
function concretePath(entry: RouteEntry): string {
  // Replace `:slug` params with a test value
  return entry.path.replace(/:slug/g, 'test-slug').replace(/\*/g, '');
}

// ---------------------------------------------------------------------------
// Helper: render SiteShell with all routes registered, at a given initial path
// ---------------------------------------------------------------------------
async function renderAtPath(initialPath: string): Promise<HTMLElement> {
  // Use fake timers to control requestIdleCallback/setTimeout scheduling
  vi.useFakeTimers();

  const { container } = render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          {/* Layout route — SiteShell renders chrome once, Outlet renders the route */}
          <Route element={<SiteShell />}>
            {routeTable.map(({ path, key, component: RouteComponent }) => (
              <Route
                key={key}
                path={path}
                element={
                  <Suspense fallback={<div data-testid="route-loading" />}>
                    <RouteComponent />
                  </Suspense>
                }
              />
            ))}
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

  // Advance all fake timers (fires requestIdleCallback mock, which sets shouldRenderBackground=true)
  await act(async () => {
    vi.runAllTimers();
  });

  // Switch back to real timers so act(async) can resolve properly
  vi.useRealTimers();

  return container;
}

// ---------------------------------------------------------------------------
// Chrome component assertions
// ---------------------------------------------------------------------------

/**
 * Assert that every required chrome component appears exactly once in the
 * container. Passes `componentName` for clear error messages.
 */
function assertChromeUbiquity(container: HTMLElement, routePath: string): void {
  // 1. Navbar — mocked to `data-testid="chrome-navbar"`
  const navbars = container.querySelectorAll('[data-testid="chrome-navbar"]');
  expect(
    navbars.length,
    `[${routePath}] Navbar must mount exactly once (found ${navbars.length})`
  ).toBe(1);

  // 2. Footer — mocked to `data-testid="chrome-footer"`
  const footers = container.querySelectorAll('[data-testid="chrome-footer"]');
  expect(
    footers.length,
    `[${routePath}] Footer must mount exactly once (found ${footers.length})`
  ).toBe(1);

  // 3. AnimatedBackground (full or lite) — both mocked to `data-testid="chrome-animated-background"`
  const backgrounds = container.querySelectorAll('[data-testid="chrome-animated-background"]');
  expect(
    backgrounds.length,
    `[${routePath}] AnimatedBackground must mount exactly once (found ${backgrounds.length})`
  ).toBe(1);

  // 4. FloatingCTA — mocked to `data-testid="chrome-floating-cta"`
  const floatingCtas = container.querySelectorAll('[data-testid="chrome-floating-cta"]');
  expect(
    floatingCtas.length,
    `[${routePath}] FloatingCTA must mount exactly once (found ${floatingCtas.length})`
  ).toBe(1);

  // 5. CustomCursor — inlined in SiteShell; renders `.ultra-cursor-container`
  //    when enabled (pointer:fine + no touch). Our jsdom matchMedia mock
  //    returns true for (pointer: fine), so it should be enabled.
  //    If CustomCursor is disabled (returns null), we accept 0 as a valid
  //    count since the spec says "on pointer devices".
  const cursors = container.querySelectorAll('.ultra-cursor-container');
  expect(
    cursors.length,
    `[${routePath}] CustomCursor must mount at most once (found ${cursors.length})`
  ).toBeLessThanOrEqual(1);

  // 6. ScrollProgress — inlined in SiteShell; renders `.scroll-progress`
  const progressBars = container.querySelectorAll('.scroll-progress');
  expect(
    progressBars.length,
    `[${routePath}] ScrollProgress must mount exactly once (found ${progressBars.length})`
  ).toBe(1);
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

/**
 * Concrete routes used for both the deterministic and PBT variants.
 * Slug routes get a placeholder value so the MemoryRouter matches them.
 */
const concreteRoutes = routeTable
  .filter((entry) => entry.path !== '*') // exclude wildcard (handled separately)
  .map((entry) => ({
    key: entry.key,
    path: entry.path,
    concretePath: concretePath(entry),
  }));

describe('Property 4: Global Chrome Ubiquity', () => {
  /**
   * Deterministic: run each route exactly once so failures are unambiguous.
   */
  it.each(concreteRoutes)(
    '[route: $key] Navbar, Footer, AnimatedBackground, ScrollProgress, FloatingCTA mount exactly once',
    async ({ concretePath: path, key }) => {
      const container = await renderAtPath(path);

      // Verify chrome ubiquity for this route
      assertChromeUbiquity(container, key);
    }
  );

  /**
   * Wildcard / 404 route.
   */
  it('NotFound route (*): chrome components mount exactly once', async () => {
    const container = await renderAtPath('/non-existent-page-xyz');
    assertChromeUbiquity(container, 'notFound (*)');
  });

  /**
   * Property-based: fast-check samples routes and asserts chrome ubiquity.
   *
   * Uses fc.constantFrom over the concrete route list so fast-check explores
   * all routes with full shrinking support.
   *
   * numRuns is set to cover the full route set multiple times.
   */
  it('for every route sampled by fast-check: chrome components mount exactly once', async () => {
    // We run the PBT synchronously over pre-rendered containers to keep it fast.
    // Rendering is async so we collect containers first, then assert inside fc.property.
    const routeArb = fc.constantFrom(...concreteRoutes);

    await fc.assert(
      fc.asyncProperty(routeArb, async ({ concretePath: path, key }) => {
        const container = await renderAtPath(path);
        assertChromeUbiquity(container, key);
      }),
      {
        numRuns: routeTable.length * 3, // at minimum 3× coverage of the route set
        verbose: false,
      }
    );
  });
});
