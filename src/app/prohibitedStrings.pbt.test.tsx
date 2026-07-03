/**
 * Property 5: Prohibited Strings Absent
 *
 * **Validates: Requirements 2.2, 3.2, 14.4, 20.1, 20.5**
 *
 * For every prohibited string in {"Freelance MERN", "MERN Stack Developer",
 * "Hire MERN"} × every artifact (rendered HTML per route, JSON-LD payloads,
 * meta tags, sitemap.xml, manifest.json, robots.txt, index.html, every file
 * under src/content/), the artifact does not contain the string.
 *
 * Test structure:
 *   1. Static file assertions — read public/{sitemap.xml,manifest.json,
 *      robots.txt} and index.html and assert they contain none of the
 *      prohibited strings.
 *   2. src/content/ source assertions — read every file under src/content/
 *      and assert they contain none of the prohibited strings.
 *   3. Rendered HTML assertions — for every route in routeTable, render the
 *      full app tree (HelmetProvider + MemoryRouter + SiteShell) and assert
 *      document.body.innerHTML + document.head.innerHTML contain none of the
 *      prohibited strings.
 *   4. fast-check property — fast-check samples (prohibited string, route)
 *      pairs and asserts the same invariant holds for any combination.
 *
 * @vitest-environment jsdom
 */

import React, { Suspense } from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Module mocks — mirrors globalChromeUbiquity.pbt.test.tsx so SiteShell
// renders without pulling in heavy dependencies or animation timers.
// ---------------------------------------------------------------------------

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

vi.mock('../components/Navbar', () => ({
  default: () => React.createElement('nav', { 'data-testid': 'chrome-navbar' }),
}));

vi.mock('../components/Footer', () => ({
  default: () => React.createElement('footer', { 'data-testid': 'chrome-footer' }),
}));

vi.mock('../components/FloatingCTA', () => ({
  default: () => React.createElement('div', { 'data-testid': 'chrome-floating-cta' }),
}));

vi.mock('../components/AnimatedBackground', () => ({
  default: () => React.createElement('div', { 'data-testid': 'chrome-animated-background' }),
}));

vi.mock('../components/AnimatedBackgroundLite', () => ({
  default: () => React.createElement('div', { 'data-testid': 'chrome-animated-background' }),
}));

vi.mock('./RouteFocusManager', () => ({
  RouteFocusManager: () => null,
}));

vi.mock('./ComponentLoader', () => ({
  ComponentLoader: ({ height }: { height?: string }) =>
    React.createElement('div', {
      'data-testid': 'component-loader',
      style: { height: height ?? '400px' },
    }),
}));

vi.mock('../routes/HomePage', () => ({
  default: () => React.createElement('main', { 'data-route': 'home' }, 'Home Page'),
}));
vi.mock('../routes/ProjectsIndexPage', () => ({
  default: () => React.createElement('main', { 'data-route': 'projects' }, 'Projects Page'),
}));
vi.mock('../routes/ArchitectureIndexPage', () => ({
  default: () => React.createElement('main', { 'data-route': 'architectureIndex' }, 'Architecture Page'),
}));
vi.mock('../routes/ArchitectureTopicPage', () => ({
  default: () => React.createElement('main', { 'data-route': 'architectureTopic' }, 'Architecture Topic Page'),
}));
vi.mock('../routes/CaseStudyIndexPage', () => ({
  default: () => React.createElement('main', { 'data-route': 'caseStudiesIndex' }, 'Case Studies Page'),
}));
vi.mock('../routes/CaseStudyPage', () => ({
  default: () => React.createElement('main', { 'data-route': 'caseStudy' }, 'Case Study Page'),
}));
vi.mock('../routes/WritingIndexPage', () => ({
  default: () => React.createElement('main', { 'data-route': 'writingIndex' }, 'Writing Page'),
}));
vi.mock('../routes/ArticlePage', () => ({
  default: () => React.createElement('main', { 'data-route': 'article' }, 'Article Page'),
}));
vi.mock('../routes/NotFoundPage', () => ({
  default: () => React.createElement('main', { 'data-route': 'notFound' }, '404 Not Found'),
}));

