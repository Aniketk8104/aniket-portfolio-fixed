/**
 * Property 20: Sitemap Inclusion
 *
 * **Validates: Requirements 14.3, 20.2**
 *
 * For any non-slug route in the route table, `public/sitemap.xml` contains a
 * `<loc>` entry for that route.  For any content entry across all slug-based
 * collections (caseStudies, architectureTopics, articles), the sitemap contains
 * a `<loc>` entry if and only if `entry.status === 'published'`.
 *
 * The tests are purely file-system and module-level (no DOM required):
 *   - Parse `public/sitemap.xml` to extract all `<loc>` URLs.
 *   - Derive the expected URL set from `routeTable.ts` and the content modules.
 *   - Assert inclusion / exclusion conditions via fast-check for the
 *     content-entry property.
 *
 * @module app/sitemapInclusion.pbt.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');
const SITEMAP_PATH = path.join(REPO_ROOT, 'public', 'sitemap.xml');

// ---------------------------------------------------------------------------
// Sitemap parser
// ---------------------------------------------------------------------------

/**
 * Extracts every URL found inside a `<loc>` element in the given XML string.
 * Returns a `Set<string>` of the raw URL values (no normalisation).
 */
function parseSitemapLocs(xml: string): Set<string> {
  const locs = new Set<string>();
  // Match <loc>…</loc> including whitespace
  const pattern = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    locs.add(match[1].trim());
  }
  return locs;
}

// ---------------------------------------------------------------------------
// Lazy imports — resolved at module evaluation time so Vitest's module
// resolver handles the TypeScript source files correctly.
// ---------------------------------------------------------------------------

import { routeTable } from './routeTable';
import { caseStudies } from '../content/caseStudies';
import { architectureTopics } from '../content/architectureTopics';
import { articles } from '../content/articles';

// ---------------------------------------------------------------------------
// Derived constants (computed once, before any test)
// ---------------------------------------------------------------------------

const SITE_URL = 'https://aniketdev.tech';

/**
 * Non-slug routes: every entry whose `path` does NOT contain `:` and is not
 * the catch-all `*`.
 */
const staticRoutes = routeTable.filter(
  (r) => r.path !== '*' && !r.path.includes(':'),
);

/**
 * All slug collections with their base URL patterns, used for content-entry
 * inclusion assertions.
 */
const slugCollections = [
  {
    name: 'caseStudies',
    entries: caseStudies as Array<{ slug: string; status: string }>,
    basePattern: '/case-studies/:slug',
  },
  {
    name: 'architectureTopics',
    entries: architectureTopics as Array<{ slug: string; status: string }>,
    basePattern: '/architecture/:slug',
  },
  {
    name: 'articles',
    entries: articles as Array<{ slug: string; status: string }>,
    basePattern: '/writing/:slug',
  },
] as const;

// ---------------------------------------------------------------------------
// Shared state populated in beforeAll
// ---------------------------------------------------------------------------

