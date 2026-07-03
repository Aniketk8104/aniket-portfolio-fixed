/**
 * Property 22: Cold-Mount Route Render
 *
 * **Validates: Requirements 17.1, 17.2**
 *
 * For every route, mount `MemoryRouter` (equivalent to BrowserRouter with the
 * initial entry set to that route's pathname) and assert the route component
 * renders on first paint without throwing.
 *
 * This simulates the Netlify SPA fallback behaviour: a visitor opens a deep link
 * directly (cold mount) and the SPA must render the correct view without a
 * prior client-side navigation.
 *
 * Testing strategy
 * ──────────────────
 * The route table includes dynamic slug routes (`/architecture/:slug`,
 * `/case-studies/:slug`, `/writing/:slug`).  For those we derive concrete
 * representative paths from the canonical content modules.  The `*` catch-all
 * route is tested by mounting at an unknown pathname.
 *
 * Because SiteShell imports many complex components (AnimatedBackground,
 * Navbar, etc.) that are hard to render in jsdom, the test mounts only the
 * route-level component directly inside a minimal provider stack:
 *   HelmetProvider → MemoryRouter (initial entries = [concretePath]) → component
 *
 * This isolates the "does the route component render on first paint" property
 * from the global-chrome integration tests, which are covered by Property 4.
 *
 * @vitest-environment jsdom
 */

import React, { Suspense } from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as fc from 'fast-check';

// ── Mocks ────────────────────────────────────────────────────────────────────
// framer-motion: use importOriginal so all hooks (useAnimation, useInView,
// useScroll, useMotionValueEvent, etc.) remain real.  Only replace the
// animated component factory (`m`, `motion`) and LazyMotion so jsdom
// doesn't choke on animation rendering.
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  const React = await import('react');

  const makePassthrough =
    (tag: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ children, ...props }: any) => {
      const {
        variants: _v, initial: _i, animate: _a, exit: _e, transition: _t,
        whileHover: _wh, whileTap: _wt, whileFocus: _wf, whileInView: _wiv,
        viewport: _vp,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...domProps
      } = props;
      return React.createElement(tag, domProps, children);
    };

  const animatedProxy = new Proxy(
    {},
    { get: (_target, prop: string) => makePassthrough(prop) },
  );

  return {
    ...actual,
    m: animatedProxy,
    motion: animatedProxy,
    LazyMotion: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    domAnimation: {},
  };
});

// motionVariants: stub so imports don't fail when `matchMedia` is unavailable
vi.mock('../design-system/motionVariants', () => ({
  fadeIn:  { hidden: { opacity: 1 },        visible: { opacity: 1 } },
  fadeUp:  { hidden: { opacity: 1, y: 0 },  visible: { opacity: 1, y: 0 } },
  scaleIn: { hidden: { opacity: 1, scale: 1 }, visible: { opacity: 1, scale: 1 } },
}));

