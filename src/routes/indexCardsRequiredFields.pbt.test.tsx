/**
 * Property 8: Index Cards Render Required Fields
 *
 * **Validates: Requirements 4.1, 5.1, 6.1, 7.1, 7.4**
 *
 * For any entry × collection (`projects`, `architectureTopics`, `caseStudies`,
 * `articles`), the corresponding index page renders each entry's required
 * fields per the collection-specific schema:
 *
 *   - projects:           name (title) / summary / role / tags
 *   - architectureTopics: title / summary / link
 *   - caseStudies:        title / project (projectSlug) / role / duration / tags
 *   - articles:           title / summary / tags / readingTime
 *
 * Implementation approach:
 *   - Heavy deps (framer-motion, react-intersection-observer, RouteSEO,
 *     react-router-dom Link) are mocked to lightweight stubs so the test
 *     focuses only on field rendering logic.
 *   - Each index page is rendered inside a MemoryRouter so Link components
 *     don't throw.
 *   - `fast-check` picks an entry from the collection at random and asserts
 *     that all required fields appear in the rendered output.
 *   - Placeholder values are expected to appear as "TODO: <fieldName>",
 *     which is the canonical sentinel text rendered by <Placeholder />.
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Module mocks — hoisted before any module imports
// ---------------------------------------------------------------------------

vi.mock('framer-motion', async () => {
  const React = await import('react');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const passthrough = (tag: string) => ({ children, ...props }: any) => {
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

  const m = new Proxy({}, { get: (_t, prop: string) => passthrough(prop) });

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

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

// RouteSEO — no-op in tests; don't touch the DOM head
vi.mock('../app/SEO/RouteSEO', () => ({
  RouteSEO: () => null,
}));

// ---------------------------------------------------------------------------
// CSS token injection — prevents CSS-var lookups from returning empty string
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
      --font-size-h1: 2.5rem; --line-height-h1: 1.2;
      --font-size-h2: 2rem;   --line-height-h2: 1.25;
      --font-size-h3: 1.5rem; --line-height-h3: 1.3;
      --font-size-h4: 1.25rem; --line-height-h4: 1.35;
      --font-size-body: 1rem;  --line-height-body: 1.6;
      --font-size-caption: 0.875rem; --line-height-caption: 1.5;
      --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px; --radius-full: 9999px;
      --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
      --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-12: 48px;
      --space-16: 64px; --space-24: 96px;
      --shadow-sm: 0 1px 3px rgba(0,0,0,.4);
      --shadow-md: 0 4px 12px rgba(0,0,0,.4);
      --shadow-lg: 0 8px 24px rgba(0,0,0,.4);
      --duration-fast: 150ms; --duration-base: 240ms;
      --ease-standard: cubic-bezier(0.2,0,0,1);
    }
  `;
  document.head.appendChild(style);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wrap a component in MemoryRouter so Link components resolve correctly.
 */
function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

/**
 * Given a rendered container, return all visible text content as a single
 * normalised lowercase string for easy substring checks.
 */
function text(container: HTMLElement): string {
  return container.textContent?.toLowerCase() ?? '';
}

/**
 * Resolve the expected string for a field value that may be a Placeholder.
 * Placeholders render as "TODO: <fieldName>".
 */
function expectedText(value: unknown, _fieldName: string): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    '__field' in (value as object)
  ) {
    // Placeholder — rendered as "TODO: <field>"
    return `todo: ${(value as { __field: string }).__field}`.toLowerCase();
  }
  if (typeof value === 'number') {
    return String(value).toLowerCase();
  }
  return String(value).toLowerCase();
}

// ---------------------------------------------------------------------------
// Imports of pages and content modules (after mocks are registered)
// ---------------------------------------------------------------------------
import { projects } from '../content/projects';
import { architectureTopics } from '../content/architectureTopics';
import { caseStudies } from '../content/caseStudies';
import { articles } from '../content/articles';

