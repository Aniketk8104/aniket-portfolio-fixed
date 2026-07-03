/**
 * Property 11: Case Study Metric Fidelity
 *
 * **Validates: Requirements 6.4**
 *
 * The set of metric tiles rendered on CaseStudyPage equals
 * `entry.metrics ?? []` element-wise; no extra tiles are rendered.
 *
 * Strategies:
 *   - Enumerate all real `caseStudies` entries and verify metric tile count
 *     and content match exactly.
 *   - fast-check PBT with synthetic case studies injected into the live array,
 *     covering arbitrary metrics arrays.
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { caseStudies } from '../content/caseStudies';
import type { CaseStudyEntry } from '../content/caseStudies';
import { placeholder } from '../utils/placeholder';
import type { Metric, RichText } from '../types/content';
import CaseStudyPage from './CaseStudyPage';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const passthrough =
    (tag: string) =>
    ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { variants: _v, initial: _i, animate: _a, exit: _e, transition: _t,
        whileHover: _wh, whileTap: _wt, whileFocus: _wf, whileInView: _wi,
        viewport: _vp, ...domProps } = props as Record<string, unknown>;
      return React.createElement(tag, domProps as React.HTMLAttributes<HTMLElement>, children);
    };
  const m = new Proxy({} as Record<string, React.FC>, { get: (_, p: string) => passthrough(p) });
  return {
    m, motion: m,
    LazyMotion: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    domAnimation: {},
    useReducedMotion: () => false,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});

vi.mock('../design-system/motionVariants', () => ({
  fadeIn:  { hidden: { opacity: 1 }, visible: { opacity: 1 } },
  fadeUp:  { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
  scaleIn: { hidden: { opacity: 1, scale: 1 }, visible: { opacity: 1, scale: 1 } },
}));

// Diagram stubs — avoids lazy import complexity in tests
vi.mock('../components/diagrams/composed/DistributedMessagingDiagram', () => ({
  DistributedMessagingDiagram: () => React.createElement('svg', { 'data-testid': 'diagram-distributed-messaging' }),
}));
vi.mock('../components/diagrams/composed/AIRoutingDiagram', () => ({
  AIRoutingDiagram: () => React.createElement('svg', { 'data-testid': 'diagram-ai-routing' }),
}));
vi.mock('../components/diagrams/composed/MultiTenantSaaSDiagram', () => ({
  MultiTenantSaaSDiagram: () => React.createElement('svg', { 'data-testid': 'diagram-multi-tenant-saas' }),
}));
vi.mock('../components/diagrams/composed/WhatsAppInfrastructureDiagram', () => ({
  WhatsAppInfrastructureDiagram: () => React.createElement('svg', { 'data-testid': 'diagram-whatsapp-infrastructure' }),
}));
vi.mock('../components/diagrams/composed/HealthcareWorkflowDiagram', () => ({
  HealthcareWorkflowDiagram: () => React.createElement('svg', { 'data-testid': 'diagram-healthcare-workflow' }),
}));
vi.mock('../components/diagrams/composed/DeploymentInfrastructureDiagram', () => ({
  DeploymentInfrastructureDiagram: () => React.createElement('svg', { 'data-testid': 'diagram-deployment-infrastructure' }),
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
      --font-size-h2: 2rem;   --line-height-h2: 1.2;
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

function renderCaseStudyPage(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/case-studies/${slug}`]}>
        <Routes>
          <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
          <Route path="*" element={<div data-testid="not-found">Not found</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

/**
 * Find all MetricTile containers in the rendered output.
 * MetricTile renders: <div>  <span>{label}</span>  <span>{value}{unit?}</span>  </div>
 * We identify them by querying the "Key Metrics" section for the tile divs.
 * The metrics section has aria-labelledby="metrics-heading".
 */
function getMetricTiles(container: HTMLElement): HTMLElement[] {
  const section = container.querySelector('[aria-labelledby="metrics-heading"]');
  if (!section) return [];
  // The grid div is the direct child of the section after the h2.
  // Each direct child of the grid is a MetricTile.
  const grid = section.querySelector('div > div');
  if (!grid) return [];
  return Array.from(grid.parentElement?.children ?? []) as HTMLElement[];
}

