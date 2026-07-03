/**
 * Property 29: Robots and Sitemap Consistency
 *
 * **Validates: Requirements 20.3**
 *
 * For every route in `routeTable.ts`, `robots.txt` has no `Disallow` matching
 * the route and includes a `Sitemap:` line pointing at `sitemap.xml`.
 *
 * @module app/robotsSitemapConsistency.pbt.test
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');
const ROBOTS_PATH = path.join(REPO_ROOT, 'public', 'robots.txt');

// ---------------------------------------------------------------------------
// Parse robots.txt
// ---------------------------------------------------------------------------

interface RobotsParsed {
  /**
   * `Disallow:` values from the wildcard (`User-agent: *`) block only.
   * Per RFC 9309, rules for specific bots do not apply to crawlers in general;
   * only the `*` block constrains all crawlers (and therefore must not block
   * application routes).
   */
  wildcardDisallowDirectives: string[];
  /** All `Sitemap:` values found (global, not inside any user-agent block) */
  sitemapLines: string[];
}

function parseRobotsTxt(content: string): RobotsParsed {
  const wildcardDisallowDirectives: string[] = [];
  const sitemapLines: string[] = [];

  // Track whether the current block applies to `User-agent: *`
  let inWildcardBlock = false;
  // A blank line resets the current user-agent block
  let currentAgents: string[] = [];

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    // Blank line → end of current record
    if (!line) {
      currentAgents = [];
      inWildcardBlock = false;
      continue;
    }

    if (line.startsWith('#')) continue;

    const lower = line.toLowerCase();

    if (lower.startsWith('user-agent:')) {
      const agent = line.slice('user-agent:'.length).trim().toLowerCase();
      currentAgents.push(agent);
      if (agent === '*') inWildcardBlock = true;
    } else if (lower.startsWith('disallow:')) {
      const value = line.slice('disallow:'.length).trim();
      if (value.length > 0 && inWildcardBlock) {
        wildcardDisallowDirectives.push(value);
      }
    } else if (lower.startsWith('sitemap:')) {
      const value = line.slice('sitemap:'.length).trim();
      if (value.length > 0) {
        sitemapLines.push(value);
      }
    }
  }

  return { wildcardDisallowDirectives, sitemapLines };
}

// ---------------------------------------------------------------------------
// Disallow matching
// ---------------------------------------------------------------------------

/**
 * Returns true if a robots.txt `Disallow` directive covers the given path.
 *
 * Per RFC 9309 semantics:
 * - Empty string disallows nothing (handled by filtering empties above).
 * - A trailing `*` is treated as a prefix wildcard.
 * - Otherwise, the directive is a prefix match.
 */
function isDisallowedByDirective(directive: string, testPath: string): boolean {
  // Wildcard suffix: e.g. "/api/*" → covers "/api/anything"
  if (directive.endsWith('*')) {
    const prefix = directive.slice(0, -1);
    return testPath === prefix || testPath.startsWith(prefix);
  }

  // Standard prefix match
  return testPath === directive || testPath.startsWith(directive);
}

function isDisallowed(disallowDirectives: string[], testPath: string): boolean {
  return disallowDirectives.some((d) => isDisallowedByDirective(d, testPath));
}

// ---------------------------------------------------------------------------
// Route extraction — static paths only (exclude dynamic and wildcard)
// ---------------------------------------------------------------------------

/**
 * Extracts the concrete (non-parameterized, non-wildcard) path prefix from a
 * route entry's `path` string.
 *
 * Examples:
 *   "/"                    → "/"
 *   "/projects"            → "/projects"
 *   "/architecture/:slug"  → "/architecture"   (prefix used for disallow check)
 *   "*"                    → null              (skip)
 */
function concretePathPrefix(routePath: string): string | null {
  if (routePath === '*') return null;

  // Strip any dynamic segment (":param") and everything after it
  const parts = routePath.split('/');
  const concrete: string[] = [];
  for (const part of parts) {
    if (part.startsWith(':')) break;
    concrete.push(part);
  }

  const result = concrete.join('/') || '/';
  return result;
}

// ---------------------------------------------------------------------------
// Route table — imported statically to avoid lazy() side-effects in tests
// ---------------------------------------------------------------------------

// We import the raw module to read route paths without triggering React.lazy
import { routeTable } from './routeTable';