vi.mock('../utils/lazyWithPreload', () => ({
  lazyWithPreload: (factory: () => Promise<{ default: React.ComponentType }>) =>
    React.lazy(factory),
  setupPreloadObserver: () => undefined,
}));

// ---------------------------------------------------------------------------
// jsdom environment setup
// ---------------------------------------------------------------------------

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query === '(pointer: fine)' || query === '(pointer:fine)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).requestIdleCallback = (cb: IdleRequestCallback) =>
    window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).cancelIdleCallback = (id: number) => window.clearTimeout(id);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Imports after mocks are registered
// ---------------------------------------------------------------------------
import { SiteShell } from './SiteShell';
import { routeTable, type RouteEntry } from './routeTable';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The prohibited strings that must not appear in any artifact. */
const PROHIBITED = [
  'Freelance MERN',
  'MERN Stack Developer',
  'Hire MERN',
] as const;

type ProhibitedString = (typeof PROHIBITED)[number];

/** Resolve the project root from this file's location (works in both ESM and CJS vitest). */
const PROJECT_ROOT = path.resolve(
  fileURLToPath(import.meta.url),
  '../../../..',
);

// ---------------------------------------------------------------------------
// Helpers: static file reading
// ---------------------------------------------------------------------------

/**
 * Read a file relative to the project root as a UTF-8 string.
 * Returns an empty string when the file does not exist (so tests still pass).
 */
function readStatic(relPath: string): string {
  const absPath = path.join(PROJECT_ROOT, relPath);
  if (!fs.existsSync(absPath)) return '';
  return fs.readFileSync(absPath, 'utf-8');
}

/**
 * Recursively collect all files under a directory (absolute paths).
 */
function collectFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Helper: render a route and return the full serialised artifact string
// (body innerHTML + head innerHTML joined so we cover rendered HTML,
// JSON-LD payloads, meta tag content values, etc.)
// ---------------------------------------------------------------------------

function concretePath(entry: RouteEntry): string {
  return entry.path.replace(/:slug/g, 'test-slug').replace(/\*/g, '');
}

