/**
 * Property 3: Unknown Slug Falls Back to 404
 *
 * **Validates: Requirements 1.4**
 *
 * For any slug NOT present in the corresponding Content_Schema collection,
 * navigating to `/architecture/:slug`, `/case-studies/:slug`, or
 * `/writing/:slug` renders NotFoundPage with a link back to `/`.
 *
 * For any slug THAT IS present, the page does NOT render NotFoundPage.
 *
 * Strategies:
 *   - fast-check generates arbitrary slugs and verifies the iff relationship
 *     against the known slug sets.
 *   - Deterministic sweep: a curated set of clearly unknown slugs to give
 *     unambiguous failure messages if the test breaks.
 *   - Positive cases: all real slugs must NOT render NotFoundPage.
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// ── Content imports ────────────────────────────────────────────────────────
import { architectureTopics } from '../content/architectureTopics';
import { caseStudies }         from '../content/caseStudies';
import { articles }            from '../content/articles';

// ── Page imports ──────────────────────────────────────────────────────────
import ArchitectureTopicPage from './ArchitectureTopicPage';
import CaseStudyPage         from './CaseStudyPage';
import ArticlePage           from './ArticlePage';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const passthrough =
    (tag: string) =>
    ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const {
        variants: _v, initial: _i, animate: _a, exit: _e, transition: _t,
        whileHover: _wh, whileTap: _wt, whileFocus: _wf, whileInView: _wi,
        viewport: _vp, ...domProps
      } = props as Record<string, unknown>;
      return React.createElement(tag, domProps as React.HTMLAttributes<HTMLElement>, children);
    };
  const m = new Proxy({} as Record<string, React.FC>, { get: (_, p: string) => passthrough(p) });
  return {
    m, motion: m,
    LazyMotion: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    domAnimation: {},
    useReducedMotion: () => false,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

vi.mock('../design-system/motionVariants', () => ({
  fadeIn:  { hidden: { opacity: 1 }, visible: { opacity: 1 } },
  fadeUp:  { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
  scaleIn: { hidden: { opacity: 1, scale: 1 }, visible: { opacity: 1, scale: 1 } },
}));

vi.mock('../app/SEO/RouteSEO', () => ({ RouteSEO: () => null }));

// Diagram stubs for ArchitectureTopicPage and CaseStudyPage
const makeSvgStub = (id: string) => () =>
  React.createElement('svg', { 'data-testid': `diagram-${id}` });

vi.mock('../components/diagrams/composed/DistributedMessagingDiagram',    () => ({ DistributedMessagingDiagram:    makeSvgStub('distributed-messaging')    }));
vi.mock('../components/diagrams/composed/AIRoutingDiagram',               () => ({ AIRoutingDiagram:               makeSvgStub('ai-routing')               }));
vi.mock('../components/diagrams/composed/MultiTenantSaaSDiagram',         () => ({ MultiTenantSaaSDiagram:         makeSvgStub('multi-tenant-saas')         }));
vi.mock('../components/diagrams/composed/WhatsAppInfrastructureDiagram',  () => ({ WhatsAppInfrastructureDiagram:  makeSvgStub('whatsapp-infrastructure')   }));
vi.mock('../components/diagrams/composed/HealthcareWorkflowDiagram',      () => ({ HealthcareWorkflowDiagram:      makeSvgStub('healthcare-workflow')       }));
vi.mock('../components/diagrams/composed/DeploymentInfrastructureDiagram',() => ({ DeploymentInfrastructureDiagram:makeSvgStub('deployment-infrastructure') }));

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --color-background: #0a0a0f; --color-surface: #12121a;
      --color-surface-elevated: #1a1a28; --color-border: #2a2a40;
      --color-text-primary: #f0f0ff; --color-text-secondary: #a0a0c0;
      --color-text-muted: #606080; --color-accent-primary: #6366f1;
      --color-accent-secondary: #8b5cf6; --color-success: #10b981;
      --font-sans: Inter, system-ui, sans-serif;
      --font-mono: "JetBrains Mono", monospace;
      --font-size-body: 1rem; --line-height-body: 1.6;
      --font-size-h1: 2.5rem; --line-height-h1: 1.1;
      --font-size-h2: 2rem; --line-height-h2: 1.2;
      --font-size-h3: 1.5rem; --line-height-h3: 1.3;
      --font-size-h4: 1.25rem; --line-height-h4: 1.4;
      --font-size-caption: 0.875rem; --line-height-caption: 1.4;
      --font-size-display: 4rem; --line-height-display: 1;
      --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px;
      --radius-xl: 24px; --radius-full: 9999px;
      --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
      --space-5: 20px; --space-6: 24px; --space-8: 32px;
      --space-12: 48px; --space-16: 64px;
      --shadow-sm: 0 1px 2px rgba(0,0,0,.4);
      --shadow-md: 0 4px 8px rgba(0,0,0,.4);
      --shadow-lg: 0 8px 24px rgba(0,0,0,.4);
      --duration-fast: 150ms; --ease-standard: ease;
    }
  `;
  document.head.appendChild(style);

  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  }
});

afterEach(() => { cleanup(); });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RouteKind = 'architecture' | 'case-studies' | 'writing';

const PAGE_COMPONENTS: Record<RouteKind, React.ComponentType> = {
  'architecture':  ArchitectureTopicPage,
  'case-studies':  CaseStudyPage,
  'writing':       ArticlePage,
};

function renderSlugRoute(kind: RouteKind, slug: string) {
  const Page = PAGE_COMPONENTS[kind];
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/${kind}/${slug}`]}>
        <Routes>
          <Route path={`/${kind}/:slug`} element={<Page />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

/** Returns true when the NotFoundPage "Page not found" heading is present. */
function isNotFoundRendered(): boolean {
  return screen.queryByRole('heading', { name: /page not found/i }) !== null;
}

