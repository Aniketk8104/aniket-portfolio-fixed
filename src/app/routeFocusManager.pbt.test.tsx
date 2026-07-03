/**
 * Property 26: Focus Moves to Primary Heading on Route Change
 *
 * **Validates: Requirements 16.2**
 *
 * After navigating between any pair of routes and one rAF, `document.activeElement`
 * is `main h1` (or `<main>` when no `<h1>` is mounted yet).
 *
 * Uses fast-check to enumerate route pairs and verify the focus management
 * contract holds for every combination.
 *
 * @vitest-environment jsdom
 */
import React, { useEffect } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import * as fc from 'fast-check';

import { RouteFocusManager } from './RouteFocusManager';

// ---------------------------------------------------------------------------
// Fake page components for testing
//
// Each test page renders a <main> landmark.
// Some routes include an <h1>; the "loading" route simulates Suspense fallback
// (no <h1> yet — only a <main>).
// ---------------------------------------------------------------------------

/** A page that has both <main> and <h1> — the happy path */
const PageWithH1: React.FC<{ label: string }> = ({ label }) => (
  <main data-testid="main">
    <h1 data-testid="h1">{label}</h1>
    <p>Content for {label}</p>
  </main>
);

/** A page that only has <main> but no <h1> — simulates Suspense fallback */
const PageWithoutH1: React.FC = () => (
  <main data-testid="main-no-h1">
    <p>Loading…</p>
  </main>
);

// ---------------------------------------------------------------------------
// Concrete test routes used by the property.
//
// We define a fixed set of simple routes so the Router can be fully
// resolved in jsdom without lazy-loading or heavy dependencies.
// fast-check samples pairs from this set.
// ---------------------------------------------------------------------------

const TEST_ROUTES = [
  { path: '/',           label: 'Home',          hasH1: true  },
  { path: '/projects',   label: 'Projects',      hasH1: true  },
  { path: '/writing',    label: 'Writing',        hasH1: true  },
  { path: '/about',      label: 'About',          hasH1: true  },
  { path: '/contact',    label: 'Contact',        hasH1: true  },
  { path: '/loading',    label: '(no h1)',        hasH1: false },
] as const;

type TestRoute = typeof TEST_ROUTES[number];

// ---------------------------------------------------------------------------
// Test harness
//
// We render the full router with RouteFocusManager inside it.
// A NavigatorHelper component drives programmatic navigation so we can
// trigger route changes from test code.
// ---------------------------------------------------------------------------

/**
 * A tiny helper component that navigates to `to` on mount and exposes
 * the navigate function via a ref callback for subsequent navigations.
 */
