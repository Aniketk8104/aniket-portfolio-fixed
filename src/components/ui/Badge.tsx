/**
 * Badge — small status indicator with semantic color variants.
 * Consumes color and typography tokens via CSS variables.
 */
import React from 'react';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color variant */
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  neutral: {
    background: 'var(--color-surface-elevated)',
    color: 'var(--color-text-secondary)',
    borderColor: 'var(--color-border)',
  },
  primary: {
    background: 'rgba(129, 140, 248, 0.14)',
    color: 'var(--color-accent-primary)',
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  success: {
    background: 'rgba(52, 211, 153, 0.12)',
    color: 'var(--color-success)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  warning: {
    background: 'rgba(251, 191, 36, 0.12)',
    color: 'var(--color-warning)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  danger: {
    background: 'rgba(248, 113, 113, 0.12)',
    color: 'var(--color-danger)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  style,
  children,
  ...rest
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 'var(--font-size-caption)',
      lineHeight: 'var(--line-height-caption)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      paddingInline: 'var(--space-2)',
      paddingBlock: 'var(--space-1)',
      borderRadius: 'var(--radius-full)',
      border: '1px solid',
      ...variantStyles[variant],
      ...style,
    }}
    {...rest}
  >
    {children}
  </span>
);

export default Badge;
