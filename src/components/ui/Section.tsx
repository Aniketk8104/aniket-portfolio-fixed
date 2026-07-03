/**
 * Section — semantic `<section>` wrapper with optional eyebrow, title, and lead.
 * Uses `aria-labelledby` linked to the rendered title id for accessibility.
 * Consumes typography and spacing tokens via CSS variables.
 */
import React, { useId } from 'react';

import type { SpaceToken } from './Stack';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Small uppercase label above the title */
  eyebrow?: string;
  /** Section title (rendered as h2) */
  title?: string;
  /** Lead paragraph below the title */
  lead?: string;
  /** Vertical padding using spacing scale */
  padding?: SpaceToken;
}

export const Section: React.FC<SectionProps> = ({
  eyebrow,
  title,
  lead,
  padding = '16',
  style,
  children,
  ...rest
}) => {
  const generatedId = useId();
  const titleId = title ? `section-title-${generatedId}` : undefined;

  return (
    <section
      aria-labelledby={titleId}
      style={{
        paddingBlock: `var(--space-${padding})`,
        scrollMarginTop: '88px',
        ...style,
      }}
      {...rest}
    >
      {(eyebrow || title || lead) && (
        <header
          className="reveal"
          style={{
            marginBottom: 'var(--space-12)',
            maxWidth: '760px',
          }}
        >
          {eyebrow && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                fontSize: 'var(--font-size-caption)',
                lineHeight: 'var(--line-height-caption)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-primary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '28px',
                  height: '2px',
                  borderRadius: '2px',
                  background:
                    'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary))',
                }}
              />
              {eyebrow}
            </span>
          )}
          {title && (
            <h2
              id={titleId}
              style={{
                fontSize: 'var(--font-size-h2)',
                lineHeight: 'var(--line-height-h2)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {title}
            </h2>
          )}
          {lead && (
            <p
              style={{
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height-body)',
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-text-secondary)',
                margin: 0,
                marginBlockStart: 'var(--space-4)',
                maxWidth: '60ch',
              }}
            >
              {lead}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
};

export default Section;
