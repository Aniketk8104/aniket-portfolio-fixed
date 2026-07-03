/**
 * Eyebrow — small uppercase label used above section titles.
 * Consumes typography and color tokens via CSS variables.
 */
import React from 'react';

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Render as a different element */
  as?: 'span' | 'p' | 'div';
}

export const Eyebrow: React.FC<EyebrowProps> = ({
  as: Tag = 'span',
  style,
  children,
  ...rest
}) => (
  <Tag
    style={{
      display: 'block',
      fontSize: 'var(--font-size-caption)',
      lineHeight: 'var(--line-height-caption)',
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--color-accent-primary)',
      ...style,
    }}
    {...rest}
  >
    {children}
  </Tag>
);

export default Eyebrow;
