/**
 * DiagramLegend — Legend panel for diagram color/shape meanings.
 *
 * Renders a positioned legend panel with colored shapes and labels.
 * Supports four corner positions within the diagram canvas.
 * Consumes design tokens via CSS variables and wraps in framer-motion
 * with reduced-motion guards.
 *
 * @module components/diagrams/primitives/DiagramLegend
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

import React from 'react';
import { m } from 'framer-motion';
import { fadeIn } from '../../../design-system/motionVariants';
import type { DiagramLegendProps, LegendShape } from './types';

const ITEM_HEIGHT = 20;
const PADDING = 12;
const SHAPE_SIZE = 10;

/**
 * Renders a legend shape (circle, square, diamond, or line).
 */
function renderShape(shape: LegendShape, color: string, x: number, y: number): React.ReactNode {
  switch (shape) {
    case 'circle':
      return (
        <circle
          cx={x + SHAPE_SIZE / 2}
          cy={y + SHAPE_SIZE / 2}
          r={SHAPE_SIZE / 2}
          fill={color}
        />
      );
    case 'square':
      return (
        <rect
          x={x}
          y={y}
          width={SHAPE_SIZE}
          height={SHAPE_SIZE}
          rx="2"
          fill={color}
        />
      );
    case 'diamond':
      return (
        <polygon
          points={`${x + SHAPE_SIZE / 2},${y} ${x + SHAPE_SIZE},${y + SHAPE_SIZE / 2} ${x + SHAPE_SIZE / 2},${y + SHAPE_SIZE} ${x},${y + SHAPE_SIZE / 2}`}
          fill={color}
        />
      );
    case 'line':
      return (
        <line
          x1={x}
          y1={y + SHAPE_SIZE / 2}
          x2={x + SHAPE_SIZE}
          y2={y + SHAPE_SIZE / 2}
          stroke={color}
          strokeWidth="2"
        />
      );
    default:
      return null;
  }
}

export const DiagramLegend: React.FC<DiagramLegendProps> = ({
  items,
  position = 'bottom-right',
  id,
  className,
  ariaLabel,
}) => {
  if (items.length === 0) return null;

  const legendWidth = 140;
  const legendHeight = PADDING * 2 + items.length * ITEM_HEIGHT;

  // Position transform is applied by the parent canvas or composed diagram
  // The legend renders at (0, 0) and relies on a wrapping <g transform="...">
  // or absolute positioning from the composed diagram.

  return (
    <m.g
      id={id}
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      role="group"
      aria-label={ariaLabel || 'Diagram legend'}
      data-position={position}
    >
      {/* Legend background */}
      <rect
        x={0}
        y={0}
        width={legendWidth}
        height={legendHeight}
        fill="var(--color-surface)"
        fillOpacity={0.85}
        stroke="var(--color-border)"
        strokeWidth="1"
        rx="var(--radius-sm, 4)"
        ry="var(--radius-sm, 4)"
      />

      {/* Legend items */}
      {items.map((item, index) => {
        const itemY = PADDING + index * ITEM_HEIGHT;
        return (
          <g key={`${item.label}-${index}`}>
            {renderShape(item.shape, item.color, PADDING, itemY)}
            <text
              x={PADDING + SHAPE_SIZE + 8}
              y={itemY + SHAPE_SIZE / 2 + 1}
              dominantBaseline="middle"
              fontSize="10"
              fill="var(--color-text-secondary)"
              fontFamily="var(--font-sans)"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </m.g>
  );
};

export default DiagramLegend;
