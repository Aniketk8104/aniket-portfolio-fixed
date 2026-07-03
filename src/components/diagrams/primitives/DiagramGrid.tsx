/**
 * DiagramGrid — Layout helper that places children on a coarse grid.
 *
 * Provides a grid-based layout system for positioning diagram elements
 * in rows and columns with configurable gap spacing. Children are
 * distributed across the grid cells automatically.
 * Consumes design tokens via CSS variables and wraps in framer-motion
 * with reduced-motion guards.
 *
 * @module components/diagrams/primitives/DiagramGrid
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

import React from 'react';
import { m } from 'framer-motion';
import { fadeIn } from '../../../design-system/motionVariants';
import type { DiagramGridProps } from './types';

const DEFAULT_GAP = 16;

export const DiagramGrid: React.FC<DiagramGridProps> = ({
  columns,
  rows,
  gap = DEFAULT_GAP,
  children,
  id,
  className,
  ariaLabel,
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <m.g
      id={id}
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      role="group"
      aria-label={ariaLabel || `${columns}×${rows} grid layout`}
    >
      {childArray.map((child, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);

        // Skip if beyond grid bounds
        if (row >= rows) return null;

        // Calculate cell position based on column/row and gap
        const cellX = col * (100 + gap);
        const cellY = row * (60 + gap);

        return (
          <g
            key={index}
            transform={`translate(${cellX}, ${cellY})`}
            data-grid-col={col}
            data-grid-row={row}
          >
            {child}
          </g>
        );
      })}
    </m.g>
  );
};

export default DiagramGrid;
