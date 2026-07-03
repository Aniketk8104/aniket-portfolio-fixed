/**
 * DiagramLane — Horizontal or vertical swimlane for grouping nodes.
 *
 * Renders a labeled rectangular region that visually groups related nodes.
 * Supports horizontal and vertical orientations with optional tone coloring.
 * Consumes design tokens via CSS variables and wraps in framer-motion
 * with reduced-motion guards.
 *
 * @module components/diagrams/primitives/DiagramLane
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

import React from 'react';
import { m } from 'framer-motion';
import { fadeIn } from '../../../design-system/motionVariants';
import type { DiagramLaneProps, Tone } from './types';

/**
 * Maps tone to a subtle border color using CSS custom properties.
 */
const toneColors: Record<Tone, string> = {
  neutral: 'var(--color-border)',
  primary: 'var(--color-accent-primary)',
  secondary: 'var(--color-accent-secondary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

export const DiagramLane: React.FC<DiagramLaneProps> = ({
  orientation,
  label,
  bounds,
  tone = 'neutral',
  children,
  id,
  className,
  ariaLabel,
}) => {
  const borderColor = toneColors[tone];
  const isHorizontal = orientation === 'horizontal';

  // Label positioning based on orientation
  const labelX = isHorizontal ? bounds.x + 8 : bounds.x + bounds.width / 2;
  const labelY = isHorizontal ? bounds.y + 14 : bounds.y + 14;

  return (
    <m.g
      id={id}
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      role="group"
      aria-label={ariaLabel || `${label} lane`}
    >
      {/* Lane background */}
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        fill="none"
        stroke={borderColor}
        strokeWidth="1"
        strokeDasharray="4 2"
        rx="var(--radius-sm, 4)"
        ry="var(--radius-sm, 4)"
        opacity={0.5}
      />

      {/* Lane label */}
      <text
        x={labelX}
        y={labelY}
        textAnchor={isHorizontal ? 'start' : 'middle'}
        fontSize="11"
        fontWeight="600"
        fill="var(--color-text-muted)"
        fontFamily="var(--font-sans)"
        style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {label}
      </text>

      {/* Child elements */}
      {children}
    </m.g>
  );
};

export default DiagramLane;
