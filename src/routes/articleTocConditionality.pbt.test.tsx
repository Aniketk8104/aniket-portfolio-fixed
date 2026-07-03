/**
 * Property 13: Article TOC Conditionality
 *
 * **Validates: Requirements 7.2**
 *
 * The Table of Contents (TOC) is rendered if and only if `entry.toc` is set
 * and non-empty. Specifically:
 *   - When `entry.toc` is set and `entry.toc.length > 0`  → a TOC nav is rendered.
 *   - When `entry.toc` is undefined or `entry.toc.length === 0` → no TOC is rendered.
 *
 * Strategy:
 *   - Enumerate all real `articles` entries and render `ArticlePage` with the
 *     corresponding slug param. Assert TOC presence matches the toc field.
 *   - Additionally exercise synthetic articles:
 *       (a) `toc: []`                  → no TOC
 *       (b) `toc: [{ id, label, level }]` → TOC rendered
 *   - The TOC `<nav>` carries `aria-label="Table of contents"` per the
 *     implementation, so we query by role="navigation" and the accessible name.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { articles } from '../content/articles';
import type { ArticleEntry } from '../content/articles';
import type { TocEntry } from '../types/content';
import ArticlePage from './ArticlePage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Render ArticlePage for the given slug inside MemoryRouter so that
 * `useParams` resolves correctly.
 */
function renderArticlePage(slug: string) {
  const ctx = {};
  const result = render(
    <HelmetProvider context={ctx}>
      <MemoryRouter initialEntries={[`/writing/${slug}`]}>
        <Routes>
          <Route path="/writing/:slug" element={<ArticlePage />} />
          {/* NotFoundPage fallback — must exist for unknown slugs */}
          <Route path="*" element={<div data-testid="not-found">Not found</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
  return result;
}

/** Return true if the TOC nav is present in the current document. */
function tocIsRendered(): boolean {
  // ArticlePage renders: <nav aria-label="Table of contents">
  const nav = screen.queryByRole('navigation', { name: /table of contents/i });
  return nav !== null;
}

// ---------------------------------------------------------------------------
// Mock window.matchMedia (jsdom does not implement it)
// ---------------------------------------------------------------------------

beforeEach(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('Property 13: Article TOC Conditionality', () => {
  // -------------------------------------------------------------------------
  // P13-a: Every real article in the collection
  // -------------------------------------------------------------------------

  describe('P13-a: real articles collection — TOC conditionality holds for every entry', () => {
    it.each(articles.map((a) => ({ slug: a.slug, toc: a.toc })))(
      'article "$slug" → TOC rendered iff toc is set and non-empty',
      ({ slug, toc }) => {
        renderArticlePage(slug);

        const hasToc = Array.isArray(toc) && toc.length > 0;

        if (hasToc) {
          expect(
            tocIsRendered(),
            `article "${slug}" has toc with ${(toc as TocEntry[]).length} entries — TOC nav must be rendered`,
          ).toBe(true);
        } else {
          expect(
            tocIsRendered(),
            `article "${slug}" has no toc / empty toc — TOC nav must NOT be rendered`,
          ).toBe(false);
        }
      },
    );
  });

  // -------------------------------------------------------------------------
  // P13-b: Synthetic article — empty toc array → no TOC
  // -------------------------------------------------------------------------

  it('P13-b: synthetic article with toc: [] → TOC nav is NOT rendered', () => {
    // Temporarily inject a synthetic article into the module-level array
    const syntheticSlug = '__test-empty-toc__';
    const synthetic: ArticleEntry = {
      slug: syntheticSlug,
      title: 'Synthetic Empty TOC Article',
      summary: 'A synthetic article for testing purposes.',
      body: undefined,
      toc: [], // empty array → should NOT render TOC
      readingTimeMinutes: 5,
      status: 'draft',
      tags: ['test'],
    };

    articles.push(synthetic);

    try {
      renderArticlePage(syntheticSlug);
      expect(
        tocIsRendered(),
        'Empty toc array must not cause the TOC nav to be rendered',
      ).toBe(false);
    } finally {
      // Remove the synthetic entry so other tests are not affected
      const idx = articles.indexOf(synthetic);
      if (idx !== -1) articles.splice(idx, 1);
    }
  });

  // -------------------------------------------------------------------------
  // P13-c: Synthetic article — populated toc → TOC rendered
  // -------------------------------------------------------------------------

  it('P13-c: synthetic article with populated toc → TOC nav IS rendered', () => {
    const syntheticSlug = '__test-populated-toc__';
    const synthetic: ArticleEntry = {
      slug: syntheticSlug,
      title: 'Synthetic Populated TOC Article',
      summary: 'A synthetic article with real TOC entries.',
      body: undefined,
      toc: [
        { id: 'section-1', label: 'Section One', level: 2 },
        { id: 'section-2', label: 'Section Two', level: 2 },
        { id: 'section-2-1', label: 'Subsection', level: 3 },
      ],
      readingTimeMinutes: 8,
      status: 'draft',
      tags: ['test'],
    };

    articles.push(synthetic);

    try {
      renderArticlePage(syntheticSlug);
      expect(
        tocIsRendered(),
        'Populated toc array must cause the TOC nav to be rendered',
      ).toBe(true);
    } finally {
      const idx = articles.indexOf(synthetic);
      if (idx !== -1) articles.splice(idx, 1);
    }
  });

  // -------------------------------------------------------------------------
  // P13-d (PBT): Generated toc arrays — conditionality holds universally
  // -------------------------------------------------------------------------

  it('P13-d (PBT): for any generated toc array, TOC rendered iff toc.length > 0', () => {
    const tocEntryArb = fc.record<TocEntry>({
      id: fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/),
      label: fc.string({ minLength: 1, maxLength: 60 }),
      level: fc.constantFrom<2 | 3>(2, 3),
    });

    // Arbitraries: undefined, empty array, or non-empty array
    const tocArb = fc.oneof(
      fc.constant(undefined),
      fc.constant([] as TocEntry[]),
      fc.array(tocEntryArb, { minLength: 1, maxLength: 6 }),
    );

    fc.assert(
      fc.property(tocArb, (toc) => {
        const slug = `__pbt-toc-${Date.now()}-${Math.random().toString(36).slice(2)}__`;

        const synthetic: ArticleEntry = {
          slug,
          title: 'PBT TOC Test Article',
          summary: 'PBT generated article.',
          body: undefined,
          toc,
          readingTimeMinutes: 3,
          status: 'draft',
          tags: [],
        };

        articles.push(synthetic);

        try {
          renderArticlePage(slug);

          const hasToc = Array.isArray(toc) && toc.length > 0;

          expect(
            tocIsRendered(),
            hasToc
              ? `toc with ${(toc as TocEntry[]).length} entries must render TOC nav`
              : 'undefined or empty toc must not render TOC nav',
          ).toBe(hasToc);
        } finally {
          const idx = articles.indexOf(synthetic);
          if (idx !== -1) articles.splice(idx, 1);
          cleanup();
        }
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // P13-e: Unknown slug renders NotFoundPage (no TOC)
  // -------------------------------------------------------------------------

  it('P13-e: unknown slug renders NotFoundPage — no TOC nav present', () => {
    renderArticlePage('this-slug-does-not-exist-at-all');
    expect(tocIsRendered()).toBe(false);
  });
});
