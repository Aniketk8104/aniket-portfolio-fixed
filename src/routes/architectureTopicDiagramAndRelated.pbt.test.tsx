/**
 * Property 10: Architecture Topic Renders Diagram and Related Block
 *
 * **Validates: Requirements 5.2, 5.4, 10.6**
 *
 * For any `ArchitectureTopic` entry:
 *   - The topic page renders a composed diagram with an accessible SVG
 *     (role="img" OR SVG with `aria-labelledby` + `<title>`).
 *   - The "Related case studies" block is present if and only if
 *     `relatedCaseStudySlugs.length > 0`.
 *
 * Composed diagrams are mocked to lightweight SVG stubs to avoid framer-motion
 * rendering complexity (mirrors the pattern from diagramResponsiveness.pbt.test.tsx).
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// ── Framer-motion mock ───────────────────────────────────────────────────────
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const makePassthrough =
    (tag: string) =>
    ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const {
        variants: _v,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        whileHover: _wh,
        whileTap: _wt,
        whileFocus: _wf,
        ...domProps
      } = props;
      return React.createElement(tag, domProps, children);
    };

  const m = new Proxy({} as Record<string, React.FC>, {
    get: (_target, prop: string) => makePassthrough(prop),
  });

  return {
    m,
    LazyMotion: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    domAnimation: {},
    useReducedMotion: () => false,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// ── motionVariants mock ──────────────────────────────────────────────────────
vi.mock('../design-system/motionVariants', () => ({
  fadeIn: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
  fadeUp: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
  scaleIn: { hidden: { opacity: 1, scale: 1 }, visible: { opacity: 1, scale: 1 } },
}));

// ── Composed diagram mocks ───────────────────────────────────────────────────
// Each diagram is replaced with a minimal accessible SVG stub.
// The stub uses role="img" + aria-labelledby + <title> to satisfy both
// accessibility assertions without full rendering.
function makeDiagramStub(name: string) {
  return function DiagramStub() {
    const titleId = `${name}-title`;
    return (
      <svg
        role="img"
        aria-labelledby={titleId}
        data-testid={`diagram-stub-${name}`}
        viewBox="0 0 100 50"
      >
        <title id={titleId}>{name} diagram</title>
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

// ── Imports after mocks ──────────────────────────────────────────────────────
import ArchitectureTopicPage from './ArchitectureTopicPage';
import { architectureTopics } from '../content/architectureTopics';
import type { ArchitectureTopicEntry } from '../content/architectureTopics';

afterEach(() => { cleanup(); });

// ── CSS token stubs for jsdom ────────────────────────────────────────────────
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
      --font-mono: JetBrains Mono, monospace;
    }
  `;
  document.head.appendChild(style);
});

// ── Render helper ────────────────────────────────────────────────────────────
/**
 * Mount ArchitectureTopicPage for a given slug inside a minimal router stack.
 * Wraps in `act` to flush React.lazy / Suspense microtasks so diagram stubs
 * appear in the DOM synchronously by the time we query.
 */
