/**
 * Diagram Primitives Type Definitions
 * 
 * This module re-exports and extends diagram types for use within primitive components.
 * It provides component-specific prop interfaces that build on the base diagram types.
 * 
 * @module components/diagrams/primitives/types
 */

// Re-export all base diagram types for convenience
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
} from '../../../types/diagrams';

import type { ReactNode } from 'react';
import type {
  DiagramProps,
  NodeVariant,
  EdgeStyle,
  ArrowheadType,
  AnchorRef,
  Coordinate,
  Bounds,
  Orientation,
  Placement,
  Tone,
  LegendItem,
} from '../../../types/diagrams';

/**
 * Props for the DiagramCanvas component.
 * The root SVG container for all diagram primitives.
 */
export interface DiagramCanvasProps extends DiagramProps {
  /** Accessible title for the diagram */
  title: string;
  /** Detailed description for screen readers */
  description: string;
  /** SVG viewBox attribute (e.g., "0 0 800 600") */
  viewBox: string;
  /** Width of the canvas (can be responsive, e.g., "100%") */
  width?: string | number;
  /** Aspect ratio for responsive sizing (e.g., 16/9) */
  aspectRatio?: number;
  /** Child diagram elements */
  children?: ReactNode;
}

/**
 * Props for the DiagramNode component.
 * Represents a single node in the architecture diagram.
 */
export interface DiagramNodeProps extends DiagramProps {
  /** Visual variant representing the node type */
  variant: NodeVariant;
  /** Primary label text */
  label: string;
  /** Optional secondary label or subtitle */
  sublabel?: string;
  /** Optional icon element or icon name */
  icon?: ReactNode | string;
  /** X coordinate position */
  x: number;
  /** Y coordinate position */
  y: number;
  /** Node width */
  width?: number;
  /** Node height */
  height?: number;
  /** Whether the node is highlighted or selected */
  highlighted?: boolean;
}

/**
 * Props for the DiagramEdge component.
 * Represents a connection between two nodes.
 */
export interface DiagramEdgeProps extends DiagramProps {
  /** Source anchor reference */
  from: AnchorRef | Coordinate;
  /** Target anchor reference */
  to: AnchorRef | Coordinate;
  /** Visual style of the edge line */
  style?: EdgeStyle;
  /** Arrowhead configuration */
  arrowhead?: ArrowheadType;
  /** Optional label text for the edge */
  label?: string;
  /** Whether the edge should animate (e.g., data flow) */
  animated?: boolean;
}

/**
 * Props for the DiagramLane component.
 * Represents a swimlane for grouping related nodes.
 */
export interface DiagramLaneProps extends DiagramProps {
  /** Orientation of the lane */
  orientation: Orientation;
  /** Lane label text */
  label: string;
  /** Bounds of the lane */
  bounds: Bounds;
  /** Optional tone for visual distinction */
  tone?: Tone;
  /** Child elements within the lane */
  children?: ReactNode;
}

/**
 * Props for the DiagramCluster component.
 * Represents a grouped boundary with a title.
 */
export interface DiagramClusterProps extends DiagramProps {
  /** Cluster label text */
  label: string;
  /** Bounds of the cluster */
  bounds: Bounds;
  /** Optional tone for visual distinction */
  tone?: Tone;
  /** Child elements within the cluster */
  children?: ReactNode;
}

/**
 * Props for the DiagramAnnotation component.
 * Represents a callout or note pointing to a diagram element.
 */
export interface DiagramAnnotationProps extends DiagramProps {
  /** Target coordinate or node reference */
  target: Coordinate | string;
  /** Annotation text content */
  text: string;
  /** Placement relative to the target */
  placement?: Placement;
}

/**
 * Props for the DiagramLegend component.
 * Displays a legend panel for the diagram.
 */
export interface DiagramLegendProps extends DiagramProps {
  /** Legend items to display */
  items: LegendItem[];
  /** Position of the legend */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Props for the DiagramGrid component.
 * Layout helper that places children on a coarse grid.
 */
export interface DiagramGridProps extends DiagramProps {
  /** Number of columns */
  columns: number;
  /** Number of rows */
  rows: number;
  /** Gap between grid cells */
  gap?: number;
  /** Child elements to place on the grid */
  children?: ReactNode;
}
