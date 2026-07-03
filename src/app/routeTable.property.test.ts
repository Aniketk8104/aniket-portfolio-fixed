/**
 * Property 23: Route-level Code Splitting
 *
 * **Validates: Requirements 15.2, 15.3**
 *
 * For every route in the canonical route table, the registered component's
 * `$$typeof` matches React's lazy symbol (`Symbol.for('react.lazy')`).
 *
 * This property guarantees that ALL routes are code-split via `React.lazy`,
 * meaning each route module is loaded on demand rather than included in the
 * initial JS bundle.
 *
 * @module app/routeTable.property.test
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { routeTable } from './routeTable';

// ---------------------------------------------------------------------------
// React's lazy $$typeof symbol — this is the stable public symbol that React
// assigns to components returned by React.lazy().
// ---------------------------------------------------------------------------
const REACT_LAZY_SYMBOL: symbol = Symbol.for('react.lazy');

// ---------------------------------------------------------------------------
// Property 23 — Route-level Code Splitting
// ---------------------------------------------------------------------------

describe('Property 23: Route-level Code Splitting', () => {
  /**
   * P23-a: For every route entry in the route table, the component's $$typeof
   * equals Symbol.for('react.lazy').
   *
   * This is an exhaustive check over all registered routes.
   */
  it('P23-a: every route component is wrapped with React.lazy ($$typeof check)', () => {
    for (const entry of routeTable) {
      const component = entry.component as { $$typeof?: symbol };
      expect(
        component.$$typeof,
        `Route "${entry.key}" (path: "${entry.path}") component.$$typeof should be Symbol.for('react.lazy') but got ${String(component.$$typeof)}`,
      ).toBe(REACT_LAZY_SYMBOL);
    }
  });

  /**
   * P23-b: Property-based variant — using fast-check to sample individual
   * route entries and assert the lazy invariant.
   *
   * For any route entry sampled from routeTable, component.$$typeof ===
   * Symbol.for('react.lazy').
   */
  it('P23-b: sampled route entries all satisfy the lazy symbol invariant', () => {
    // Build an arbitrary that samples from the concrete route table entries
    const routeEntryArb = fc.constantFrom(...routeTable);

    fc.assert(
      fc.property(routeEntryArb, (entry) => {
        const component = entry.component as { $$typeof?: symbol };
        expect(component.$$typeof).toBe(REACT_LAZY_SYMBOL);
      }),
      { numRuns: routeTable.length * 10 },
    );
  });

  /**
   * P23-c: No route component is a raw (non-lazy) function or class.
   *
   * A non-lazy component would be a function or class without $$typeof, or
   * with $$typeof equal to Symbol.for('react.element') /
   * Symbol.for('react.forward_ref'), etc. This test guards against accidental
   * direct imports.
   */
  it('P23-c: no route component is a plain (non-lazy) function or class', () => {
    for (const entry of routeTable) {
      const component = entry.component as { $$typeof?: symbol };

      // Must not be a plain function (non-lazy components are functions/classes)
      expect(
        typeof entry.component,
        `Route "${entry.key}" component must not be a plain function — use React.lazy()`,
      ).not.toBe('function');

      // $$typeof must exist and be the lazy symbol
      expect(
        component.$$typeof,
        `Route "${entry.key}" must have $$typeof === Symbol.for('react.lazy')`,
      ).toBe(REACT_LAZY_SYMBOL);
    }
  });

  /**
   * P23-d: routeTable is non-empty — there must be at least one route to split.
   * This guards against a misconfigured or empty route table.
   */
  it('P23-d: route table contains at least one route entry', () => {
    expect(routeTable.length).toBeGreaterThan(0);
  });

  /**
   * P23-e: Every route entry has a unique path — duplicate paths would mean one
   * of the lazy components would never be reached, defeating the purpose of code
   * splitting.
   */
  it('P23-e: all route paths are unique (no duplicate registrations)', () => {
    const paths = routeTable.map((entry) => entry.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });
});
