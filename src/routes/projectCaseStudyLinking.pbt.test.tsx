/**
 * Property 9: Project–Case-Study Linking
 *
 * **Validates: Requirements 4.2, 4.3**
 *
 * For any `Project` entry:
 *   - Card contains `<a href="/case-studies/<slug>">` if and only if
 *     `caseStudySlug !== null`
 *   - When `caseStudySlug` is `null`, card contains "Case study coming soon"
 *     text and no `/case-studies/` anchor.
 *
 * Strategy:
 *   - Use `fc.constantFrom(...projects)` to sample from real project entries.
 *   - Also synthesize arbitrary project fixtures (caseStudySlug set or null)
 *     to explore the full input space beyond the four real entries.
 *   - Render `FeaturedProjectsSection` with a single-project override via the
 *     `projectList` prop to isolate each card.
 *   - Assert the iff relationship on the rendered DOM.
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { projects, type ProjectEntry } from '../content/projects';
import { placeholder } from '../utils/placeholder';

// ---------------------------------------------------------------------------
// Module mocks — hoisted before any import of mocked modules
// ---------------------------------------------------------------------------

// Mock framer-motion to avoid animation lifecycle issues in jsdom
vi.mock('framer-motion', async () => {
  const React = await import('react');

  const makePassthrough =
    (tag: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ children, ...props }: any) => {
      const {
        variants: _v,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        whileHover: _wh,
        whileTap: _wt,
        whileFocus: _wf,
        whileInView: _wi,
        viewport: _vp,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...domProps
      } = props;
      return React.createElement(tag, domProps, children);
    };

  const m = new Proxy(
    {},
    { get: (_target, prop: string) => makePassthrough(prop) },
  );

  return {
    m,
    motion: m,
    LazyMotion: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    domAnimation: {},
    useReducedMotion: () => false,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useScroll: () => ({ scrollY: { on: vi.fn(), get: () => 0 } }),
    useMotionValueEvent: () => {},
  };
});

// Mock react-intersection-observer — always report inView=true so cards render
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: () => undefined, inView: true }),
}));

// Mock RouteSEO — no-op in unit tests
vi.mock('../app/SEO/RouteSEO', () => ({
  RouteSEO: () => null,
}));

// ---------------------------------------------------------------------------
// CSS token injection so component CSS-var references don't crash
// ---------------------------------------------------------------------------
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
      --font-size-caption: 0.75rem;
      --font-size-body: 1rem;
      --font-size-h3: 1.25rem;
      --line-height-caption: 1.4;
      --line-height-body: 1.6;
      --line-height-h3: 1.3;
      --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px;
      --shadow-sm: 0 1px 2px rgba(0,0,0,.4);
      --shadow-md: 0 4px 8px rgba(0,0,0,.4);
      --shadow-lg: 0 8px 24px rgba(0,0,0,.4);
      --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
      --space-5: 20px; --space-6: 24px; --space-8: 32px;
      --duration-fast: 150ms; --duration-base: 300ms;
      --ease-standard: ease;
    }
  `;
  document.head.appendChild(style);
});

// ---------------------------------------------------------------------------
// Import the component under test (after mocks)
// ---------------------------------------------------------------------------
import { FeaturedProjectsSection } from '../sections/home/FeaturedProjectsSection';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Render FeaturedProjectsSection with a single project supplied via the
 * `projectList` prop. This isolates one card at a time.
 *
 * The component orders cards by FEATURED_ORDER slugs, so any project whose
 * slug matches one of the four canonical slugs will be rendered. For synthetic
 * projects we use a slug from the canonical list to guarantee rendering.
 */
function renderSingleProject(project: ProjectEntry): HTMLElement {
  const { container } = render(
    <HelmetProvider>
      <MemoryRouter>
        <FeaturedProjectsSection projectList={[project]} />
      </MemoryRouter>
    </HelmetProvider>,
  );
  return container;
}

/**
 * Build a synthetic project fixture using a canonical slug so it is
 * picked up by FEATURED_ORDER inside FeaturedProjectsSection.
 */