const NavigatorHelper: React.FC<{
  to: string;
  onNavigate?: (nav: ReturnType<typeof useNavigate>) => void;
}> = ({ to, onNavigate }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace: true });
    onNavigate?.(navigate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

// ---------------------------------------------------------------------------
// Helper: flush one requestAnimationFrame tick
//
// RouteFocusManager schedules its focus call inside `requestAnimationFrame`.
// In jsdom, `requestAnimationFrame` is stubbed via fake timers or vitest's
// built-in rAF. We use `vi.useFakeTimers` + `vi.runAllTimers()` to flush.
// ---------------------------------------------------------------------------

function flushRAF(): void {
  // vitest's fake timers includes rAF support
  vi.runAllTimers();
}

// ---------------------------------------------------------------------------
// Core helper: mount router, navigate from → to, flush rAF, check focus
// ---------------------------------------------------------------------------

interface FocusTestResult {
  activeElement: Element | null;
  mainH1: Element | null;
  main: Element | null;
}

function runRouteFocusTest(
  from: TestRoute,
  to: TestRoute
): FocusTestResult {
  let capturedNavigate: ReturnType<typeof useNavigate> | null = null;

  const { container, unmount } = render(
    <MemoryRouter initialEntries={[from.path]} initialIndex={0}>
      <RouteFocusManager />
      <NavigatorHelper
        to={from.path}
        onNavigate={(nav) => { capturedNavigate = nav; }}
      />
      <Routes>
        {TEST_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.hasH1
                ? <PageWithH1 label={route.label} />
                : <PageWithoutH1 />
            }
          />
        ))}
      </Routes>
    </MemoryRouter>
  );

  // Flush the rAF triggered by the initial mount at `from` path
  flushRAF();

  // Navigate from → to
  act(() => {
    capturedNavigate?.(to.path, { replace: true });
  });

  // Flush the rAF triggered by the route change
  flushRAF();

  const result: FocusTestResult = {
    activeElement: container.ownerDocument.activeElement,
    mainH1: container.querySelector('main h1'),
    main: container.querySelector('main'),
  };

  unmount();
  return result;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 26: Focus Moves to Primary Heading on Route Change', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * P26-a: For every pair of (from, to) routes where the destination has an h1,
   * after navigation + one rAF, document.activeElement must be the main h1.
   *
   * Uses fast-check to enumerate pairs from the TEST_ROUTES registry.
   */
  it('P26-a: after navigating to a route with <main><h1>, activeElement is the h1', () => {
    const routesWithH1 = TEST_ROUTES.filter((r) => r.hasH1);

    fc.assert(
      fc.property(
        // Sample any (from, to) pair — fast-check picks indices independently
        fc.integer({ min: 0, max: TEST_ROUTES.length - 1 }),
        fc.integer({ min: 0, max: routesWithH1.length - 1 }),
        (fromIdx, toIdx) => {
          vi.useFakeTimers();
          try {
            const from = TEST_ROUTES[fromIdx];
            const to = routesWithH1[toIdx];

            const { activeElement, mainH1 } = runRouteFocusTest(from, to);

            // The active element must be the h1 inside main
            expect(mainH1).not.toBeNull();
            expect(activeElement).toBe(mainH1);
            expect(activeElement?.tagName.toLowerCase()).toBe('h1');
          } finally {
            vi.useRealTimers();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * P26-b: For every pair of (from, to) routes where the destination has no h1
   * (Suspense/loading state), after navigation + one rAF, document.activeElement
   * must be the <main> element.
   *
   * Uses fast-check to enumerate from-routes.
   */
  it('P26-b: after navigating to a route without <h1>, activeElement falls back to <main>', () => {
    const routesWithoutH1 = TEST_ROUTES.filter((r) => !r.hasH1);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: TEST_ROUTES.length - 1 }),
        fc.integer({ min: 0, max: routesWithoutH1.length - 1 }),
        (fromIdx, toIdx) => {
          vi.useFakeTimers();
          try {
            const from = TEST_ROUTES[fromIdx];
            const to = routesWithoutH1[toIdx];

            const { activeElement, main } = runRouteFocusTest(from, to);

            // The active element must be the <main> landmark
            expect(main).not.toBeNull();
            expect(activeElement).toBe(main);
            expect(activeElement?.tagName.toLowerCase()).toBe('main');
          } finally {
            vi.useRealTimers();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * P26-c (deterministic): enumerate every ordered pair of test routes exactly
   * once so that a failure unambiguously identifies the offending (from, to) pair.
   */
  it.each(
    TEST_ROUTES.flatMap((from) =>
      TEST_ROUTES.map((to) => ({ from, to }))
    )
  )(
    'navigating from $from.path to $to.path focuses the correct element',
    ({ from, to }) => {
      vi.useFakeTimers();
      try {
        const { activeElement, mainH1, main } = runRouteFocusTest(from, to);

        if (to.hasH1) {
          expect(mainH1).not.toBeNull();
          expect(activeElement).toBe(mainH1);
        } else {
          expect(main).not.toBeNull();
          expect(activeElement).toBe(main);
        }
      } finally {
        vi.useRealTimers();
      }
    }
  );

  /**
   * P26-d: The focused element must have tabindex="-1" set by RouteFocusManager
   * (required so programmatically focusable elements that aren't natively
   * focusable can receive focus).
   */
  it('P26-d: focused element always has tabindex="-1" applied by RouteFocusManager', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: TEST_ROUTES.length - 1 }),
        fc.integer({ min: 0, max: TEST_ROUTES.length - 1 }),
        (fromIdx, toIdx) => {
          vi.useFakeTimers();
          try {
            const from = TEST_ROUTES[fromIdx];
            const to = TEST_ROUTES[toIdx];

            const { activeElement } = runRouteFocusTest(from, to);

            if (activeElement) {
              expect(activeElement.getAttribute('tabindex')).toBe('-1');
            }
          } finally {
            vi.useRealTimers();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