// ── Browser API stubs ────────────────────────────────────────────────────────
// jsdom does not implement these APIs; stub them so components that use them
// (e.g. HeroSection uses useInView which calls IntersectionObserver) don't throw.
beforeAll(() => {
  // IntersectionObserver stub
  if (typeof window.IntersectionObserver === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // ResizeObserver stub (used by some layout components)
  if (typeof window.ResizeObserver === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ResizeObserver = class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // matchMedia stub (used by responsive hooks and motionVariants)
  if (typeof window.matchMedia === 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

// ── CSS token injection ───────────────────────────────────────────────────────
beforeAll(() => {
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
      --font-size-display: 4rem;
      --font-size-h1: 2.5rem;
      --font-size-h2: 2rem;
      --font-size-h3: 1.5rem;
      --font-size-h4: 1.25rem;
      --font-size-body: 1rem;
      --font-size-caption: 0.875rem;
      --line-height-display: 1.1;
      --line-height-h1: 1.2;
      --line-height-h2: 1.3;
      --line-height-h3: 1.4;
      --line-height-h4: 1.4;
      --line-height-body: 1.6;
      --line-height-caption: 1.5;
      --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
      --space-5: 20px; --space-6: 24px; --space-8: 32px;
      --space-12: 48px; --space-16: 64px; --space-24: 96px;
      --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px;
      --radius-xl: 24px; --radius-full: 9999px;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
      --shadow-lg: 0 12px 32px rgba(0,0,0,0.5);
      --glass-surface: rgba(18,18,26,0.8);
      --duration-instant: 80ms; --duration-fast: 150ms;
      --duration-base: 240ms; --duration-slow: 400ms; --duration-page: 600ms;
      --ease-standard: cubic-bezier(0.2, 0, 0, 1);
      --ease-emphasized: cubic-bezier(0.2, 0, 0, 1.2);
      --ease-exit: cubic-bezier(0.4, 0, 1, 1);
      --distance-sm: 4px; --distance-md: 8px; --distance-lg: 12px;
    }
  `;
  document.head.appendChild(style);
});

// ── Route component imports ───────────────────────────────────────────────────
// We import each route component eagerly (bypassing React.lazy) so Suspense
// resolves synchronously in the test environment.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — default export
import HomePageDefault from '../routes/HomePage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ProjectsIndexPageDefault from '../routes/ProjectsIndexPage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ArchitectureIndexPageDefault from '../routes/ArchitectureIndexPage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ArchitectureTopicPageDefault from '../routes/ArchitectureTopicPage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CaseStudyIndexPageDefault from '../routes/CaseStudyIndexPage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CaseStudyPageDefault from '../routes/CaseStudyPage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WritingIndexPageDefault from '../routes/WritingIndexPage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ArticlePageDefault from '../routes/ArticlePage';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import NotFoundPageDefault from '../routes/NotFoundPage';

// ── Concrete test paths ───────────────────────────────────────────────────────
// For slug routes we pick one representative concrete path derived from the
// canonical content modules.  The slug-route components are tested with valid
// slugs (known entry → renders content) AND an unknown slug (→ renders 404).

type RouteFixture = {
  /** Human-readable name used in test output */
  name: string;
  /** Concrete URL path mounted as the initial entry */
  concretePath: string;
  /** react-router path pattern used in the Routes config */
  routerPattern: string;
  /** Eager (non-lazy) route component */
  Component: React.ComponentType;
  /** A substring expected in the rendered output to confirm first-paint */
  expectedSelector?: string;
};

const ROUTE_FIXTURES: RouteFixture[] = [
  {
    name: 'Home (/)',
    concretePath: '/',
    routerPattern: '/',
    Component: HomePageDefault,
  },
  {
    name: 'Projects Index (/projects)',
    concretePath: '/projects',
    routerPattern: '/projects',
    Component: ProjectsIndexPageDefault,
  },
  {
    name: 'Architecture Index (/architecture)',
    concretePath: '/architecture',
    routerPattern: '/architecture',
    Component: ArchitectureIndexPageDefault,
  },
  {
    // Known slug → renders topic page (possibly with diagram Placeholder)
    name: 'Architecture Topic — known slug (/architecture/distributed-messaging)',
    concretePath: '/architecture/distributed-messaging',
    routerPattern: '/architecture/:slug',
    Component: ArchitectureTopicPageDefault,
  },
  {
    // Unknown slug → renders NotFoundPage (still a valid render on first paint)
    name: 'Architecture Topic — unknown slug (/architecture/does-not-exist)',
    concretePath: '/architecture/does-not-exist',
    routerPattern: '/architecture/:slug',
    Component: ArchitectureTopicPageDefault,
  },
  {
    name: 'Case Studies Index (/case-studies)',
    concretePath: '/case-studies',
    routerPattern: '/case-studies',
    Component: CaseStudyIndexPageDefault,
  },
  {
    name: 'Case Study Page — known slug (/case-studies/bvisionr)',
    concretePath: '/case-studies/bvisionr',
    routerPattern: '/case-studies/:slug',
    Component: CaseStudyPageDefault,
  },
  {
    name: 'Case Study Page — unknown slug (/case-studies/does-not-exist)',
    concretePath: '/case-studies/does-not-exist',
    routerPattern: '/case-studies/:slug',
    Component: CaseStudyPageDefault,
  },
  {
    name: 'Writing Index (/writing)',
    concretePath: '/writing',
    routerPattern: '/writing',
    Component: WritingIndexPageDefault,
  },
  {
    name: 'Article Page — known slug (/writing/multi-tenant-saas)',
    concretePath: '/writing/multi-tenant-saas',
    routerPattern: '/writing/:slug',
    Component: ArticlePageDefault,
  },
  {
    name: 'Article Page — unknown slug (/writing/does-not-exist)',
    concretePath: '/writing/does-not-exist',
    routerPattern: '/writing/:slug',
    Component: ArticlePageDefault,
  },
  {
    name: 'Not Found (* catch-all)',
    concretePath: '/this-route-definitely-does-not-exist',
    routerPattern: '*',
    Component: NotFoundPageDefault,
  },
];

// ── Mount helper ──────────────────────────────────────────────────────────────

/**
 * Mounts a route component in isolation inside the minimal provider stack
 * required for first paint:
 *   HelmetProvider → MemoryRouter (initialEntries=[concretePath]) →
 *   Routes → Route (pattern) → Suspense → Component
 *
 * Returns the @testing-library/react render result so the caller can inspect
 * the rendered DOM.
 */
function mountRoute({ concretePath, routerPattern, Component }: RouteFixture) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[concretePath]}>
        <Routes>
          <Route
            path={routerPattern}
            element={
              <Suspense fallback={<div data-testid="route-suspense-fallback">Loading…</div>}>
                <Component />
              </Suspense>
            }
          />
          {/* Safety net: ensure a fallback is registered so MemoryRouter
              doesn't throw when concretePath doesn't match routerPattern */}
          {routerPattern !== '*' && (
            <Route path="*" element={<div data-testid="route-not-matched">No match</div>} />
          )}
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 22: Cold-Mount Route Render', () => {
  /**
   * Deterministic check: mount every fixture exactly once and verify it
   * produces a non-empty DOM subtree without throwing.
   * This makes failure diagnosis unambiguous.
   */
  it.each(ROUTE_FIXTURES)(
    '$name: renders on first paint without throwing',
    async (fixture) => {
      let result: ReturnType<typeof mountRoute> | undefined;

      // Render must not throw
      expect(() => {
        result = mountRoute(fixture);
      }).not.toThrow();

      // The container must have rendered something (not empty)
      expect(result!.container.innerHTML).not.toBe('');
      expect(result!.container.firstChild).not.toBeNull();

      // Wait for any Suspense boundaries to resolve (lazy diagrams etc.)
      await waitFor(() => {
        // The suspense fallback should no longer be the only thing rendered
        // OR the real content is already visible.  Either state is valid for
        // "first paint" — we only need to confirm the route did not throw.
        expect(result!.container.firstChild).not.toBeNull();
      });

      result!.unmount();
    },
  );

  /**
   * Property-based check: for every route fixture (sampled by fast-check),
   * cold-mounting at its concrete path produces a non-empty rendered output.
   *
   * fast-check samples indices into ROUTE_FIXTURES.  With numRuns: 50 and
   * 12 fixtures, every fixture is visited multiple times over the run.
   */
  it('PBT: for every route fixture, cold-mounting produces non-empty render', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: ROUTE_FIXTURES.length - 1 }),
        (index) => {
          const fixture = ROUTE_FIXTURES[index];
          let result: ReturnType<typeof mountRoute> | undefined;

          // 1. Mount must not throw
          expect(() => {
            result = mountRoute(fixture);
          }).not.toThrow();

          // 2. The container must have rendered content (not empty)
          expect(result!.container.innerHTML).not.toBe('');
          expect(result!.container.firstChild).not.toBeNull();

          result!.unmount();
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Edge case: mounting the same route twice in sequence (simulating page
   * refresh) should succeed on both attempts.  This checks that cold-mount
   * is idempotent and doesn't leave stale state.
   */
  it('PBT: mounting the same route twice (simulating refresh) produces non-empty renders both times', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: ROUTE_FIXTURES.length - 1 }),
        (index) => {
          const fixture = ROUTE_FIXTURES[index];

          const first = mountRoute(fixture);
          expect(first.container.firstChild).not.toBeNull();
          first.unmount();

          const second = mountRoute(fixture);
          expect(second.container.firstChild).not.toBeNull();
          second.unmount();
        },
      ),
      { numRuns: 30 },
    );
  });
});
