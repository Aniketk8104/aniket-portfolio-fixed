/**
 * Diagram Primitives — Barrel Export
 *
 * Exports all diagram primitive components, types, and hooks.
 * These primitives are composed by the diagrams in `../composed/`
 * to build architecture-specific visualizations.
 *
 * @module components/diagrams/primitives
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

// Components
export { DiagramCanvas } from './DiagramCanvas';
export { DiagramNode } from './DiagramNode';
export { DiagramEdge } from './DiagramEdge';
export { DiagramLane } from './DiagramLane';
export { DiagramCluster } from './DiagramCluster';
export { DiagramAnnotation } from './DiagramAnnotation';
export { DiagramLegend } from './DiagramLegend';
export { DiagramGrid } from './DiagramGrid';

// Hook
export { useDiagramAccessibilityIds } from './useDiagramAccessibilityIds';
export type { DiagramAccessibilityIds } from './useDiagramAccessibilityIds';

// Types
export type {
  DiagramProps,
  NodeVariant,
  EdgeStyle,
  ArrowheadType,
  AnchorPosition,
  AnchorRef,
  Coordinate,
  Bounds,
  Orientation,
  Placement,
  Tone,
  LegendShape,
  LegendItem,
  DiagramCanvasProps,
  DiagramNodeProps,
  DiagramEdgeProps,
  DiagramLaneProps,
  DiagramClusterProps,
  DiagramAnnotationProps,
  DiagramLegendProps,
  DiagramGridProps,
} from './types';
