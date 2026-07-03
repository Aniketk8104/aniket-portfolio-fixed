/**
 * DiagramCluster — Grouped boundary with title for related nodes.
 *
 * Renders a rounded rectangle boundary that visually groups nodes into
 * a logical cluster (e.g., a service group, VPC, or deployment unit).
 * Consumes design tokens via CSS variables and wraps in framer-motion
 * with reduced-motion guards.
 *
 * @module components/diagrams/primitives/DiagramCluster
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

import React from 'react';
import { m } from 'framer-motion';
import { fadeIn } from '../../../design-system/motionVariants';
import type { DiagramClusterProps, Tone } from './types';

/**
 * Maps tone to fill and stroke colors using CSS custom properties.
 */
const toneStyles: Record<Tone, { fill: string; stroke: string }> = {
  neutral: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-border)',
  },
  primary: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-accent-primary)',
  },
  secondary: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-accent-secondary)',
  },
  success: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-success)',
  },
  warning: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-warning)',
  },
  danger: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-danger)',
  },
};

export const DiagramCluster: React.FC<DiagramClusterProps> = ({
  label,
  bounds,
  tone = 'neutral',
  children,
  id,
  className,
  ariaLabel,
}) => {
  const styles = toneStyles[tone];

  return (
    <m.g
      id={id}
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      role="group"
      aria-label={ariaLabel || `${label} cluster`}
    >
      {/* Cluster boundary */}
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        fill={styles.fill}
        fillOpacity={0.3}
        stroke={styles.stroke}
        strokeWidth="1"
        rx="var(--radius-lg, 16)"
        ry="var(--radius-lg, 16)"
        opacity={0.6}
      />

      {/* Cluster label */}
      <text
        x={bounds.x + 12}
        y={bounds.y + 18}
        fontSize="11"
        fontWeight="600"
        fill="var(--color-text-secondary)"
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>

      {/* Child elements */}
      {children}
    </m.g>
  );
};

export default DiagramCluster;