function buildSyntheticEntry(
  slug: string,
  metrics: Metric[] | undefined,
): CaseStudyEntry {
  return {
    slug,
    projectSlug: 'bvisionr',
    title: `Synthetic Case Study ${slug}`,
    summary: placeholder<string>('summary'),
    role: placeholder<string>('role'),
    duration: placeholder<string>('duration'),
    status: 'draft',
    tags: [],
    metrics,
    sections: {
      overview:      placeholder<RichText>('overview'),
      context:       placeholder<RichText>('context'),
      problem:       placeholder<RichText>('problem'),
      constraints:   placeholder<RichText>('constraints'),
      architecture:  placeholder<RichText>('architecture'),
      decisions:     placeholder<RichText>('decisions'),
      tradeoffs:     placeholder<RichText>('tradeoffs'),
      outcomes:      placeholder<RichText>('outcomes'),
      lessons:       placeholder<RichText>('lessons'),
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 11: Case Study Metric Fidelity', () => {
  // ── P11-a: Real entries ───────────────────────────────────────────────────

  describe('P11-a: real case studies — metric tile count matches entry.metrics', () => {
    it.each(caseStudies.map((cs) => ({ slug: cs.slug, metrics: cs.metrics })))(
      'case study "$slug": metric tiles = (metrics ?? []).length',
      ({ slug, metrics }) => {
        const { container } = renderCaseStudyPage(slug);
        const expected = (metrics ?? []).length;

        if (expected === 0) {
          // No metrics section should be rendered
          const metricsSection = container.querySelector('[aria-labelledby="metrics-heading"]');
          expect(
            metricsSection,
            `"${slug}" has no metrics — metrics section must not be rendered`,
          ).toBeNull();
        } else {
          const tiles = getMetricTiles(container);
          expect(
            tiles.length,
            `"${slug}" has ${expected} metrics — expected ${expected} MetricTile(s), found ${tiles.length}`,
          ).toBe(expected);
        }
      },
    );
  });

  // ── P11-b: Synthetic — no metrics (undefined) → no tiles ─────────────────

  it('P11-b: entry.metrics = undefined → no metrics section rendered', () => {
    const slug = '__test-no-metrics__';
    const entry = buildSyntheticEntry(slug, undefined);
    caseStudies.push(entry);
    try {
      const { container } = renderCaseStudyPage(slug);
      const section = container.querySelector('[aria-labelledby="metrics-heading"]');
      expect(section, 'No metrics section for undefined metrics').toBeNull();
    } finally {
      const idx = caseStudies.indexOf(entry);
      if (idx !== -1) caseStudies.splice(idx, 1);
    }
  });

  // ── P11-c: Synthetic — empty array → no tiles ────────────────────────────

  it('P11-c: entry.metrics = [] → no metrics section rendered', () => {
    const slug = '__test-empty-metrics__';
    const entry = buildSyntheticEntry(slug, []);
    caseStudies.push(entry);
    try {
      const { container } = renderCaseStudyPage(slug);
      const section = container.querySelector('[aria-labelledby="metrics-heading"]');
      expect(section, 'No metrics section for empty metrics array').toBeNull();
    } finally {
      const idx = caseStudies.indexOf(entry);
      if (idx !== -1) caseStudies.splice(idx, 1);
    }
  });

  // ── P11-d: Synthetic — known metrics → correct count and content ──────────

  it('P11-d: entry.metrics = [3 metrics] → 3 tiles with correct labels and values', () => {
    const slug = '__test-three-metrics__';
    const metrics: Metric[] = [
      { label: 'Uptime',    value: '99.9',  unit: '%',  tone: 'positive' },
      { label: 'Latency',   value: '42',    unit: 'ms', tone: 'neutral'  },
      { label: 'Users',     value: '10000',             tone: 'positive' },
    ];
    const entry = buildSyntheticEntry(slug, metrics);
    caseStudies.push(entry);
    try {
      const { container } = renderCaseStudyPage(slug);
      const tiles = getMetricTiles(container);
      expect(tiles.length, '3 MetricTiles must be rendered').toBe(3);

      // Each metric's label and value must appear in the container text
      const text = container.textContent ?? '';
      for (const m of metrics) {
        expect(text, `Label "${m.label}" must appear`).toContain(m.label);
        expect(text, `Value "${m.value}" must appear`).toContain(m.value);
        if (m.unit) {
          expect(text, `Unit "${m.unit}" must appear`).toContain(m.unit);
        }
      }
    } finally {
      const idx = caseStudies.indexOf(entry);
      if (idx !== -1) caseStudies.splice(idx, 1);
    }
  });

  // ── P11-e (PBT): arbitrary metrics arrays ────────────────────────────────

  it('P11-e (PBT): for any generated metrics array, tile count equals array length', () => {
    const metricArb = fc.record<Metric>({
      label: fc.string({ minLength: 1, maxLength: 30 }),
      value: fc.string({ minLength: 1, maxLength: 20 }),
      unit:  fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
      tone:  fc.option(fc.constantFrom<'neutral' | 'positive'>('neutral', 'positive'), { nil: undefined }),
    });

    const metricsArb = fc.oneof(
      fc.constant(undefined),
      fc.constant([] as Metric[]),
      fc.array(metricArb, { minLength: 1, maxLength: 8 }),
    );

    fc.assert(
      fc.property(metricsArb, (metrics) => {
        const slug = `__pbt-metrics-${Date.now()}-${Math.random().toString(36).slice(2)}__`;
        const entry = buildSyntheticEntry(slug, metrics);
        caseStudies.push(entry);

        try {
          const { container } = renderCaseStudyPage(slug);
          const expected = (metrics ?? []).length;

          if (expected === 0) {
            const section = container.querySelector('[aria-labelledby="metrics-heading"]');
            expect(section, `${expected} metrics → no metrics section`).toBeNull();
          } else {
            const tiles = getMetricTiles(container);
            expect(
              tiles.length,
              `${expected} metrics → expected ${expected} MetricTile(s)`,
            ).toBe(expected);

            // Every metric's value must appear in the output
            const text = container.textContent ?? '';
            for (const m of (metrics as Metric[])) {
              expect(text, `Value "${m.value}" must appear`).toContain(m.value);
            }
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

  // ── P11-f: Unknown slug → NotFoundPage, no metrics ───────────────────────

  it('P11-f: unknown slug renders NotFoundPage — no metric tiles', () => {
    const { container } = renderCaseStudyPage('does-not-exist-at-all');
    const section = container.querySelector('[aria-labelledby="metrics-heading"]');
    expect(section).toBeNull();
    expect(screen.queryByText(/404/)).not.toBeNull();
  });
});
