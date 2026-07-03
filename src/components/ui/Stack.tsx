/**
 * Stack — vertical or horizontal flex layout with consistent gap.
 * Consumes spacing tokens via CSS variables.
 */
import React from 'react';

export type SpaceToken = '1' | '2' | '3' | '4' | '5' | '6' | '8' | '12' | '16' | '24';

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  /** Direction of the stack */
  direction?: 'vertical' | 'horizontal';
  /** Gap between items using spacing scale */
  space?: SpaceToken;
  /** Alignment along the cross axis */
  align?: React.CSSProperties['alignItems'];
  /** Alignment along the main axis */
  justify?: React.CSSProperties['justifyContent'];
  /** Whether items should wrap */
  wrap?: boolean;
  /** HTML element to render as */
  as?: React.ElementType;
}

export const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  space = '4',
  align,
  justify,
  wrap = false,
  style,
  children,
  as: Tag = 'div',
  ...rest
}) => (
  <Tag
    style={{
      display: 'flex',
      flexDirection: direction === 'vertical' ? 'column' : 'row',
      gap: `var(--space-${space})`,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : undefined,
      ...style,
    }}
    {...rest}
  >
    {children}
  </Tag>
);

export default Stack;