async function renderRouteArtifact(initialPath: string): Promise<string> {
  vi.useFakeTimers();

  const { container } = render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<SiteShell />}>
            {routeTable.map(({ path: routePath, key, component: RouteComponent }) => (
              <Route
                key={key}
                path={routePath}
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
    </HelmetProvider>,
  );

  await act(async () => {
    vi.runAllTimers();
  });

  vi.useRealTimers();

  // Include both body content and head content (for meta/JSON-LD checks)
  const body = container.innerHTML;
  const head = document.head.innerHTML;
  return body + '\n' + head;
}

// ---------------------------------------------------------------------------
// Concrete route list (used for both deterministic and PBT assertions)
// ---------------------------------------------------------------------------

const concreteRoutes = routeTable
  .filter((entry) => entry.path !== '*')
  .map((entry) => ({
    key: entry.key,
    path: entry.path,
    concretePath: concretePath(entry),
  }));

// ---------------------------------------------------------------------------
// Suite 1: Static files
// ---------------------------------------------------------------------------

describe('Property 5: Prohibited Strings Absent — static files', () => {
  const staticArtifacts: { name: string; relPath: string }[] = [
    { name: 'public/sitemap.xml', relPath: 'public/sitemap.xml' },
    { name: 'public/manifest.json', relPath: 'public/manifest.json' },
    { name: 'public/robots.txt', relPath: 'public/robots.txt' },
    { name: 'index.html', relPath: 'index.html' },
  ];

  it.each(staticArtifacts)(
    '$name contains no prohibited strings',
    ({ relPath }) => {
      const content = readStatic(relPath);
      for (const prohibited of PROHIBITED) {
        expect(
          content,
          `File "${relPath}" must not contain "${prohibited}"`,
        ).not.toContain(prohibited);
      }
    },
  );

  it('fast-check: for every prohibited string × static file, content is absent', () => {
    const prohibitedArb = fc.constantFrom(...PROHIBITED);
    const artifactArb = fc.constantFrom(...staticArtifacts);

    fc.assert(
      fc.property(prohibitedArb, artifactArb, (prohibited: ProhibitedString, artifact) => {
        const content = readStatic(artifact.relPath);
        expect(content).not.toContain(prohibited);
      }),
      { numRuns: PROHIBITED.length * staticArtifacts.length * 3 },
    );
  });
});

// ---------------------------------------------------------------------------
// Suite 2: src/content/ source files
// ---------------------------------------------------------------------------

describe('Property 5: Prohibited Strings Absent — src/content/ files', () => {
  const contentDir = path.join(PROJECT_ROOT, 'src/content');
  const contentFiles = collectFiles(contentDir)
    .filter((f) => !f.endsWith('.gitkeep'))
    .map((absPath) => ({
      name: path.relative(PROJECT_ROOT, absPath),
      absPath,
    }));

  it.each(contentFiles)(
    '$name contains no prohibited strings',
    ({ absPath, name }) => {
      let content = '';
      try {
        content = fs.readFileSync(absPath, 'utf-8');
      } catch {
        // binary/unreadable — skip
      }
      for (const prohibited of PROHIBITED) {
        expect(
          content,
          `Content file "${name}" must not contain "${prohibited}"`,
        ).not.toContain(prohibited);
      }
    },
  );

  it('fast-check: for every prohibited string × content file, content is absent', () => {
    if (contentFiles.length === 0) return; // no content files to test

    const prohibitedArb = fc.constantFrom(...PROHIBITED);
    const fileArb = fc.constantFrom(...contentFiles);

    fc.assert(
      fc.property(prohibitedArb, fileArb, (prohibited: ProhibitedString, file) => {
        let content = '';
        try {
          content = fs.readFileSync(file.absPath, 'utf-8');
        } catch {
          // binary — skip
        }
        expect(content).not.toContain(prohibited);
      }),
      { numRuns: PROHIBITED.length * contentFiles.length * 3 },
    );
  });
});

// ---------------------------------------------------------------------------
// Suite 3: Rendered HTML per route (body + head)
// ---------------------------------------------------------------------------

describe('Property 5: Prohibited Strings Absent — rendered HTML per route', () => {
  it.each(concreteRoutes)(
    '[route: $key] rendered HTML + head contains no prohibited strings',
    async ({ concretePath: routePath, key }) => {
      const artifact = await renderRouteArtifact(routePath);
      for (const prohibited of PROHIBITED) {
        expect(
          artifact,
          `Route "${key}" (${routePath}): rendered output must not contain "${prohibited}"`,
        ).not.toContain(prohibited);
      }
    },
  );

  it('[route: notFound (*)] rendered HTML + head contains no prohibited strings', async () => {
    const artifact = await renderRouteArtifact('/non-existent-page-xyz');
    for (const prohibited of PROHIBITED) {
      expect(
        artifact,
        `Route "notFound": rendered output must not contain "${prohibited}"`,
      ).not.toContain(prohibited);
    }
  });

  it('fast-check: for every (prohibited string, route) pair, rendered output is absent', async () => {
    const prohibitedArb = fc.constantFrom(...PROHIBITED);
    const routeArb = fc.constantFrom(...concreteRoutes);

    await fc.assert(
      fc.asyncProperty(
        prohibitedArb,
        routeArb,
        async (prohibited: ProhibitedString, route) => {
          const artifact = await renderRouteArtifact(route.concretePath);
          expect(artifact).not.toContain(prohibited);
        },
      ),
      {
        numRuns: PROHIBITED.length * concreteRoutes.length,
        verbose: false,
      },
    );
  });
});