let sitemapContent: string;
let sitemapLocs: Set<string>;

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Property 20: Sitemap Inclusion', () => {
  beforeAll(() => {
    sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    sitemapLocs = parseSitemapLocs(sitemapContent);
  });

  // ── P20-a: sitemap.xml is a non-empty, well-formed XML file ──────────────

  it('P20-a: sitemap.xml exists and contains at least one <loc>', () => {
    expect(sitemapContent.length).toBeGreaterThan(0);
    expect(sitemapLocs.size).toBeGreaterThan(0);
  });

  it('P20-b: sitemap.xml has a valid XML declaration and urlset root', () => {
    expect(sitemapContent).toMatch(/^<\?xml\s+version="1\.0"/);
    expect(sitemapContent).toContain('<urlset');
    expect(sitemapContent).toContain('</urlset>');
  });

  // ── P20-c: Every non-slug route appears in sitemap.xml ───────────────────

  it('P20-c: every non-slug route has a corresponding <loc> in sitemap.xml', () => {
    for (const route of staticRoutes) {
      const expectedUrl = SITE_URL + route.path;
      expect(
        sitemapLocs.has(expectedUrl),
        `sitemap.xml is missing <loc> for non-slug route "${route.path}" (expected "${expectedUrl}")`,
      ).toBe(true);
    }
  });

  // ── P20-d (PBT): For every non-slug route (sampled), loc is present ──────

  it('P20-d (PBT): sampled non-slug routes all appear in sitemap.xml', () => {
    // Build an arbitrary that picks one entry from staticRoutes at random.
    const routeArb = fc.constantFrom(...staticRoutes);

    fc.assert(
      fc.property(routeArb, (route) => {
        const expectedUrl = SITE_URL + route.path;
        expect(
          sitemapLocs.has(expectedUrl),
          `Route "${route.path}" → expected URL "${expectedUrl}" not found in sitemap`,
        ).toBe(true);
      }),
      { numRuns: staticRoutes.length * 5 },
    );
  });

  // ── P20-e: Published content entries appear in sitemap.xml ───────────────

  it('P20-e: published content entries appear in sitemap.xml', () => {
    for (const { name, entries, basePattern } of slugCollections) {
      const published = entries.filter((e) => e.status === 'published');
      for (const entry of published) {
        const urlPath = basePattern.replace(':slug', entry.slug);
        const expectedUrl = SITE_URL + urlPath;
        expect(
          sitemapLocs.has(expectedUrl),
          `[${name}] Published entry slug="${entry.slug}" should appear in sitemap as "${expectedUrl}" but was not found`,
        ).toBe(true);
      }
    }
  });

  // ── P20-f: Draft content entries do NOT appear in sitemap.xml ────────────

  it('P20-f: draft content entries do NOT appear in sitemap.xml', () => {
    for (const { name, entries, basePattern } of slugCollections) {
      const drafts = entries.filter((e) => e.status !== 'published');
      for (const entry of drafts) {
        const urlPath = basePattern.replace(':slug', entry.slug);
        const expectedUrl = SITE_URL + urlPath;
        expect(
          sitemapLocs.has(expectedUrl),
          `[${name}] Draft entry slug="${entry.slug}" should NOT appear in sitemap but was found as "${expectedUrl}"`,
        ).toBe(false);
      }
    }
  });

  // ── P20-g (PBT): Content entries appear iff status === 'published' ────────

  it('P20-g (PBT): content entry is in sitemap iff status === "published"', () => {
    for (const { name, entries, basePattern } of slugCollections) {
      // Only run the property if the collection is non-empty
      if (entries.length === 0) continue;

      const entryArb = fc.constantFrom(...entries);

      fc.assert(
        fc.property(entryArb, (entry) => {
          const urlPath = basePattern.replace(':slug', entry.slug);
          const expectedUrl = SITE_URL + urlPath;
          const isInSitemap = sitemapLocs.has(expectedUrl);
          const isPublished = entry.status === 'published';

          expect(
            isInSitemap,
            isPublished
              ? `[${name}] Published entry "${entry.slug}" should be in sitemap`
              : `[${name}] Non-published entry "${entry.slug}" (status="${entry.status}") should NOT be in sitemap`,
          ).toBe(isPublished);
        }),
        { numRuns: entries.length * 5 },
      );
    }
  });

  // ── P20-h: Slug routes themselves do NOT appear as bare patterns ──────────

  it('P20-h: sitemap does not contain raw route patterns with ":slug" placeholders', () => {
    for (const route of routeTable) {
      if (!route.path.includes(':')) continue;
      // The raw pattern (e.g. "/architecture/:slug") must never appear as a loc
      const rawPattern = SITE_URL + route.path;
      expect(
        sitemapLocs.has(rawPattern),
        `Sitemap must not contain the raw route pattern "${rawPattern}" — only resolved slugs are allowed`,
      ).toBe(false);
    }
  });

  // ── P20-i: Catch-all wildcard "*" is not in sitemap ──────────────────────

  it('P20-i: sitemap does not contain the catch-all wildcard route', () => {
    const wildcardUrl = SITE_URL + '*';
    expect(
      sitemapLocs.has(wildcardUrl),
      `sitemap.xml must not contain "${wildcardUrl}"`,
    ).toBe(false);
  });

  // ── P20-j: Every loc in sitemap.xml starts with the canonical SITE_URL ───

  it('P20-j: every <loc> in sitemap.xml starts with the canonical site URL', () => {
    for (const loc of sitemapLocs) {
      expect(
        loc.startsWith(SITE_URL),
        `<loc> value "${loc}" does not start with canonical site URL "${SITE_URL}"`,
      ).toBe(true);
    }
  });

  // ── P20-k: sitemap.xml is well-formed (no unmatched loc tags) ─────────────

  it('P20-k: number of <loc> open-tags equals number of </loc> close-tags', () => {
    const openCount = (sitemapContent.match(/<loc>/g) ?? []).length;
    const closeCount = (sitemapContent.match(/<\/loc>/g) ?? []).length;
    expect(openCount).toBe(closeCount);
    expect(openCount).toBeGreaterThan(0);
  });
});
