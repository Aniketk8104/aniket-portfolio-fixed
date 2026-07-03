/**
 * Button — polymorphic button/anchor with variant and size props.
 * Renders `<button>` or `<a>` via the `as` prop.
 * Focus ring uses `--color-accent-primary` for WCAG 2.1 AA non-text contrast.
 * Consumes color, typography, spacing, and radius tokens via CSS variables.
 *
 * @see Requirements 9.2, 9.5, 16.1
 */
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size */
  size?: ButtonSize;
  /** Render as button or anchor */
  as?: 'button' | 'a';
  /** Href (only when as="a") */
  href?: string;
  /** Icon before label */
  iconLeft?: React.ReactNode;
  /** Icon after label */
  iconRight?: React.ReactNode;
}

export type ButtonProps = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps>;

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    fontSize: 'var(--font-size-caption)',
    paddingInline: 'var(--space-3)',
    paddingBlock: 'var(--space-1)',
    borderRadius: 'var(--radius-sm)',
    gap: 'var(--space-1)',
  },
  md: {
    fontSize: 'var(--font-size-body)',
    paddingInline: 'var(--space-5)',
    paddingBlock: 'var(--space-2)',
    borderRadius: 'var(--radius-md)',
    gap: 'var(--space-2)',
  },
  lg: {
    fontSize: 'var(--font-size-body)',
    paddingInline: 'var(--space-8)',
    paddingBlock: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    gap: 'var(--space-2)',
  },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent-primary)',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-primary)',
    border: '1px solid transparent',
  },
  link: {
    background: 'transparent',
    color: 'var(--color-accent-primary)',
    border: 'none',
    padding: '0',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
};

/**
 * CSS for focus-visible ring + hover micro-animations. Injected once.
 */
const focusRingStyle = `
  .ui-button {
    transition:
      transform var(--duration-fast) var(--ease-standard),
      background var(--duration-fast) var(--ease-standard),
      border-color var(--duration-fast) var(--ease-standard),
      color var(--duration-fast) var(--ease-standard),
      box-shadow var(--duration-fast) var(--ease-standard),
      filter var(--duration-fast) var(--ease-standard);
  }
  .ui-button:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }
  .ui-button--primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    box-shadow: 0 8px 24px -10px rgba(99,102,241,0.6);
  }
  .ui-button--primary:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow: 0 14px 32px -10px rgba(99,102,241,0.75);
  }
  .ui-button--secondary:hover {
    transform: translateY(-2px);
    border-color: rgba(129,140,248,0.5) !important;
    background: rgba(255,255,255,0.04) !important;
  }
  .ui-button--ghost:hover {
    background: rgba(255,255,255,0.05) !important;
  }
  .ui-button--link:hover {
    opacity: 0.85;
  }
  .ui-button:active {
    transform: translateY(0);
  }
  @media (prefers-reduced-motion: reduce) {
    .ui-button, .ui-button:hover, .ui-button:active { transform: none; }
  }
`;

// Inject focus ring styles once
let styleInjected = false;
function injectFocusStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = focusRingStyle;
  document.head.appendChild(style);
  styleInjected = true;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  as = 'button',
  href,
  iconLeft,
  iconRight,
  style,
  className,
  children,
  ...rest
}) => {
  injectFocusStyles();

  const Tag = as;
  const combinedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    lineHeight: 1,
    cursor: 'pointer',
    textDecoration: variant === 'link' ? 'underline' : 'none',
    transition: `background var(--duration-fast) var(--ease-standard), 
                 border-color var(--duration-fast) var(--ease-standard), 
                 color var(--duration-fast) var(--ease-standard),
                 opacity var(--duration-fast) var(--ease-standard)`,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  const classNames = ['ui-button', `ui-button--${variant}`, className].filter(Boolean).join(' ');

  const content = (
    <>
      {iconLeft && <span style={{ display: 'inline-flex' }}>{iconLeft}</span>}
      {children}
      {iconRight && <span style={{ display: 'inline-flex' }}>{iconRight}</span>}
    </>
  );

  if (Tag === 'a') {
    return (
      <a
        href={href}
        className={classNames}
        style={combinedStyle}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classNames}
      style={combinedStyle}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
};

export default Button;
