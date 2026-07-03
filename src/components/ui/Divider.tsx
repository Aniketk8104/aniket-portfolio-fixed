/**
 * Divider — horizontal or vertical separator line.
 * Consumes border and spacing tokens via CSS variables.
 */
import React from 'react';

import type { SpaceToken } from './Stack';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Vertical spacing (margin block) using spacing scale */
  space?: SpaceToken;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  space = '6',
  style,
  ...rest
}) => (
  <hr
    aria-orientation={orientation}
    style={{
      border: 'none',
      ...(orientation === 'horizontal'
        ? {
            width: '100%',
            height: '1px',
            background: 'var(--color-border)',
            marginBlock: `var(--space-${space})`,
          }
        : {
            width: '1px',
            height: '100%',
            background: 'var(--color-border)',
            marginInline: `var(--space-${space})`,
          }),
      ...style,
    }}
    {...rest}
  />
);

export default Divider;
