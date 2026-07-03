/**
 * Tag — interactive or static label for categorization.
 * Polymorphic: renders as `<span>` by default, or `<button>` when interactive.
 * Consumes color and typography tokens via CSS variables.
 */
import React from 'react';

export interface TagBaseProps {
  /** Render as button for interactive use */
  as?: 'span' | 'button';
  /** Whether the tag is currently active/selected */
  active?: boolean;
}

export type TagProps = TagBaseProps &
  (
    | (React.HTMLAttributes<HTMLSpanElement> & { as?: 'span' })
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { as: 'button' })
  );

export const Tag: React.FC<TagProps> = ({
  as: Tag = 'span',
  active = false,
  style,
  children,
  ...rest
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 'var(--font-size-caption)',
    lineHeight: 'var(--line-height-caption)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 400,
    paddingInline: 'var(--space-3)',
    paddingBlock: 'var(--space-1)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    borderColor: active ? 'var(--color-accent-primary)' : 'var(--color-border)',
    background: active ? 'rgba(129, 140, 248, 0.14)' : 'var(--color-surface)',
    color: active ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
    cursor: Tag === 'button' ? 'pointer' : 'default',
    transition: 'border-color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)',
    ...style,
  };

  return (
    <Tag style={baseStyles} {...(rest as React.HTMLAttributes<HTMLElement>)}>
      {children}
    </Tag>
  );
};

export default Tag;