function buildProject(
  caseStudySlug: string | null,
  slugOverride?: string,
): ProjectEntry {
  return {
    slug: slugOverride ?? 'bvisionr',
    title: 'Test Project',
    summary: placeholder<string>('summary'),
    role: placeholder<string>('role'),
    primaryTech: ['TypeScript'],
    caseStudySlug,
    status: 'draft',
    tags: [],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 9: Project–Case-Study Linking', () => {
  // ── A. Real project entries from content module ──────────────────────────

  /**
   * P9-a: For every real project, the iff relationship holds.
   * Uses fc.constantFrom over the live content array.
   */
  it('P9-a: for any real project, link exists iff caseStudySlug !== null', () => {
    fc.assert(
      fc.property(fc.constantFrom(...projects), (project) => {
        const container = renderSingleProject(project);

        if (project.caseStudySlug !== null) {
          // Must have an anchor pointing to the case study
          const link = container.querySelector(
            `a[href="/case-studies/${project.caseStudySlug}"]`,
          );
          expect(
            link,
            `Project "${project.slug}" has caseStudySlug="${project.caseStudySlug}" — expected <a href="/case-studies/${project.caseStudySlug}"> to exist`,
          ).not.toBeNull();

          // Must NOT contain "Case study coming soon"
          expect(
            container.textContent,
            `Project "${project.slug}" has a case study — "Case study coming soon" must NOT be present`,
          ).not.toContain('Case study coming soon');
        } else {
          // Must contain "Case study coming soon"
          expect(
            container.textContent,
            `Project "${project.slug}" has no caseStudySlug — expected "Case study coming soon" text`,
          ).toContain('Case study coming soon');

          // Must NOT contain any /case-studies/ anchor
          const anyLink = container.querySelector('a[href*="/case-studies/"]');
          expect(
            anyLink,
            `Project "${project.slug}" has no caseStudySlug — no /case-studies/ anchor must exist`,
          ).toBeNull();
        }
      }),
      { numRuns: 100 },
    );
  });

  // ── B. Synthetic fixtures: null slug ────────────────────────────────────

  /**
   * P9-b: For any synthetic project with caseStudySlug === null:
   *   - "Case study coming soon" text is present.
   *   - No anchor into /case-studies/ exists.
   */
  it('P9-b: null caseStudySlug → "Case study coming soon" text, no /case-studies/ link', () => {
    // Use each canonical slug in turn so we get full coverage of FEATURED_ORDER
    const canonicalSlugs = ['bvisionr', 'radique', 'aura-tech-platform', 'stopsearch'] as const;

    fc.assert(
      fc.property(
        fc.constantFrom(...canonicalSlugs),
        (slug) => {
          const project = buildProject(null, slug);
          const container = renderSingleProject(project);

          expect(
            container.textContent,
            `caseStudySlug=null on "${slug}" — "Case study coming soon" must be present`,
          ).toContain('Case study coming soon');

          const link = container.querySelector('a[href*="/case-studies/"]');
          expect(
            link,
            `caseStudySlug=null on "${slug}" — no /case-studies/ anchor must exist`,
          ).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  // ── C. Synthetic fixtures: non-null slug ────────────────────────────────

  /**
   * P9-c: For any synthetic project with a non-null caseStudySlug:
   *   - <a href="/case-studies/<slug>"> exists.
   *   - "Case study coming soon" is absent.
   */
  it('P9-c: non-null caseStudySlug → correct /case-studies/ link, no "coming soon" text', () => {
    // Arbitrary non-empty slugs (alphanumeric + hyphens, at least 2 chars)
    const slugArb = fc
      .stringMatching(/^[a-z][a-z0-9-]{1,30}$/)
      .filter((s) => !s.endsWith('-'));

    fc.assert(
      fc.property(slugArb, (caseStudySlug) => {
        const project = buildProject(caseStudySlug, 'bvisionr');
        const container = renderSingleProject(project);

        const link = container.querySelector(
          `a[href="/case-studies/${caseStudySlug}"]`,
        );
        expect(
          link,
          `caseStudySlug="${caseStudySlug}" — expected <a href="/case-studies/${caseStudySlug}">`,
        ).not.toBeNull();

        expect(
          container.textContent,
          `caseStudySlug="${caseStudySlug}" — "Case study coming soon" must NOT be present`,
        ).not.toContain('Case study coming soon');
      }),
      { numRuns: 100 },
    );
  });

  // ── D. Mutual exclusion ─────────────────────────────────────────────────

  /**
   * P9-d: Link and "coming soon" are mutually exclusive — never both present.
   *
   * Covers both null and non-null branches with a single property.
   */
  it('P9-d: link and "Case study coming soon" are mutually exclusive', () => {
    const caseStudySlugArb = fc.option(
      fc.stringMatching(/^[a-z][a-z0-9-]{1,30}$/).filter((s) => !s.endsWith('-')),
      { nil: null },
    );

    fc.assert(
      fc.property(caseStudySlugArb, (caseStudySlug) => {
        const project = buildProject(caseStudySlug, 'bvisionr');
        const container = renderSingleProject(project);

        const hasLink =
          container.querySelector('a[href*="/case-studies/"]') !== null;
        const hasComingSoon =
          (container.textContent ?? '').includes('Case study coming soon');

        // XOR: exactly one of the two must be true
        expect(
          hasLink !== hasComingSoon,
          `Expected exactly one of: link OR "Case study coming soon". ` +
            `hasLink=${hasLink}, hasComingSoon=${hasComingSoon}, ` +
            `caseStudySlug=${caseStudySlug}`,
        ).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  // ── E. Deterministic spot-checks for all four real projects ─────────────

  it.each(projects)(
    'real project "$slug": caseStudySlug=$caseStudySlug satisfies iff rule',
    (project) => {
      const container = renderSingleProject(project);

      if (project.caseStudySlug !== null) {
        expect(
          container.querySelector(`a[href="/case-studies/${project.caseStudySlug}"]`),
        ).not.toBeNull();
        expect(container.textContent).not.toContain('Case study coming soon');
      } else {
        expect(container.textContent).toContain('Case study coming soon');
        expect(container.querySelector('a[href*="/case-studies/"]')).toBeNull();
      }
    },
  );
});
