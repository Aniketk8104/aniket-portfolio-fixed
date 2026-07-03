/**
 * Container — constrains content to a max-width with horizontal padding.
 * Consumes spacing tokens via CSS variables.
 */
import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max-width variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Horizontal padding using spacing scale */
  padding?: '4' | '6' | '8' | '12';
}

const maxWidths: Record<NonNullable<ContainerProps['size']>, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
};

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  padding = '6',
  style,
  children,
  ...rest
}) => (
  <div
    style={{
      maxWidth: maxWidths[size],
      marginInline: 'auto',
      paddingInline: `var(--space-${padding})`,
      width: '100%',
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

export default Container;
