/**
 * DiagramAnnotation — Callout pointing at a node or coordinate.
 *
 * Renders a text annotation with a connecting line to a target point.
 * Supports multiple placement options relative to the target.
 * Consumes design tokens via CSS variables and wraps in framer-motion
 * with reduced-motion guards.
 *
 * @module components/diagrams/primitives/DiagramAnnotation
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

import React from 'react';
import { m } from 'framer-motion';
import { fadeIn } from '../../../design-system/motionVariants';
import type { DiagramAnnotationProps, Coordinate, Placement } from './types';

/**
 * Calculates the annotation text offset based on placement.
 */
function getOffset(placement: Placement): { dx: number; dy: number } {
  switch (placement) {
    case 'top':
      return { dx: 0, dy: -24 };
    case 'bottom':
      return { dx: 0, dy: 24 };
    case 'left':
      return { dx: -24, dy: 0 };
    case 'right':
      return { dx: 24, dy: 0 };
    case 'top-left':
      return { dx: -20, dy: -20 };
    case 'top-right':
      return { dx: 20, dy: -20 };
    case 'bottom-left':
      return { dx: -20, dy: 20 };
    case 'bottom-right':
      return { dx: 20, dy: 20 };
    default:
      return { dx: 0, dy: -24 };
  }
}

/**
 * Resolves target to a coordinate.
 * If target is a string (node ID), the parent composed diagram should
 * resolve it to coordinates before passing to this component.
 */
function resolveTarget(target: Coordinate | string): Coordinate {
  if (typeof target === 'object' && 'x' in target && 'y' in target) {
    return target;
  }
  // String targets should be pre-resolved by the composed diagram
  return { x: 0, y: 0 };
}

export const DiagramAnnotation: React.FC<DiagramAnnotationProps> = ({
  target,
  text,
  placement = 'top',
  id,
  className,
  ariaLabel,
}) => {
  const point = resolveTarget(target);
  const offset = getOffset(placement);

  const textX = point.x + offset.dx;
  const textY = point.y + offset.dy;

  return (
    <m.g
      id={id}
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      role="note"
      aria-label={ariaLabel || text}
    >
      {/* Connecting line from target to annotation */}
      <line
        x1={point.x}
        y1={point.y}
        x2={textX}
        y2={textY}
        stroke="var(--color-text-muted)"
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity={0.5}
      />

      {/* Annotation dot at target */}
      <circle
        cx={point.x}
        cy={point.y}
        r="3"
        fill="var(--color-accent-primary)"
        opacity={0.8}
      />

      {/* Annotation text */}
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fontStyle="italic"
        fill="var(--color-text-muted)"
        fontFamily="var(--font-sans)"
      >
        {text}
      </text>
    </m.g>
  );
};

export default DiagramAnnotation;
