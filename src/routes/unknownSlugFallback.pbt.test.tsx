/**
 * Property 3: Unknown Slug Falls Back to 404
 *
 * **Validates: Requirements 1.4**
 *
 * For any slug NOT present in the respective content collection
 * (`architectureTopics`, `caseStudies`, `articles`), navigating to:
 *   /architecture/:slug
 *   /case-studies/:slug
 *   /writing/:slug
 * renders `NotFoundPage` — confirmed by the presence of a link to `/`.
 *
 * Two-level testing strategy:
 *
 * A) Logic-level (fast, synchronous): Verify the slug-lookup returns undefined
 *    for unknown slugs — this is the guard condition that triggers NotFoundPage.
 *    Uses fast-check over 100 runs.
 *
 * B) Render-level (spot-check, synchronous): Mount the actual route component
 *    in a MemoryRouter for a small number of representative unknown slugs and
 *    assert that a link to "/" is rendered (NotFoundPage's primary affordance).
 *    Uses fast-check over 5 runs to keep suite time bounded.
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Direct imports — no lazy wrapping; slug resolution is synchronous
import ArchitectureTopicPageDefault from './ArchitectureTopicPage';
import CaseStudyPageDefault from './CaseStudyPage';
import ArticlePageDefault from './ArticlePage';

import { architectureTopics } from '../content/architectureTopics';
import { caseStudies } from '../content/caseStudies';
import { articles } from '../content/articles';

// ─── Known slug sets ──────────────────────────────────────────────────────────
const knownArchitectureSlugs = new Set(architectureTopics.map((t) => t.slug));
const knownCaseStudySlugs = new Set(caseStudies.map((cs) => cs.slug));
const knownArticleSlugs = new Set(articles.map((a) => a.slug));

// ─── Slug generators ──────────────────────────────────────────────────────────
/**
 * Generates lowercase alphanumeric slug strings (min 2 chars) that are NOT
 * present in the provided known-slug set.
 */
function unknownSlugArb(knownSlugs: Set<string>): fc.Arbitrary<string> {
  return fc
    .stringMatching(/^[a-z][a-z0-9]{1,29}$/)
    .filter((s) => !knownSlugs.has(s));
}

// ─── Render helper (render level only) ───────────────────────────────────────
function renderAtPath(
  pattern: string,
  path: string,
  Component: React.ComponentType
): ReturnType<typeof render> {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]} initialIndex={0}>
        <Routes>
          <Route path={pattern} element={<Component />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

function assertHasHomeLink(container: HTMLElement, label: string): void {
  const links = Array.from(container.querySelectorAll('a'));
  const hasHomeLink = links.some(
    (a) =>
      a.getAttribute('href') === '/' ||
      a.href === 'http://localhost/'
  );
  expect(hasHomeLink, label).toBe(true);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Property 3: Unknown Slug Falls Back to 404', () => {
  // ── A. Logic-level: slug lookup returns undefined for unknown slugs ────────

  /**
   * P3-a-logic: Any string not in `architectureTopics` slugs → lookup returns undefined.
   * This is the guard condition: `if (!topic) return <NotFoundPage />`.
   */
  it('P3-a-logic: unknown architecture slug is not found in collection (100 runs)', () => {
    fc.assert(
      fc.property(
        unknownSlugArb(knownArchitectureSlugs),
        (slug) => {
          const found = architectureTopics.find((t) => t.slug === slug);
          expect(
            found,
            `Slug "${slug}" must not match any architectureTopic entry`
          ).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * P3-b-logic: Any string not in `caseStudies` slugs → lookup returns undefined.
   */
  it('P3-b-logic: unknown case study slug is not found in collection (100 runs)', () => {
    fc.assert(
      fc.property(
        unknownSlugArb(knownCaseStudySlugs),
        (slug) => {
          const found = caseStudies.find((cs) => cs.slug === slug);
          expect(
            found,
            `Slug "${slug}" must not match any caseStudy entry`
          ).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * P3-c-logic: Any string not in `articles` slugs → lookup returns undefined.
   */
  it('P3-c-logic: unknown article slug is not found in collection (100 runs)', () => {
    fc.assert(
      fc.property(
        unknownSlugArb(knownArticleSlugs),
        (slug) => {
          const found = articles.find((a) => a.slug === slug);
          expect(
            found,
            `Slug "${slug}" must not match any article entry`
          ).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── B. Render-level: unknown slug renders link to / ───────────────────────

  /**
   * P3-a-render: /architecture/:slug — 5 sampled unknown slugs render link to /
   */
  it('P3-a-render: /architecture/:slug — unknown slug renders link to / (5 runs)', () => {
    fc.assert(
      fc.property(
        unknownSlugArb(knownArchitectureSlugs),
        (slug) => {
          const { container, unmount } = renderAtPath(
            '/architecture/:slug',
            `/architecture/${slug}`,
            ArchitectureTopicPageDefault
          );
          assertHasHomeLink(
            container,
            `Unknown architecture slug "${slug}" must render a link to /`
          );
          unmount();
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * P3-b-render: /case-studies/:slug — 5 sampled unknown slugs render link to /
   */
  it('P3-b-render: /case-studies/:slug — unknown slug renders link to / (5 runs)', () => {
    fc.assert(
      fc.property(
        unknownSlugArb(knownCaseStudySlugs),
        (slug) => {
          const { container, unmount } = renderAtPath(
            '/case-studies/:slug',
            `/case-studies/${slug}`,
            CaseStudyPageDefault
          );
          assertHasHomeLink(
            container,
            `Unknown case study slug "${slug}" must render a link to /`
          );
          unmount();
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * P3-c-render: /writing/:slug — 5 sampled unknown slugs render link to /
   */
  it('P3-c-render: /writing/:slug — unknown slug renders link to / (5 runs)', () => {
    fc.assert(
      fc.property(
        unknownSlugArb(knownArticleSlugs),
        (slug) => {
          const { container, unmount } = renderAtPath(
            '/writing/:slug',
            `/writing/${slug}`,
            ArticlePageDefault
          );
          assertHasHomeLink(
            container,
            `Unknown article slug "${slug}" must render a link to /`
          );
          unmount();
        }
      ),
      { numRuns: 5 }
    );
  });

  // ── C. Sanity checks ──────────────────────────────────────────────────────

  /**
   * P3-d: Known slugs do not render NotFoundPage.
   */
  it('P3-d: known architecture slug does not render NotFoundPage', () => {
    const knownSlug = architectureTopics[0].slug; // 'distributed-messaging'

    const { container, unmount } = renderAtPath(
      '/architecture/:slug',
      `/architecture/${knownSlug}`,
      ArchitectureTopicPageDefault
    );

    const text = container.textContent ?? '';
    expect(
      text,
      `Known slug "${knownSlug}" must not render NotFoundPage`
    ).not.toMatch(/page not found/i);

    unmount();
  });

  /**
   * P3-e: All content collections are non-empty (guards against empty-set false positives).
   */
  it('P3-e: each content collection has at least one entry', () => {
    expect(architectureTopics.length).toBeGreaterThan(0);
    expect(caseStudies.length).toBeGreaterThan(0);
    expect(articles.length).toBeGreaterThan(0);
  });
});