/** Returns true when a "Back to home" link pointing to "/" is present. */
function hasBackToHomeLink(container: HTMLElement): boolean {
  const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href]'));
  return links.some((a) => a.getAttribute('href') === '/');
}

// Known slug sets
const knownArchSlugs    = new Set(architectureTopics.map((t) => t.slug));
const knownCSSlugs      = new Set(caseStudies.map((c) => c.slug));
const knownWritingSlugs = new Set(articles.map((a) => a.slug));

const knownSets: Record<RouteKind, Set<string>> = {
  'architecture':  knownArchSlugs,
  'case-studies':  knownCSSlugs,
  'writing':       knownWritingSlugs,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 3: Unknown Slug Falls Back to 404', () => {

  // ── 1. Curated unknown slugs ───────────────────────────────────────────────

  const CLEARLY_UNKNOWN = [
    'this-does-not-exist',
    'unknown-slug-xyz',
    'not-a-real-page',
    '123-fake-entry',
    'a',
  ];

  describe('unknown slugs → NotFoundPage with back-to-home link', () => {
    it.each(
      (['architecture', 'case-studies', 'writing'] as RouteKind[]).flatMap((kind) =>
        CLEARLY_UNKNOWN.map((slug) => ({ kind, slug })),
      ),
    )('/$kind/$slug renders NotFoundPage', ({ kind, slug }) => {
      const { container } = renderSlugRoute(kind, slug);
      expect(
        isNotFoundRendered(),
        `/${kind}/${slug} should render "Page not found" heading`,
      ).toBe(true);
      expect(
        hasBackToHomeLink(container),
        `/${kind}/${slug} NotFoundPage must contain a link back to /`,
      ).toBe(true);
    });
  });

  // ── 2. Positive cases: all real slugs must NOT render 404 ─────────────────

  describe('known slugs → page renders, no NotFoundPage', () => {
    it.each(architectureTopics.map((t) => t.slug))(
      '/architecture/%s renders content (not 404)',
      (slug) => {
        renderSlugRoute('architecture', slug);
        expect(isNotFoundRendered()).toBe(false);
      },
    );

    it.each(caseStudies.map((c) => c.slug))(
      '/case-studies/%s renders content (not 404)',
      (slug) => {
        renderSlugRoute('case-studies', slug);
        expect(isNotFoundRendered()).toBe(false);
      },
    );

    it.each(articles.map((a) => a.slug))(
      '/writing/%s renders content (not 404)',
      (slug) => {
        renderSlugRoute('writing', slug);
        expect(isNotFoundRendered()).toBe(false);
      },
    );
  });

  // ── 3. PBT: arbitrary slug strings against all three routes ───────────────

  it('PBT: for any generated slug, NotFoundPage rendered iff slug is unknown', () => {
    // Slug-shaped strings: lowercase alpha + hyphens, 1-40 chars
    const slugArb = fc
      .stringMatching(/^[a-z][a-z0-9-]{0,39}$/)
      .filter((s) => !s.endsWith('-'));

    const kindArb = fc.constantFrom<RouteKind>('architecture', 'case-studies', 'writing');

    fc.assert(
      fc.property(kindArb, slugArb, (kind, slug) => {
        const isKnown = knownSets[kind].has(slug);
        const { container } = renderSlugRoute(kind, slug);

        if (!isKnown) {
          expect(
            isNotFoundRendered(),
            `/${kind}/${slug} (unknown) must render NotFoundPage`,
          ).toBe(true);
          expect(
            hasBackToHomeLink(container),
            `/${kind}/${slug} NotFoundPage must have a / link`,
          ).toBe(true);
        } else {
          expect(
            isNotFoundRendered(),
            `/${kind}/${slug} (known) must NOT render NotFoundPage`,
          ).toBe(false);
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });

  // ── 4. Back-to-home link is always "/" not relative ───────────────────────

  it('NotFoundPage link href is exactly "/" (absolute root path)', () => {
    const { container } = renderSlugRoute('writing', 'completely-fake-slug-zzz');
    expect(isNotFoundRendered()).toBe(true);

    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href]'));
    const homeLink = links.find((a) => a.getAttribute('href') === '/');
    expect(
      homeLink,
      'NotFoundPage must have <a href="/"> as the back-to-home link',
    ).not.toBeUndefined();
  });
});
