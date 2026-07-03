/**
 * DiagramEdge — Connector between two diagram nodes.
 *
 * Renders a line (solid or dashed) between two coordinate points with
 * optional arrowheads and labels. Supports animated data-flow indication.
 * Consumes design tokens via CSS variables and wraps in framer-motion
 * with reduced-motion guards.
 *
 * @module components/diagrams/primitives/DiagramEdge
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

import React from 'react';
import { m } from 'framer-motion';
import { fadeIn } from '../../../design-system/motionVariants';
import type { DiagramEdgeProps, Coordinate, AnchorRef } from './types';

/**
 * Resolves an anchor reference to coordinates.
 * For coordinate-based anchors, returns directly.
 * For node-based anchors, the parent composed diagram should resolve
 * node positions before passing to this component.
 */
function resolveCoordinate(anchor: AnchorRef | Coordinate): Coordinate {
  if ('x' in anchor && 'y' in anchor) {
    return anchor as Coordinate;
  }
  // AnchorRef should be pre-resolved to coordinates by the composed diagram
  // Default to origin if not resolved
  return { x: 0, y: 0 };
}

/**
 * Generates a unique marker ID for arrowheads.
 */
let edgeCounter = 0;
function getMarkerId(): string {
  return `diagram-edge-marker-${++edgeCounter}`;
}

export const DiagramEdge: React.FC<DiagramEdgeProps> = ({
  from,
  to,
  style = 'solid',
  arrowhead = 'end',
  label,
  animated = false,
  id,
  className,
  ariaLabel,
}) => {
  const start = resolveCoordinate(from);
  const end = resolveCoordinate(to);
  const markerId = React.useMemo(() => getMarkerId(), []);

  const strokeColor = 'var(--color-border)';
  const strokeWidth = 1.5;
  const dashArray = style === 'dashed' ? '6 4' : undefined;

  // Calculate midpoint for label placement
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <m.g
      id={id}
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      role="graphics-symbol"
      aria-label={ariaLabel || label || 'connection'}
    >
      {/* Arrowhead marker definition */}
      {arrowhead !== 'none' && (
        <defs>
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L8,3 L0,6"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1"
            />
          </marker>
        </defs>
      )}

      {/* Edge line */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        markerEnd={arrowhead === 'end' || arrowhead === 'both' ? `url(#${markerId})` : undefined}
        markerStart={arrowhead === 'both' ? `url(#${markerId})` : undefined}
        opacity={0.7}
      />

      {/* Animated flow indicator */}
      {animated && (
        <circle
          r="3"
          fill="var(--color-accent-primary)"
          opacity={0.8}
        >
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={`M${start.x},${start.y} L${end.x},${end.y}`}
          />
        </circle>
      )}

      {/* Edge label */}
      {label && (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          fontSize="10"
          fill="var(--color-text-muted)"
          fontFamily="var(--font-sans)"
        >
          {label}
        </text>
      )}
    </m.g>
  );
};

export default DiagramEdge;
