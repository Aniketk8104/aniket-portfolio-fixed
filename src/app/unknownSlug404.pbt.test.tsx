/**
 * Property 3: Unknown Slug Falls Back to 404
 *
 * **Validates: Requirements 1.4**
 *
 * For any slug not present in the corresponding collection, navigating to
 * `/architecture/:slug`, `/case-studies/:slug`, or `/writing/:slug` renders
 * `NotFoundPage` with a link to `/`.
 *
 * Strategy:
 *   - Collect known slugs from each content module.
 *   - Use fast-check to generate strings that are NOT in those slug sets
 *     (filter/map with `fc.string` constrained to URL-safe chars).
 *   - Render the detail page component directly in a MemoryRouter at the
 *     unknown path, mirroring how App.tsx mounts route components.
 *   - Assert: "Page not found" text is visible (NotFoundPage headline).
 *   - Assert: A link `href="/"` is present in the rendered tree.
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// --- Content modules (known slugs) -----------------------------------------
import { architectureTopics } from '../content/architectureTopics';
import { caseStudies } from '../content/caseStudies';
import { articles } from '../content/articles';

// --- Route page components (rendered directly, not via routeTable lazy) -----
import ArchitectureTopicPage from '../routes/ArchitectureTopicPage';
import CaseStudyPage from '../routes/CaseStudyPage';
import ArticlePage from '../routes/ArticlePage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Known slug sets for each collection. */
const KNOWN_ARCHITECTURE_SLUGS = new Set(architectureTopics.map((t) => t.slug));
const KNOWN_CASE_STUDY_SLUGS = new Set(caseStudies.map((cs) => cs.slug));
const KNOWN_ARTICLE_SLUGS = new Set(articles.map((a) => a.slug));

/**
 * fast-check arbitrary that produces a slug-like string that is NOT in
 * the given known-slugs set.
 *
 * We constrain to lowercase letters, digits, and hyphens (valid URL slugs),
 * 1–40 chars, then filter out any slug that accidentally matches a known one.
 * Because the known sets are small (≤7 entries each), the filter hits ~0% of
 * the time, making this efficient.
 */
function unknownSlugArb(knownSlugs: ReadonlySet<string>): fc.Arbitrary<string> {
  return fc
    .stringMatching(/^[a-z][a-z0-9-]{0,38}[a-z0-9]$/)
    .filter((s) => !knownSlugs.has(s));
}

/**
 * Render a detail page at `/:slug` with an unknown slug value.
 *
 * We use the concrete component (not the lazy wrapper from routeTable) so the
 * test is synchronous — no Suspense boundary needed for the top-level render.
 * This mirrors what React Router does after the lazy module resolves.
 */
