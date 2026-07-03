/**
 * CodeBlock — displays code with language label and copy button.
 * Uses `--font-mono` for the code content.
 * Consumes color, typography, and radius tokens via CSS variables.
 */
import React, { useCallback, useState } from 'react';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Programming language label */
  language?: string;
  /** Code content */
  children: string;
  /** Whether to show the copy button */
  showCopy?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  children,
  showCopy = true,
  style,
  ...rest
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [children]);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {(language || showCopy) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-2) var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface-elevated)',
          }}
        >
          {language && (
            <span
              style={{
                fontSize: 'var(--font-size-caption)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                textTransform: 'lowercase',
              }}
            >
              {language}
            </span>
          )}
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy code'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-caption)',
                fontFamily: 'var(--font-mono)',
                color: copied ? 'var(--color-success)' : 'var(--color-text-muted)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--duration-fast) var(--ease-standard)',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: 'var(--space-4)',
          overflow: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-mono)',
          lineHeight: 'var(--line-height-mono)',
          color: 'var(--color-text-primary)',
          tabSize: 2,
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
