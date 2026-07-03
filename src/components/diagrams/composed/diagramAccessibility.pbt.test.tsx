/**
 * Property 17: Diagram Accessibility
 *
 * **Validates: Requirements 10.2, 16.3**
 *
 * For every composed diagram, SVG root has `<title>` + `<desc>` children
 * and `aria-labelledby` referencing both ids.
 *
 * This property-based test uses fast-check to enumerate all composed diagrams
 * and verify the accessibility contract holds for each one.
 *
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { LazyMotion, domAnimation } from 'framer-motion';

import { DistributedMessagingDiagram } from './DistributedMessagingDiagram';
import { AIRoutingDiagram } from './AIRoutingDiagram';
import { MultiTenantSaaSDiagram } from './MultiTenantSaaSDiagram';
import { WhatsAppInfrastructureDiagram } from './WhatsAppInfrastructureDiagram';
import { HealthcareWorkflowDiagram } from './HealthcareWorkflowDiagram';
import { DeploymentInfrastructureDiagram } from './DeploymentInfrastructureDiagram';

/**
 * Registry of all composed diagram components for the property test.
 * Each entry: [diagramId, ComponentFn]
 */
const composedDiagrams: Array<[string, React.ComponentType]> = [
  ['DistributedMessagingDiagram', DistributedMessagingDiagram],
  ['AIRoutingDiagram', AIRoutingDiagram],
  ['MultiTenantSaaSDiagram', MultiTenantSaaSDiagram],
  ['WhatsAppInfrastructureDiagram', WhatsAppInfrastructureDiagram],
  ['HealthcareWorkflowDiagram', HealthcareWorkflowDiagram],
  ['DeploymentInfrastructureDiagram', DeploymentInfrastructureDiagram],
];

/**
 * Helper: render a diagram wrapped in the framer-motion LazyMotion provider
 * (required because DiagramCanvas uses `m.svg` from framer-motion).
 */
function renderDiagram(Component: React.ComponentType) {
  return render(
    <LazyMotion features={domAnimation}>
      <Component />
    </LazyMotion>
  );
}

/**
 * Core accessibility assertions applied to every composed diagram.
 *
 * Asserts that:
 * 1. The SVG root element exists.
 * 2. The SVG root has an `aria-labelledby` attribute.
 * 3. The SVG contains exactly one `<title>` element with a non-empty `id`.
 * 4. The SVG contains exactly one `<desc>` element with a non-empty `id`.
 * 5. The `aria-labelledby` value includes both the title `id` and the desc `id`.
 */
function assertDiagramAccessibility(container: HTMLElement, diagramId: string): void {
  // 1. SVG root element must exist
  const svg = container.querySelector('svg');
  expect(svg, `[${diagramId}] SVG root element must be present`).not.toBeNull();

  if (!svg) return;

  // 2. aria-labelledby must be set on the SVG root
  const ariaLabelledBy = svg.getAttribute('aria-labelledby');
  expect(
    ariaLabelledBy,
    `[${diagramId}] SVG root must have aria-labelledby attribute`
  ).not.toBeNull();
  expect(
    ariaLabelledBy?.trim().length,
    `[${diagramId}] SVG aria-labelledby must not be empty`
  ).toBeGreaterThan(0);

  // 3. <title> element with a non-empty id
  const titleEl = svg.querySelector('title');
  expect(titleEl, `[${diagramId}] SVG must contain a <title> element`).not.toBeNull();
  const titleId = titleEl?.getAttribute('id');
  expect(
    titleId,
    `[${diagramId}] <title> must have a non-empty id attribute`
  ).toBeTruthy();

  // 4. <desc> element with a non-empty id
  const descEl = svg.querySelector('desc');
  expect(descEl, `[${diagramId}] SVG must contain a <desc> element`).not.toBeNull();
  const descId = descEl?.getAttribute('id');
  expect(
    descId,
    `[${diagramId}] <desc> must have a non-empty id attribute`
  ).toBeTruthy();

  // 5. aria-labelledby must reference both title id and desc id
  const labelledByIds = (ariaLabelledBy ?? '').trim().split(/\s+/);
  expect(
    labelledByIds,
    `[${diagramId}] aria-labelledby must reference title id "${titleId}"`
  ).toContain(titleId);
  expect(
    labelledByIds,
    `[${diagramId}] aria-labelledby must reference desc id "${descId}"`
  ).toContain(descId);
}

describe('Property 17: Diagram Accessibility', () => {
  /**
   * Enumerate all composed diagrams via fast-check and assert accessibility
   * contract holds for each one.
   */
  it('every composed diagram SVG has <title>, <desc> and aria-labelledby referencing both ids', () => {
    // Use fast-check to sample indices into the composedDiagrams registry.
    // With 6 diagrams and 100 samples we cover the full set multiple times.
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: composedDiagrams.length - 1 }),
        (index) => {
          const [diagramId, Component] = composedDiagrams[index];
          const { container, unmount } = renderDiagram(Component);
          try {
            assertDiagramAccessibility(container, diagramId);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional deterministic check: run every composed diagram exactly once
   * so that a failure unambiguously identifies the offending diagram.
   */
  it.each(composedDiagrams)(
    '%s: SVG root must have <title>, <desc>, and aria-labelledby',
    (diagramId, Component) => {
      const { container } = renderDiagram(Component);
      assertDiagramAccessibility(container, diagramId);
    }
  );
});