function renderAtUnknownSlug(
  RouteComponent: React.FC,
  basePath: string,
  slug: string
): ReturnType<typeof render> {
  const path = `${basePath}/${slug}`;
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]} initialIndex={0}>
        <Routes>
          <Route path={`${basePath}/:slug`} element={<RouteComponent />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

/**
 * Assert that the rendered tree shows the NotFoundPage:
 *   1. "Page not found" heading is visible.
 *   2. A link to "/" is present.
 */
function assertNotFoundPage(container: HTMLElement): void {
  // Heading check — NotFoundPage renders <h1>Page not found</h1>
  const heading = container.querySelector('h1');
  expect(heading, 'NotFoundPage must render an <h1> element').not.toBeNull();
  expect(heading?.textContent?.trim()).toMatch(/page not found/i);

  // Link-to-root check — NotFoundPage renders <a href="/">
  const homeLink = container.querySelector('a[href="/"]');
  expect(homeLink, 'NotFoundPage must render a link to "/"').not.toBeNull();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 3: Unknown Slug Falls Back to 404', () => {
  /**
   * P3-a (property): /architecture/:unknown-slug → NotFoundPage
   *
   * For any slug not present in architectureTopics, ArchitectureTopicPage
   * renders NotFoundPage with a link to /.
   */
  it('P3-a: /architecture/:unknownSlug renders NotFoundPage with link to /', () => {
    fc.assert(
      fc.property(unknownSlugArb(KNOWN_ARCHITECTURE_SLUGS), (slug) => {
        const { container, unmount } = renderAtUnknownSlug(
          ArchitectureTopicPage as React.FC,
          '/architecture',
          slug
        );
        assertNotFoundPage(container);
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * P3-b (property): /case-studies/:unknown-slug → NotFoundPage
   *
   * For any slug not present in caseStudies, CaseStudyPage renders
   * NotFoundPage with a link to /.
   */
  it('P3-b: /case-studies/:unknownSlug renders NotFoundPage with link to /', () => {
    fc.assert(
      fc.property(unknownSlugArb(KNOWN_CASE_STUDY_SLUGS), (slug) => {
        const { container, unmount } = renderAtUnknownSlug(
          CaseStudyPage as React.FC,
          '/case-studies',
          slug
        );
        assertNotFoundPage(container);
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * P3-c (property): /writing/:unknown-slug → NotFoundPage
   *
   * For any slug not present in articles, ArticlePage renders NotFoundPage
   * with a link to /.
   */
  it('P3-c: /writing/:unknownSlug renders NotFoundPage with link to /', () => {
    fc.assert(
      fc.property(unknownSlugArb(KNOWN_ARTICLE_SLUGS), (slug) => {
        const { container, unmount } = renderAtUnknownSlug(
          ArticlePage as React.FC,
          '/writing',
          slug
        );
        assertNotFoundPage(container);
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * P3-d (deterministic): exact edge-case slugs that look like real slugs
   * but have subtle differences (e.g. typos, extra prefix) are still 404.
   */
  it('P3-d: near-miss slugs also render NotFoundPage', () => {
    const nearMisses = [
      // Architecture near-misses
      { Component: ArchitectureTopicPage as React.FC, base: '/architecture', slug: 'distributed-messagin' },
      { Component: ArchitectureTopicPage as React.FC, base: '/architecture', slug: 'ai-routings' },
      { Component: ArchitectureTopicPage as React.FC, base: '/architecture', slug: 'multi-tenant' },
      // Case study near-misses
      { Component: CaseStudyPage as React.FC, base: '/case-studies', slug: 'bvision' },
      { Component: CaseStudyPage as React.FC, base: '/case-studies', slug: 'radiques' },
      { Component: CaseStudyPage as React.FC, base: '/case-studies', slug: 'stop-search' },
      // Article near-misses
      { Component: ArticlePage as React.FC, base: '/writing', slug: 'rbac' },
      { Component: ArticlePage as React.FC, base: '/writing', slug: 'event-driven' },
      { Component: ArticlePage as React.FC, base: '/writing', slug: 'multi-tenant-saas-article' },
    ];

    for (const { Component, base, slug } of nearMisses) {
      const { container, unmount } = renderAtUnknownSlug(Component, base, slug);
      assertNotFoundPage(container);
      unmount();
    }
  });

  /**
   * P3-e (deterministic): the empty-like and special slugs also produce 404.
   * These cover edge-case input shapes: single char, all-digits, all-hyphens-separated.
   */
  it('P3-e: special-shape slugs render NotFoundPage on all three routes', () => {
    const specialSlugs = ['z', 'ab', 'not-found', 'unknown', 'test-slug', 'no-such-page'];

    for (const slug of specialSlugs) {
      if (!KNOWN_ARCHITECTURE_SLUGS.has(slug)) {
        const { container: c1, unmount: u1 } = renderAtUnknownSlug(
          ArchitectureTopicPage as React.FC,
          '/architecture',
          slug
        );
        assertNotFoundPage(c1);
        u1();
      }

      if (!KNOWN_CASE_STUDY_SLUGS.has(slug)) {
        const { container: c2, unmount: u2 } = renderAtUnknownSlug(
          CaseStudyPage as React.FC,
          '/case-studies',
          slug
        );
        assertNotFoundPage(c2);
        u2();
      }

      if (!KNOWN_ARTICLE_SLUGS.has(slug)) {
        const { container: c3, unmount: u3 } = renderAtUnknownSlug(
          ArticlePage as React.FC,
          '/writing',
          slug
        );
        assertNotFoundPage(c3);
        u3();
      }
    }
  });
});
