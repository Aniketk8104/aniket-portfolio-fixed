/**
 * Grid — CSS Grid layout primitive with responsive columns.
 * Consumes spacing tokens via CSS variables.
 */
import React from 'react';

import type { SpaceToken } from './Stack';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns (or responsive min column width for auto-fit) */
  columns?: number | string;
  /** Gap between items using spacing scale */
  gap?: SpaceToken;
  /** Row gap override */
  rowGap?: SpaceToken;
  /** Column gap override */
  columnGap?: SpaceToken;
  /** Alignment of items */
  align?: React.CSSProperties['alignItems'];
}

export const Grid: React.FC<GridProps> = ({
  columns = 3,
  gap = '6',
  rowGap,
  columnGap,
  align,
  style,
  children,
  ...rest
}) => {
  const gridTemplateColumns =
    typeof columns === 'number'
      ? `repeat(${columns}, 1fr)`
      : `repeat(auto-fit, minmax(${columns}, 1fr))`;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: `var(--space-${gap})`,
        rowGap: rowGap ? `var(--space-${rowGap})` : undefined,
        columnGap: columnGap ? `var(--space-${columnGap})` : undefined,
        alignItems: align,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Grid;
