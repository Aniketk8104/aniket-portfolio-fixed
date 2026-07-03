/**
 * DiagramNode — Single node primitive for architecture diagrams.
 *
 * Renders a styled rectangle with label, sublabel, and optional icon.
 * Visual variant determines the node's color scheme (service, datastore,
 * queue, external, user, lambda). Consumes design tokens via CSS variables
 * and wraps in framer-motion with reduced-motion guards.
 *
 * @module components/diagrams/primitives/DiagramNode
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

import React from 'react';
import { m } from 'framer-motion';
import { fadeUp } from '../../../design-system/motionVariants';
import type { DiagramNodeProps, NodeVariant } from './types';

/**
 * Maps node variants to token-based color schemes.
 * Uses CSS custom properties for consistent theming.
 */
const variantStyles: Record<NodeVariant, { fill: string; stroke: string; textFill: string }> = {
  service: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-accent-primary)',
    textFill: 'var(--color-text-primary)',
  },
  datastore: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-success)',
    textFill: 'var(--color-text-primary)',
  },
  queue: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-warning)',
    textFill: 'var(--color-text-primary)',
  },
  external: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-text-muted)',
    textFill: 'var(--color-text-secondary)',
  },
  user: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-accent-secondary)',
    textFill: 'var(--color-text-primary)',
  },
  lambda: {
    fill: 'var(--color-surface)',
    stroke: 'var(--color-accent-primary)',
    textFill: 'var(--color-text-primary)',
  },
};

const DEFAULT_WIDTH = 140;
const DEFAULT_HEIGHT = 60;

export const DiagramNode: React.FC<DiagramNodeProps> = ({
  variant,
  label,
  sublabel,
  icon,
  x,
  y,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  highlighted = false,
  id,
  className,
  ariaLabel,
}) => {
  const styles = variantStyles[variant];
  const rx = 'var(--radius-md, 8)';

  return (
    <m.g
      id={id}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      aria-label={ariaLabel || label}
      role="graphics-symbol"
    >
      {/* Node background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        ry={rx}
        fill={styles.fill}
        stroke={styles.stroke}
        strokeWidth={highlighted ? 2 : 1.5}
        opacity={highlighted ? 1 : 0.9}
      />

      {/* Icon (if provided as ReactNode, render as foreignObject; if string, render as text) */}
      {icon && typeof icon === 'string' && (
        <text
          x={x + 12}
          y={y + height / 2 + 1}
          fontSize="14"
          fill={styles.textFill}
          dominantBaseline="middle"
          fontFamily="var(--font-mono)"
        >
          {icon}
        </text>
      )}

      {/* Primary label */}
      <text
        x={x + width / 2}
        y={sublabel ? y + height / 2 - 6 : y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="500"
        fill={styles.textFill}
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>

      {/* Sublabel */}
      {sublabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="var(--color-text-muted)"
          fontFamily="var(--font-sans)"
        >
          {sublabel}
        </text>
      )}
    </m.g>
  );
};

export default DiagramNode;
