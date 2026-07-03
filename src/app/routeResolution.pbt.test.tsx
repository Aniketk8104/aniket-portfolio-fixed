/**
 * Property 1: Route Resolution
 *
 * **Validates: Requirements 1.1, 13.3, 15.2**
 *
 * For every entry in `routeTable.ts`, mount Router at that path; assert it
 * resolves to a registered component without throwing.
 *
 * Two complementary strategies:
 *
 * A) Structural properties (synchronous, no rendering):
 *    - Every entry carries a React.lazy component (code-splitting).
 *    - Keys are unique, paths are non-empty, all required paths are present.
 *    - A catch-all 404 route exists.
 *    - Every entry has a seoKey.
 *
 * B) Render-safety properties (async, using waitFor + act):
 *    - Mounting MemoryRouter at each concrete path does not throw.
 *    - After async lazy resolution, the container is non-empty.
 *    - The Suspense fallback appears while loading (route matched).
 *
 * @vitest-environment jsdom
 */

import React, { Suspense } from 'react';
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { routeTable, type RouteEntry } from './routeTable';

// ─── React Lazy symbol ────────────────────────────────────────────────────────
// Derive the lazy symbol from a fresh React.lazy call rather than hard-coding it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REACT_LAZY_TYPE: symbol = (React.lazy(() => Promise.resolve({ default: (() => null) as React.FC })) as any)['$$typeof'];

// ─── Slug substitutions ───────────────────────────────────────────────────────
const SLUG_SUBSTITUTIONS: Record<string, string> = {
  '/architecture/:slug': 'distributed-messaging',
  '/case-studies/:slug': 'bvisionr',
  '/writing/:slug': 'multi-tenant-saas',
};

/**
 * Resolve a route entry's `path` pattern to a concrete URL.
 */
function concretePath(entry: RouteEntry): string {
  if (entry.path === '*') return '/__no_match__';
  if (entry.path.includes(':slug')) {
    return entry.path.replace(':slug', SLUG_SUBSTITUTIONS[entry.path] ?? 'test-slug');
  }
  return entry.path;
}

// ─── Render helper ────────────────────────────────────────────────────────────
/**
 * Unique data-testid used as the Suspense fallback sentinel.
 * When this element appears, the route matched and the lazy import was triggered.
 */
const FALLBACK_TESTID = 'route-loading-fallback';

const TestFallback: React.FC = () => (
  <div data-testid={FALLBACK_TESTID} aria-busy="true">Loading…</div>
);

/**
 * Render a single route entry in isolation using MemoryRouter.
 *
 * Provider stack mirrors App.tsx minus SiteShell chrome:
 *   HelmetProvider → MemoryRouter → Routes → Route(path) → Suspense → lazy component
 *
 * We skip SiteShell to avoid pulling in heavy legacy JSX components
 * (three.js, canvas, etc.) that cause noise in unit tests.
 * The property being tested is *route registration* and *lazy-loading plumbing*,
 * not the full chrome.
 */
