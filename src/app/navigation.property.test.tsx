/**
 * Property 2: Client-side Navigation Preserves Document
 *
 * **Validates: Requirements 1.3**
 *
 * For all `(from, to)` route pairs in the canonical route table, navigating
 * from `from` to `to` via react-router-dom updates the URL in the router's
 * history without firing a full-document unload event.
 *
 * "Preserves document" means:
 *   1. No `beforeunload` event is dispatched on the window.
 *   2. The `document` object identity is unchanged before and after navigation
 *      (same JSDOM instance — no page reload occurred).
 *   3. The router's in-memory location reflects the new `to` path after navigation.
 *
 * Implementation notes
 * ───────────────────
 * We use `MemoryRouter` (not `BrowserRouter`) so the test environment's
 * JSDOM does not need a real server.  Each route in the table is mapped to a
 * lightweight stub component that just renders the route key.  A helper
 * component (`NavigatorCapture`) renders inside the router context and
 * captures the `navigate` function imperatively; navigation is then driven by
 * calling the captured reference inside `act()` so React flushes all
 * synchronous state updates before assertions.
 *
 * The concrete paths used for slug routes replace `:slug` with a stable
 * sentinel value so the router resolves them without requiring live content.
 *
 * @module app/navigation.property.test
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import {
  MemoryRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  NavigateFunction,
} from 'react-router-dom';
import * as fc from 'fast-check';

import { routeTable } from './routeTable';

// ---------------------------------------------------------------------------
// Concrete route paths
//
// Replace `:slug` parameters with a stable sentinel so every route resolves
// in the MemoryRouter without requiring real content.
// ---------------------------------------------------------------------------

const SLUG_SENTINEL = 'test-slug';

/**
 * Returns a concrete path string usable as a MemoryRouter `initialEntries`
 * element or as a navigation target.
 */
function concretePath(pattern: string): string {
  return pattern.replace(/:slug/g, SLUG_SENTINEL).replace(/\*/g, '');
}

/** Concrete (non-wildcard) path entries for all route table entries */
const concreteRoutes: Array<{ key: string; pattern: string; path: string }> =
  routeTable.map((entry) => ({
    key: entry.key,
    pattern: entry.path,
    path: concretePath(entry.path),
  }));

// Navigable routes: exclude the wildcard "*" catch-all when used as `from`
// (it has an empty string path after substitution which isn't meaningful as a
// starting location).
const navigableConcreteRoutes = concreteRoutes.filter(
  (r) => r.path.length > 0,
);

// ---------------------------------------------------------------------------
// Stub route components
//
// Lightweight components that just render their route key as an accessible
// heading.  Avoids pulling in heavy dependencies (lazy content, etc.) while
// still exercising the routing layer.
// ---------------------------------------------------------------------------

function makeStub(label: string): React.FC {
  const Stub: React.FC = () => <h1 data-testid="route-stub">{label}</h1>;
  Stub.displayName = `RouteStub(${label})`;
  return Stub;
}

const stubs: Record<string, React.FC> = Object.fromEntries(
  routeTable.map((entry) => [entry.key, makeStub(entry.key)]),
);

// ---------------------------------------------------------------------------
// LocationDisplay — renders the current pathname so tests can read it
// ---------------------------------------------------------------------------

const LocationDisplay: React.FC = () => {
  const { pathname } = useLocation();
  return <span data-testid="location">{pathname}</span>;
};

// ---------------------------------------------------------------------------
// NavigatorCapture — captures the navigate function and location into refs
// so the parent can invoke navigation imperatively after mount.
// ---------------------------------------------------------------------------

interface NavigatorCaptureProps {
  navigateRef: React.MutableRefObject<NavigateFunction | null>;
  locationRef: React.MutableRefObject<string>;
}