const concreteRoutes = routeTable
  .map((r) => concretePathPrefix(r.path))
  .filter((p): p is string => p !== null);

// ---------------------------------------------------------------------------
// Load robots.txt once
// ---------------------------------------------------------------------------

const robotsContent = fs.readFileSync(ROBOTS_PATH, 'utf-8');
const { wildcardDisallowDirectives, sitemapLines } = parseRobotsTxt(robotsContent);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 29: Robots and Sitemap Consistency', () => {
  /**
   * P29-a: `robots.txt` contains at least one `Sitemap:` line pointing at
   * `sitemap.xml`.
   */
  it('P29-a: robots.txt has a Sitemap: line referencing sitemap.xml', () => {
    const hasSitemap = sitemapLines.some((line) => line.includes('sitemap.xml'));
    expect(
      hasSitemap,
      `Expected robots.txt to contain a "Sitemap:" line that includes "sitemap.xml".\nFound Sitemap lines: ${JSON.stringify(sitemapLines)}`,
    ).toBe(true);
  });

  /**
   * P29-b: For every concrete (non-wildcard) route path in routeTable.ts,
   * no `Disallow:` directive in robots.txt covers it.
   *
   * This is an exhaustive check over all concrete routes.
   */
  it('P29-b: no Disallow directive in robots.txt covers any application route', () => {
    for (const routePath of concreteRoutes) {
      const blocked = isDisallowed(wildcardDisallowDirectives, routePath);
      expect(
        blocked,
        `robots.txt has a Disallow directive (under User-agent: *) that covers route "${routePath}".\n` +
          `Wildcard Disallow directives: ${JSON.stringify(wildcardDisallowDirectives)}`,
      ).toBe(false);
    }
  });

  /**
   * P29-c (PBT): Property-based sampling of routes from routeTable.ts —
   * for a random subset of concrete routes, none are blocked by any Disallow
   * directive.
   *
   * Uses fast-check to sample from the concrete route set across many runs.
   */
  it('P29-c (PBT): sampled routes are not covered by any Disallow directive', () => {
    // Build an arbitrary that picks one concrete route from the table
    const routeArb = fc.constantFrom(...concreteRoutes);

    fc.assert(
      fc.property(routeArb, (routePath) => {
        const blocked = isDisallowed(wildcardDisallowDirectives, routePath);
        expect(
          blocked,
          `Sampled route "${routePath}" is covered by a Disallow directive (User-agent: *) in robots.txt.\n` +
            `Wildcard Disallow directives: ${JSON.stringify(wildcardDisallowDirectives)}`,
        ).toBe(false);
        return !blocked;
      }),
      { numRuns: 500 },
    );
  });

  /**
   * P29-d: Consistency check — the Sitemap: URL in robots.txt is absolute
   * (starts with http:// or https://) and ends with sitemap.xml.
   */
  it('P29-d: Sitemap: URL in robots.txt is absolute and ends with sitemap.xml', () => {
    const absoluteSitemaps = sitemapLines.filter(
      (line) =>
        (line.startsWith('http://') || line.startsWith('https://')) &&
        line.endsWith('sitemap.xml'),
    );
    expect(
      absoluteSitemaps.length,
      `Expected at least one absolute Sitemap: URL ending in "sitemap.xml".\nFound: ${JSON.stringify(sitemapLines)}`,
    ).toBeGreaterThanOrEqual(1);
  });

  /**
   * P29-e: Snapshot check — the known application route paths are the ones
   * being tested. Fails fast if routeTable changes without updating this test.
   */
  it('P29-e: concrete route paths extracted from routeTable match expected set', () => {
    const expectedConcretePaths = [
      '/',
      '/projects',
      '/architecture',
      '/architecture', // /architecture/:slug → prefix "/architecture"
      '/case-studies',
      '/case-studies', // /case-studies/:slug → prefix "/case-studies"
      '/writing',
      '/writing', // /writing/:slug → prefix "/writing"
      // '*' is excluded
    ];

    // We just assert that each expected path appears in the extracted set
    for (const expected of new Set(expectedConcretePaths)) {
      expect(
        concreteRoutes,
        `Expected route path "${expected}" to be present in extracted concrete routes`,
      ).toContain(expected);
    }
  });
});