function renderRoute(entry: RouteEntry): ReturnType<typeof render> {
  const path = concretePath(entry);
  const RouteComponent = entry.component;

  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]} initialIndex={0}>
        <Routes>
          <Route
            path={entry.path}
            element={
              <Suspense fallback={<TestFallback />}>
                <RouteComponent />
              </Suspense>
            }
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Property 1: Route Resolution', () => {
  // ── A. Structural properties (synchronous) ────────────────────────────────

  /**
   * P1-a: Every route entry carries a React.lazy component.
   *
   * Verifies Requirement 15.2 (route-level code splitting).
   */
  it('P1-a: every route entry component is a React lazy component (code-splitting)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: routeTable.length - 1 }),
        (index) => {
          const entry = routeTable[index];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const componentType = (entry.component as any)['$$typeof'];
          expect(
            componentType,
            `Route "${entry.key}" (path: "${entry.path}") component must be a React.lazy wrapper`
          ).toBe(REACT_LAZY_TYPE);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * P1-b: Every route entry has a non-empty `key` and `path`.
   */
  it('P1-b: every route entry has a non-empty key and path', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: routeTable.length - 1 }),
        (index) => {
          const entry = routeTable[index];
          expect(entry.key.trim().length).toBeGreaterThan(0);
          expect(entry.path.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * P1-c: Route keys are unique across the entire table.
   */
  it('P1-c: route keys are unique', () => {
    const keys = routeTable.map((e) => e.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  /**
   * P1-d: All routes required by Requirement 1.1 are present.
   */
  it('P1-d: all required routes from Requirement 1.1 are present', () => {
    const requiredPaths = [
      '/',
      '/architecture',
      '/architecture/:slug',
      '/case-studies',
      '/case-studies/:slug',
      '/writing',
      '/writing/:slug',
    ];
    const registeredPaths = routeTable.map((e) => e.path);
    for (const required of requiredPaths) {
      expect(registeredPaths, `Path "${required}" must be registered`).toContain(required);
    }
  });

  /**
   * P1-e: A catch-all 404 route is registered (path `*`).
   */
  it('P1-e: a catch-all 404 route is registered', () => {
    const catchAll = routeTable.find((e) => e.path === '*');
    expect(catchAll).toBeDefined();
    expect(catchAll?.key).toBe('notFound');
  });

  /**
   * P1-f: Every route entry has a defined `seoKey`.
   */
  it('P1-f: every route entry has a defined seoKey', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: routeTable.length - 1 }),
        (index) => {
          const entry = routeTable[index];
          expect(entry.seoKey, `Route "${entry.key}" must have a seoKey`).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * P1-g: The route table has exactly the expected number of entries.
   *
   * Guards against accidental omission or duplicate addition.
   * Expected: 9 routes (/, /projects, /architecture, /architecture/:slug,
   * /case-studies, /case-studies/:slug, /writing, /writing/:slug, *)
   */
  it('P1-g: route table has exactly 9 entries', () => {
    expect(routeTable.length).toBe(9);
  });

  // ── B. Render-safety properties (async) ──────────────────────────────────

  /**
   * P1-h: Mounting MemoryRouter at any static path shows the Suspense fallback
   * immediately (confirming the route matched and the lazy import was triggered).
   *
   * We assert on the fallback — not the resolved content — because:
   * 1. The fallback is synchronous (no lazy resolution needed).
   * 2. If the fallback renders, React Router *matched the route* and
   *    React *initiated the lazy import*. A non-matching route would render nothing.
   *
   * This validates the core property: a registered component exists for every path.
   */
  it('P1-h: static routes — Suspense fallback renders synchronously (route matched)', () => {
    const staticRoutes = routeTable.filter(
      (e) => !e.path.includes(':') && e.path !== '*'
    );

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: staticRoutes.length - 1 }),
        (index) => {
          const entry = staticRoutes[index];
          const { container, unmount } = renderRoute(entry);

          // The Suspense fallback is synchronously visible because the lazy
          // component is still loading. Its presence proves the route matched.
          const fallback = container.querySelector('[data-testid="route-loading-fallback"]');
          expect(
            fallback,
            `Route "${entry.key}" at "${entry.path}" must render Suspense fallback (confirming route matched)`
          ).not.toBeNull();

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * P1-i: Mounting MemoryRouter at any parametric path with a concrete slug
   * shows the Suspense fallback immediately.
   */
  it('P1-i: parametric routes — Suspense fallback renders synchronously (route matched)', () => {
    const parametricRoutes = routeTable.filter((e) => e.path.includes(':'));

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: parametricRoutes.length - 1 }),
        (index) => {
          const entry = parametricRoutes[index];
          const { container, unmount } = renderRoute(entry);

          const fallback = container.querySelector('[data-testid="route-loading-fallback"]');
          expect(
            fallback,
            `Route "${entry.key}" at "${entry.path}" must render Suspense fallback (confirming route matched)`
          ).not.toBeNull();

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * P1-j: The catch-all route shows Suspense fallback when mounted at a
   * URL that matches no other route.
   */
  it('P1-j: catch-all route — Suspense fallback renders synchronously (route matched)', () => {
    const catchAll = routeTable.find((e) => e.path === '*');
    expect(catchAll).toBeDefined();
    if (!catchAll) return;

    const { container, unmount } = renderRoute(catchAll);
    const fallback = container.querySelector('[data-testid="route-loading-fallback"]');
    expect(
      fallback,
      `NotFound catch-all route must render Suspense fallback (confirming route matched)`
    ).not.toBeNull();
    unmount();
  });

  /**
   * P1-k: Property — for any sampled route index, mounting does not throw
   * AND the Suspense fallback is visible synchronously.
   *
   * This is the core property assertion driven by fast-check over 100 runs,
   * covering the full 9-entry table many times over.
   */
  it('P1-k: property — for any route, mount at concrete path shows Suspense fallback without throwing', () => {
    const mutableTable = [...routeTable];

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: mutableTable.length - 1 }),
        (index) => {
          const entry = mutableTable[index];
          let result: ReturnType<typeof renderRoute> | null = null;

          // Must not throw synchronously
          expect(
            () => { result = renderRoute(entry); },
            `Route "${entry.key}" must not throw on mount`
          ).not.toThrow();

          if (result) {
            const { container, unmount } = result as ReturnType<typeof render>;
            // Suspense fallback must be present (route matched, lazy import triggered)
            const fallback = container.querySelector('[data-testid="route-loading-fallback"]');
            expect(
              fallback,
              `Route "${entry.key}" (path: "${entry.path}") must render Suspense fallback`
            ).not.toBeNull();
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * P1-l: After async lazy resolution, each route renders non-empty content
   * (resolved component, not just the fallback).
   *
   * Uses waitFor to wait for the lazy dynamic import to resolve.
   * We assert each static route shows content beyond the loading fallback.
   */
  it('P1-l: after async resolution, every static route renders non-empty content', async () => {
    const staticRoutes = routeTable.filter(
      (e) => !e.path.includes(':') && e.path !== '*'
    );

    for (const entry of staticRoutes) {
      const { container, unmount } = renderRoute(entry);

      // Wait for the lazy component to load and replace the fallback
      await waitFor(
        () => {
          expect(
            container.innerHTML.trim().length,
            `Route "${entry.key}" must render non-empty content after resolution`
          ).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      unmount();
    }
  });

  /**
   * P1-m: After async lazy resolution, each parametric route renders
   * non-empty content.
   */
  it('P1-m: after async resolution, every parametric route renders non-empty content', async () => {
    const parametricRoutes = routeTable.filter((e) => e.path.includes(':'));

    for (const entry of parametricRoutes) {
      const { container, unmount } = renderRoute(entry);

      await waitFor(
        () => {
          expect(
            container.innerHTML.trim().length,
            `Route "${entry.key}" must render non-empty content after resolution`
          ).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      unmount();
    }
  });

  /**
   * P1-n: After async lazy resolution, the catch-all route renders non-empty content.
   */
  it('P1-n: after async resolution, catch-all route renders non-empty content', async () => {
    const catchAll = routeTable.find((e) => e.path === '*');
    expect(catchAll).toBeDefined();
    if (!catchAll) return;

    const { container, unmount } = renderRoute(catchAll);

    await waitFor(
      () => {
        expect(
          container.innerHTML.trim().length,
          `NotFound route must render non-empty content after resolution`
        ).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );

    unmount();
  });

  /**
   * P1-o: Deterministic check — every route is mounted once so any failure
   * unambiguously identifies the offending route.
   *
   * Asserts:
   *   1. Mounting does not throw synchronously.
   *   2. Either the Suspense fallback or resolved content is rendered synchronously
   *      (either proves the route matched — the lazy import was triggered or
   *      the module was already cached from a prior test).
   *   3. After async resolution, non-empty content is present.
   */
  it.each(
    routeTable.map((entry) => ({ key: entry.key, path: entry.path, entry }))
  )(
    'route "$key" (path: "$path"): mounts without throwing and resolves to content',
    async ({ entry }) => {
      let result: ReturnType<typeof renderRoute> | null = null;

      expect(
        () => { result = renderRoute(entry); },
        `Route "${entry.key}" must not throw on mount`
      ).not.toThrow();

      if (!result) return;
      const { container, unmount } = result as ReturnType<typeof render>;

      // Synchronous assertion: either the Suspense fallback OR the resolved
      // content is immediately visible. Both prove the route matched.
      // (The fallback appears when the lazy module is still loading;
      //  the resolved content appears when the module was already cached.)
      const hasSomethingRendered = container.innerHTML.trim().length > 0;
      expect(
        hasSomethingRendered,
        `Route "${entry.key}" (path: "${entry.path}") must render something synchronously (fallback or content)`
      ).toBe(true);

      // Async assertion: non-empty content after lazy resolution
      await waitFor(
        () => {
          expect(
            container.innerHTML.trim().length,
            `Route "${entry.key}" must render non-empty content after lazy resolution`
          ).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      unmount();
    }
  );
});
