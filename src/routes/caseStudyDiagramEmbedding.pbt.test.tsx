/**
 * Property 12: Case Study Diagram Embedding
 *
 * **Validates: Requirements 6.5**
 *
 * A composed diagram is embedded in CaseStudyPage if and only if
 * `entry.diagramId != null`, and the embedded diagram corresponds to that id.
 *
 * Strategies:
 *   - Enumerate all real `caseStudies` entries — assert iff relationship.
 *   - Synthetic case studies with explicit diagramId values — verify presence.
 *   - Synthetic case studies with diagramId = undefined — verify absence.
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { act } from 'react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { caseStudies } from '../content/caseStudies';
import type { CaseStudyEntry } from '../content/caseStudies';
import { placeholder } from '../utils/placeholder';
import type { RichText } from '../types/content';
import CaseStudyPage from './CaseStudyPage';

// ---------------------------------------------------------------------------
// Diagram stubs — lightweight accessible SVGs keyed by diagramId
// ---------------------------------------------------------------------------

const DIAGRAM_IDS = [
  'distributed-messaging',
  'ai-routing',
  'multi-tenant-saas',
  'whatsapp-infrastructure',
  'healthcare-workflow',
  'deployment-infrastructure',
] as const;

type DiagramId = (typeof DIAGRAM_IDS)[number];

function makeDiagramStub(id: DiagramId) {
  return function DiagramStub() {
    return (
      <svg
        role="img"
        aria-label={`${id} diagram`}
        data-diagram-id={id}
        data-testid={`diagram-${id}`}
        viewBox="0 0 100 50"
      >
        <title id={`${id}-title`}>{id} diagram</title>
      </svg>
    );
  };
}

vi.mock('../components/diagrams/composed/DistributedMessagingDiagram', () => ({
  DistributedMessagingDiagram: makeDiagramStub('distributed-messaging'),
}));
vi.mock('../components/diagrams/composed/AIRoutingDiagram', () => ({
  AIRoutingDiagram: makeDiagramStub('ai-routing'),
}));
vi.mock('../components/diagrams/composed/MultiTenantSaaSDiagram', () => ({
  MultiTenantSaaSDiagram: makeDiagramStub('multi-tenant-saas'),
}));
vi.mock('../components/diagrams/composed/WhatsAppInfrastructureDiagram', () => ({
  WhatsAppInfrastructureDiagram: makeDiagramStub('whatsapp-infrastructure'),
}));
vi.mock('../components/diagrams/composed/HealthcareWorkflowDiagram', () => ({
  HealthcareWorkflowDiagram: makeDiagramStub('healthcare-workflow'),
}));
vi.mock('../components/diagrams/composed/DeploymentInfrastructureDiagram', () => ({
  DeploymentInfrastructureDiagram: makeDiagramStub('deployment-infrastructure'),
}));

// ---------------------------------------------------------------------------
// Other mocks
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
      --color-warning: #f59e0b; --color-danger: #ef4444;
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

async function renderCaseStudyPage(slug: string) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/case-studies/${slug}`]}>
          <Routes>
            <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
            <Route path="*" element={<div data-testid="not-found">Not found</div>} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
  });
  return result;
}

function getDiagramElement(container: HTMLElement): Element | null {
  // Our stubs render with data-diagram-id — check for that first
  const byDataId = container.querySelector('[data-diagram-id]');
  if (byDataId) return byDataId;
  // Fallback: any SVG with role="img"
  return container.querySelector('svg[role="img"]');
}

function buildSyntheticEntry(
  slug: string,
  diagramId: string | undefined,
): CaseStudyEntry {
  return {
    slug,
    projectSlug: 'bvisionr',
    title: `Synthetic CS ${slug}`,
    summary: placeholder<string>('summary'),
    role: placeholder<string>('role'),
    duration: placeholder<string>('duration'),
    status: 'draft',
    tags: [],
    diagramId,
    sections: {
      overview:     placeholder<RichText>('overview'),
      context:      placeholder<RichText>('context'),
      problem:      placeholder<RichText>('problem'),
      constraints:  placeholder<RichText>('constraints'),
      architecture: placeholder<RichText>('architecture'),
      decisions:    placeholder<RichText>('decisions'),
      tradeoffs:    placeholder<RichText>('tradeoffs'),
      outcomes:     placeholder<RichText>('outcomes'),
      lessons:      placeholder<RichText>('lessons'),
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 12: Case Study Diagram Embedding', () => {
  // ── P12-a: All real entries ───────────────────────────────────────────────

  describe('P12-a: real case studies — diagram embedded iff diagramId != null', () => {
    it.each(caseStudies.map((cs) => ({ slug: cs.slug, diagramId: cs.diagramId })))(
      '"$slug": diagram present iff diagramId != null',
      async ({ slug, diagramId }) => {
        const { container } = await renderCaseStudyPage(slug);
        const diagramEl = getDiagramElement(container);

        if (diagramId != null) {
          expect(
            diagramEl,
            `"${slug}" has diagramId="${diagramId}" — a diagram element must be rendered`,
          ).not.toBeNull();
          // Identity check: the rendered diagram corresponds to this diagramId
          const renderedId = diagramEl?.getAttribute('data-diagram-id');
          expect(
            renderedId,
            `Rendered diagram data-diagram-id must equal "${diagramId}"`,
          ).toBe(diagramId);
        } else {
          // No diagram section should be rendered
          expect(
            diagramEl,
            `"${slug}" has no diagramId — no diagram element must be rendered`,
          ).toBeNull();
        }
      },
    );
  });

  // ── P12-b: Synthetic — explicit diagramId → diagram present ──────────────

  it.each(DIAGRAM_IDS)(
    'P12-b: synthetic entry with diagramId="%s" → diagram stub rendered with matching id',
    async (diagramId) => {
      const slug = `__test-diagram-${diagramId}__`;
      const entry = buildSyntheticEntry(slug, diagramId);
      caseStudies.push(entry);
      try {
        const { container } = await renderCaseStudyPage(slug);
        const diagramEl = getDiagramElement(container);
        expect(
          diagramEl,
          `diagramId="${diagramId}" → diagram element must be present`,
        ).not.toBeNull();
        expect(
          diagramEl?.getAttribute('data-diagram-id'),
          `Rendered diagram must have data-diagram-id="${diagramId}"`,
        ).toBe(diagramId);
      } finally {
        const idx = caseStudies.indexOf(entry);
        if (idx !== -1) caseStudies.splice(idx, 1);
      }
    },
  );

  // ── P12-c: Synthetic — no diagramId → no diagram ─────────────────────────

  it('P12-c: synthetic entry with diagramId = undefined → no diagram rendered', async () => {
    const slug = '__test-no-diagram__';
    const entry = buildSyntheticEntry(slug, undefined);
    caseStudies.push(entry);
    try {
      const { container } = await renderCaseStudyPage(slug);
      const diagramEl = getDiagramElement(container);
      expect(diagramEl, 'diagramId=undefined → no diagram element').toBeNull();
    } finally {
      const idx = caseStudies.indexOf(entry);
      if (idx !== -1) caseStudies.splice(idx, 1);
    }
  });

  // ── P12-d (PBT): generated diagramId — iff holds universally ─────────────

  it('P12-d (PBT): for any diagramId (known or null), iff holds', async () => {
    const diagramIdArb = fc.oneof(
      fc.constant(undefined),
      fc.constantFrom(...DIAGRAM_IDS),
    );

    await fc.assert(
      fc.asyncProperty(diagramIdArb, async (diagramId) => {
        const slug = `__pbt-diag-${Date.now()}-${Math.random().toString(36).slice(2)}__`;
        const entry = buildSyntheticEntry(slug, diagramId);
        caseStudies.push(entry);

        try {
          const { container } = await renderCaseStudyPage(slug);
          const diagramEl = getDiagramElement(container);

          if (diagramId != null) {
            expect(
              diagramEl,
              `diagramId="${diagramId}" → diagram element must be present`,
            ).not.toBeNull();
            expect(
              diagramEl?.getAttribute('data-diagram-id'),
            ).toBe(diagramId);
          } else {
            expect(
              diagramEl,
              'diagramId=undefined → no diagram element',
            ).toBeNull();
          }
        } finally {
          const idx = caseStudies.indexOf(entry);
          if (idx !== -1) caseStudies.splice(idx, 1);
          cleanup();
        }
      }),
      { numRuns: 50 },
    );
  });

  // ── P12-e: Mutual exclusion — diagram section iff diagramId set ───────────

  it('P12-e: diagram section present iff diagramId is set (spot-check all real entries)', async () => {
    for (const cs of caseStudies) {
      const { container, unmount } = await renderCaseStudyPage(cs.slug);
      const diagSection = container.querySelector('[aria-labelledby="diagram-heading"]');
      const hasDiagramId = cs.diagramId != null;

      expect(
        diagSection !== null,
        `"${cs.slug}": diagram section present=${diagSection !== null} must equal hasDiagramId=${hasDiagramId}`,
      ).toBe(hasDiagramId);
      unmount();
    }
  });
});
