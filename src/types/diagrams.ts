/**
 * Diagram type definitions for the SVG diagram primitive library.
 * 
 * This module defines the base interfaces and types used across all diagram primitives.
 * All diagram components consume these types to ensure consistency and type safety.
 * 
 * @module types/diagrams
 */

/**
 * Base props interface for all diagram components.
 * Provides common properties that all diagram primitives should support.
 */
export interface DiagramProps {
  /** Unique identifier for the diagram element */
  id?: string;
  /** Additional CSS class names */
  className?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * Node variant types representing different architectural components.
 * Each variant may have distinct visual styling to represent its role in the system.
 */
export type NodeVariant = 
  | 'service'      // Backend service or API
  | 'datastore'    // Database or persistent storage
  | 'queue'        // Message queue or event stream
  | 'external'     // External service or third-party API
  | 'user'         // User or client
  | 'lambda';      // Serverless function or lambda

/**
 * Edge style types for connectors between nodes.
 */
export type EdgeStyle = 
  | 'solid'        // Solid line for direct connections
  | 'dashed';      // Dashed line for indirect or conditional connections

/**
 * Arrowhead configuration for edges.
 */
export type ArrowheadType = 
  | 'none'         // No arrowhead
  | 'end'          // Arrowhead at the end of the edge
  | 'both';        // Arrowheads at both ends

/**
 * Anchor position types for edge connections.
 * Defines where an edge connects to a node.
 */
export type AnchorPosition = 
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'center';

/**
 * Anchor reference for edge connections.
 * Can be a node ID with optional position, or explicit coordinates.
 */
export interface AnchorRef {
  /** Target node ID */
  nodeId: string;
  /** Position on the node where the edge connects */
  position?: AnchorPosition;
}

/**
 * Coordinate pair for positioning elements.
 */
export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Bounding box for diagram elements.
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Orientation for layout elements like lanes.
 */
export type Orientation = 
  | 'horizontal'
  | 'vertical';

/**
 * Placement options for annotations and labels.
 */
export type Placement = 
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Tone/semantic color variants for diagram elements.
 */
export type Tone = 
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

/**
 * Shape types for legend items.
 */
export type LegendShape = 
  | 'circle'
  | 'square'
  | 'diamond'
  | 'line';

/**
 * Legend item definition.
 */
export interface LegendItem {
  /** Display label */
  label: string;
  /** Color token or hex value */
  color: string;
  /** Shape to display */
  shape: LegendShape;
}
