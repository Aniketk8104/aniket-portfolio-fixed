/**
 * Card — premium surface container with base, elevated, and glass variants.
 *
 * Visual treatment (gradient face, inset top highlight, depth shadow, and an
 * accent hover lift) lives in an injected stylesheet keyed by class names so
 * the hover micro-animation works. Layout styles passed via `style` by callers
 * are preserved and take precedence.
 *
 * Consumes color, radius, and elevation tokens via CSS variables.
 */
import React from 'react';

export type CardVariant = 'base' | 'elevated' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Optional padding using spacing scale */
  padding?: '4' | '6' | '8' | '12';
  /** Disable the interactive hover lift (e.g. for static panels) */
  interactive?: boolean;
}

const CARD_STYLE_ID = 'ui-card-styles';
const cardCss = `
.ui-card {
  position: relative;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0) 38%),
    var(--color-surface);
  box-shadow:
    0 1px 0 0 rgba(255,255,255,0.05) inset,
    var(--shadow-md);
  transition:
    transform var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
  isolation: isolate;
}
.ui-card--elevated {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0) 42%),
    var(--color-surface-elevated);
}
.ui-card--glass {
  background: var(--glass-surface);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.ui-card--interactive {
  cursor: default;
}
.ui-card--interactive:hover {
  transform: translateY(-4px);
  border-color: rgba(129, 140, 248, 0.42);
  box-shadow:
    0 1px 0 0 rgba(255,255,255,0.06) inset,
    0 24px 50px -22px rgba(0,0,0,0.85),
    0 0 0 1px rgba(129,140,248,0.12),
    0 18px 60px -30px rgba(99,102,241,0.55);
}
@media (prefers-reduced-motion: reduce) {
  .ui-card { transition: none; }
  .ui-card--interactive:hover { transform: none; }
}
`;

let cardStyleInjected = false;
function injectCardStyles() {
  if (cardStyleInjected || typeof document === 'undefined') return;
  if (document.getElementById(CARD_STYLE_ID)) {
    cardStyleInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = CARD_STYLE_ID;
  style.textContent = cardCss;
  document.head.appendChild(style);
  cardStyleInjected = true;
}

export const Card: React.FC<CardProps> = ({
  variant = 'base',
  padding = '6',
  interactive = true,
  className,
  style,
  children,
  ...rest
}) => {
  injectCardStyles();

  const classNames = [
    'ui-card',
    `ui-card--${variant}`,
    interactive ? 'ui-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      style={{
        padding: `var(--space-${padding})`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