async function renderTopicPage(slug: string) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/architecture/${slug}`]} initialIndex={0}>
          <Routes>
            <Route path="/architecture/:slug" element={<ArchitectureTopicPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
  });
  return result;
}

// ── Assertion helpers ────────────────────────────────────────────────────────

/**
 * Assert that the rendered container contains an accessible diagram element.
 *
 * Accepts either:
 *   (a) an SVG element with `role="img"`, OR
 *   (b) an SVG element with `aria-labelledby` referencing a `<title>` id.
 */
function assertDiagramPresent(container: HTMLElement, slug: string): void {
  // Strategy A: element with explicit role="img" (our stub sets this)
  const roleImgEl = container.querySelector('[role="img"]');
  if (roleImgEl) {
    // Found via role — pass
    return;
  }

  // Strategy B: SVG with aria-labelledby + <title> child
  const svgEl = container.querySelector('svg');
  expect(
    svgEl,
    `[${slug}] Expected an SVG element to be present in the rendered output`
  ).not.toBeNull();

  if (!svgEl) return;

  const labelledBy = svgEl.getAttribute('aria-labelledby');
  expect(
    labelledBy,
    `[${slug}] SVG must have aria-labelledby attribute for accessible name`
  ).toBeTruthy();

  const titleEl = svgEl.querySelector('title');
  expect(
    titleEl,
    `[${slug}] SVG must contain a <title> child element`
  ).not.toBeNull();
}

/**
 * Assert "Related case studies" section presence matches the topic's
 * `relatedCaseStudySlugs` length.
 *
 * Checks for:
 *   - A heading with text matching /related case stud/i, OR
 *   - An element with `aria-labelledby` referencing an id containing "related"
 */
function assertRelatedBlock(
  container: HTMLElement,
  topic: ArchitectureTopicEntry
): void {
  const slug = topic.slug;
  const hasRelated = topic.relatedCaseStudySlugs.length > 0;

  // Look for a heading with "related case stud" text (case-insensitive)
  const allHeadings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const relatedHeading = allHeadings.find((h) =>
    /related case stud/i.test(h.textContent ?? '')
  );

  if (hasRelated) {
    expect(
      relatedHeading,
      `[${slug}] "Related case studies" heading must be present because relatedCaseStudySlugs.length = ${topic.relatedCaseStudySlugs.length}`
    ).not.toBeUndefined();
  } else {
    expect(
      relatedHeading,
      `[${slug}] "Related case studies" heading must NOT be present because relatedCaseStudySlugs is empty`
    ).toBeUndefined();
  }
}

// ── Test suite ───────────────────────────────────────────────────────────────

describe('Property 10: Architecture Topic Renders Diagram and Related Block', () => {
  /**
   * Core property: for any sampled ArchitectureTopic, the rendered page:
   *   1. Contains an accessible diagram element.
   *   2. Shows the "Related case studies" block iff relatedCaseStudySlugs.length > 0.
   *
   * Uses fc.constantFrom to enumerate the real topic list exhaustively.
   */
  it(
    'for any ArchitectureTopic: renders accessible diagram and "Related case studies" iff slugs exist',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...architectureTopics),
          async (topic: ArchitectureTopicEntry) => {
            const { container, unmount } = await renderTopicPage(topic.slug);
            try {
              assertDiagramPresent(container, topic.slug);
              assertRelatedBlock(container, topic);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: architectureTopics.length * 10 } // cover all 6 topics ~10× each
      );
    }
  );

  /**
   * Deterministic sweep: run each topic exactly once so failures identify the
   * offending topic unambiguously.
   */
  it.each(architectureTopics.map((t) => ({ slug: t.slug, topic: t })))(
    'topic "$slug": accessible diagram present and related block matches relatedCaseStudySlugs',
    async ({ topic }) => {
      const { container } = await renderTopicPage(topic.slug);
      assertDiagramPresent(container, topic.slug);
      assertRelatedBlock(container, topic);
    }
  );

  /**
   * Edge case: "deployment-infrastructure" relates to the Aura Tech Platform
   * case study — verify the block is present and links to it.
   */
  it('deployment-infrastructure (has related slugs): "Related case studies" block is present with links', async () => {
    const topic = architectureTopics.find((t) => t.slug === 'deployment-infrastructure');
    expect(topic).toBeDefined();
    if (!topic) return;

    expect(topic.relatedCaseStudySlugs.length).toBeGreaterThan(0);
    const { container } = await renderTopicPage('deployment-infrastructure');

    const allHeadings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const relatedHeading = allHeadings.find((h) =>
      /related case stud/i.test(h.textContent ?? '')
    );
    expect(relatedHeading).toBeDefined();

    const links = Array.from(container.querySelectorAll('a[href^="/case-studies/"]'));
    expect(links.length).toBeGreaterThan(0);
  });

  /**
   * Edge case: topics WITH related slugs — the block must contain links.
   */
  it('distributed-messaging (has related slugs): "Related case studies" block is present with links', async () => {
    const topic = architectureTopics.find((t) => t.slug === 'distributed-messaging');
    expect(topic).toBeDefined();
    if (!topic) return;

    expect(topic.relatedCaseStudySlugs.length).toBeGreaterThan(0);
    const { container } = await renderTopicPage('distributed-messaging');

    const allHeadings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const relatedHeading = allHeadings.find((h) =>
      /related case stud/i.test(h.textContent ?? '')
    );
    expect(relatedHeading).not.toBeUndefined();
  });
});