const NavigatorCapture: React.FC<NavigatorCaptureProps> = ({
  navigateRef,
  locationRef,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Capture the latest navigate function and current pathname on every render
  navigateRef.current = navigate;
  locationRef.current = pathname;

  return null;
};

// ---------------------------------------------------------------------------
// renderRouterHarness
//
// Renders a MemoryRouter starting at `from` with all stub routes registered.
// Returns refs that let the caller drive navigation imperatively.
// ---------------------------------------------------------------------------

interface HarnessResult {
  navigateRef: React.MutableRefObject<NavigateFunction | null>;
  locationRef: React.MutableRefObject<string>;
  container: HTMLElement;
  unmount: () => void;
}

function renderRouterHarness(from: string): HarnessResult {
  const navigateRef = React.createRef() as React.MutableRefObject<NavigateFunction | null>;
  navigateRef.current = null;
  const locationRef = React.createRef() as React.MutableRefObject<string>;
  locationRef.current = from;

  const { container, unmount } = render(
    <MemoryRouter initialEntries={[from]} initialIndex={0}>
      <LocationDisplay />
      <NavigatorCapture navigateRef={navigateRef} locationRef={locationRef} />
      <Routes>
        {routeTable.map((entry) => {
          const Stub = stubs[entry.key];
          return <Route key={entry.key} path={entry.path} element={<Stub />} />;
        })}
      </Routes>
    </MemoryRouter>,
  );

  return { navigateRef, locationRef, container, unmount };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 2: Client-side Navigation Preserves Document', () => {
  let beforeUnloadFired: boolean;
  let handleBeforeUnload: () => void;

  beforeEach(() => {
    beforeUnloadFired = false;
    handleBeforeUnload = () => {
      beforeUnloadFired = true;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  afterEach(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  // -------------------------------------------------------------------------
  // P2-a: navigation does not fire beforeunload
  // -------------------------------------------------------------------------

  it('P2-a: navigation between any (from, to) pair does not fire a beforeunload event', () => {
    const routeIndexArb = fc.integer({
      min: 0,
      max: navigableConcreteRoutes.length - 1,
    });

    fc.assert(
      fc.property(routeIndexArb, routeIndexArb, (fromIdx, toIdx) => {
        const from = navigableConcreteRoutes[fromIdx].path;
        const to = navigableConcreteRoutes[toIdx].path;

        let harness!: HarnessResult;

        act(() => {
          harness = renderRouterHarness(from);
        });

        // Navigate to `to` inside act so React flushes state updates
        act(() => {
          harness.navigateRef.current!(to);
        });

        // Core property: no full-document unload fired during navigation
        expect(beforeUnloadFired).toBe(false);

        act(() => {
          harness.unmount();
        });
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // P2-b: document identity is preserved after navigation
  // -------------------------------------------------------------------------

  it('P2-b: document object is the same instance before and after navigation', () => {
    const routeIndexArb = fc.integer({
      min: 0,
      max: navigableConcreteRoutes.length - 1,
    });

    fc.assert(
      fc.property(routeIndexArb, routeIndexArb, (fromIdx, toIdx) => {
        const from = navigableConcreteRoutes[fromIdx].path;
        const to = navigableConcreteRoutes[toIdx].path;

        const documentBefore = document;

        let harness!: HarnessResult;

        act(() => {
          harness = renderRouterHarness(from);
        });

        act(() => {
          harness.navigateRef.current!(to);
        });

        const documentAfter = document;

        // Same JSDOM document object — no reload occurred
        expect(documentAfter).toBe(documentBefore);

        act(() => {
          harness.unmount();
        });
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // P2-c: router location reflects the `to` path after navigation
  // -------------------------------------------------------------------------

  it('P2-c: router location reflects the `to` path after navigation', () => {
    const routeIndexArb = fc.integer({
      min: 0,
      max: navigableConcreteRoutes.length - 1,
    });

    fc.assert(
      fc.property(routeIndexArb, routeIndexArb, (fromIdx, toIdx) => {
        const from = navigableConcreteRoutes[fromIdx].path;
        const to = navigableConcreteRoutes[toIdx].path;

        let harness!: HarnessResult;

        act(() => {
          harness = renderRouterHarness(from);
        });

        act(() => {
          harness.navigateRef.current!(to);
        });

        // LocationDisplay renders the current pathname; check the in-memory ref
        // locationRef is updated synchronously when NavigatorCapture re-renders
        const expectedPath = to === '' ? '/' : to;
        expect(harness.locationRef.current).toBe(expectedPath);

        // No full-document unload
        expect(beforeUnloadFired).toBe(false);

        act(() => {
          harness.unmount();
        });
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // P2-d: exhaustive all-pairs spot check (n^2 for small n)
  //
  // Enumerate every (from, to) pair explicitly to complement the random
  // sampling above and guarantee full coverage of the current route table.
  // -------------------------------------------------------------------------

  it('P2-d: every explicit (from, to) pair in the route table preserves the document', () => {
    for (const fromRoute of navigableConcreteRoutes) {
      for (const toRoute of navigableConcreteRoutes) {
        const from = fromRoute.path;
        const to = toRoute.path;

        let harness!: HarnessResult;

        act(() => {
          harness = renderRouterHarness(from);
        });

        act(() => {
          harness.navigateRef.current!(to);
        });

        expect(beforeUnloadFired).toBe(false);

        act(() => {
          harness.unmount();
        });
      }
    }
  });
});