// ---------------------------------------------------------------------------
// 1. Projects index — required fields: name (title), summary, role, tags
// ---------------------------------------------------------------------------
describe('Property 8a: ProjectsIndexPage renders required fields for every project', () => {
  // Import component lazily inside the test so mock resolution is complete
  it('for every project entry: title, summary, role, and tags are rendered', async () => {
    const { default: ProjectsIndexPage } = await import('./ProjectsIndexPage');

    const { container } = renderInRouter(<ProjectsIndexPage />);
    const pageText = text(container);

    await fc.assert(
      fc.property(
        fc.constantFrom(...projects),
        (project) => {
          // title (= name)
          if (!pageText.includes(project.title.toLowerCase())) {
            throw new Error(
              `[projects] title "${project.title}" not found in rendered output`
            );
          }

          // summary — may be a placeholder
          const summaryExpected = expectedText(project.summary, 'summary');
          if (!pageText.includes(summaryExpected)) {
            throw new Error(
              `[projects] summary for "${project.title}" — expected "${summaryExpected}" not found`
            );
          }

          // role — may be a placeholder
          const roleExpected = expectedText(project.role, 'role');
          if (!pageText.includes(roleExpected)) {
            throw new Error(
              `[projects] role for "${project.title}" — expected "${roleExpected}" not found`
            );
          }

          // tags — primaryTech array rendered as Tag components
          // The page renders `primaryTech` as tech tags (Req 4.1)
          for (const tag of project.primaryTech.slice(0, 6)) {
            if (!pageText.includes(tag.toLowerCase())) {
              throw new Error(
                `[projects] tech tag "${tag}" for "${project.title}" not found`
              );
            }
          }

          return true;
        }
      ),
      { numRuns: projects.length * 3 }
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Architecture index — required fields: title, summary, link
// ---------------------------------------------------------------------------
describe('Property 8b: ArchitectureIndexPage renders required fields for every topic', () => {
  it('for every architecture topic: title, summary, and link to topic page are rendered', async () => {
    const { default: ArchitectureIndexPage } = await import('./ArchitectureIndexPage');

    const { container } = renderInRouter(<ArchitectureIndexPage />);
    const pageText = text(container);

    await fc.assert(
      fc.property(
        fc.constantFrom(...architectureTopics),
        (topic) => {
          // title
          if (!pageText.includes(topic.title.toLowerCase())) {
            throw new Error(
              `[architectureTopics] title "${topic.title}" not found in rendered output`
            );
          }

          // summary — may be a placeholder
          const summaryExpected = expectedText(topic.summary, 'summary');
          if (!pageText.includes(summaryExpected)) {
            throw new Error(
              `[architectureTopics] summary for "${topic.title}" — expected "${summaryExpected}" not found`
            );
          }

          // link — the page renders <Link to={`/architecture/${slug}`}>
          // We check that the rendered anchor's href contains the slug
          const links = container.querySelectorAll<HTMLAnchorElement>(
            `a[href*="/architecture/${topic.slug}"]`
          );
          if (links.length === 0) {
            throw new Error(
              `[architectureTopics] link to "/architecture/${topic.slug}" not found for "${topic.title}"`
            );
          }

          return true;
        }
      ),
      { numRuns: architectureTopics.length * 3 }
    );
  });
});

// ---------------------------------------------------------------------------
// 3. Case Studies index — required fields: title, project, role, duration, tags
// ---------------------------------------------------------------------------
describe('Property 8c: CaseStudyIndexPage renders required fields for every case study', () => {
  it('for every case study: title, projectSlug, role, duration, and tags are rendered', async () => {
    const { default: CaseStudyIndexPage } = await import('./CaseStudyIndexPage');

    const { container } = renderInRouter(<CaseStudyIndexPage />);
    const pageText = text(container);

    await fc.assert(
      fc.property(
        fc.constantFrom(...caseStudies),
        (cs) => {
          // title
          if (!pageText.includes(cs.title.toLowerCase())) {
            throw new Error(
              `[caseStudies] title "${cs.title}" not found in rendered output`
            );
          }

          // project (projectSlug rendered directly)
          if (!pageText.includes(cs.projectSlug.toLowerCase())) {
            throw new Error(
              `[caseStudies] projectSlug "${cs.projectSlug}" not found for "${cs.title}"`
            );
          }

          // role — may be a placeholder
          const roleExpected = expectedText(cs.role, 'role');
          if (!pageText.includes(roleExpected)) {
            throw new Error(
              `[caseStudies] role for "${cs.title}" — expected "${roleExpected}" not found`
            );
          }

          // duration — may be a placeholder
          const durationExpected = expectedText(cs.duration, 'duration');
          if (!pageText.includes(durationExpected)) {
            throw new Error(
              `[caseStudies] duration for "${cs.title}" — expected "${durationExpected}" not found`
            );
          }

          // tags
          for (const tag of cs.tags) {
            if (!pageText.includes(tag.toLowerCase())) {
              throw new Error(
                `[caseStudies] tag "${tag}" for "${cs.title}" not found`
              );
            }
          }

          return true;
        }
      ),
      { numRuns: caseStudies.length * 3 }
    );
  });
});

// ---------------------------------------------------------------------------
// 4. Writing index — required fields: title, summary, tags, readingTime
// ---------------------------------------------------------------------------
describe('Property 8d: WritingIndexPage renders required fields for every article', () => {
  it('for every article: title, summary, tags, and readingTime are rendered', async () => {
    const { default: WritingIndexPage } = await import('./WritingIndexPage');

    const { container } = renderInRouter(<WritingIndexPage />);
    const pageText = text(container);

    await fc.assert(
      fc.property(
        fc.constantFrom(...articles),
        (article) => {
          // title
          if (!pageText.includes(article.title.toLowerCase())) {
            throw new Error(
              `[articles] title "${article.title}" not found in rendered output`
            );
          }

          // summary — may be a placeholder
          const summaryExpected = expectedText(article.summary, 'summary');
          if (!pageText.includes(summaryExpected)) {
            throw new Error(
              `[articles] summary for "${article.title}" — expected "${summaryExpected}" not found`
            );
          }

          // tags
          for (const tag of article.tags) {
            if (!pageText.includes(tag.toLowerCase())) {
              throw new Error(
                `[articles] tag "${tag}" for "${article.title}" not found`
              );
            }
          }

          // readingTime — rendered as "N min read" or "Reading time TBD" when 0
          const readingTimeExpected =
            article.readingTimeMinutes > 0
              ? `${article.readingTimeMinutes} min read`
              : 'reading time tbd';
          if (!pageText.includes(readingTimeExpected.toLowerCase())) {
            throw new Error(
              `[articles] readingTime for "${article.title}" — expected "${readingTimeExpected}" not found`
            );
          }

          return true;
        }
      ),
      { numRuns: articles.length * 3 }
    );
  });
});
