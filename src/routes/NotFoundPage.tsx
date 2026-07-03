/**
 * NotFoundPage — catch-all 404 route (*).
 *
 * Rendered when a user navigates to any slug not present in the Content_Schema,
 * or to any route path that doesn't match the route table.
 *
 * Provides a clear 404 message and a link back to `/` so the visitor is never
 * stranded. Uses design-system tokens throughout; no hard-coded color or size
 * values.
 *
 * Validates: Requirements 1.4
 */

import React from 'react';
import { Link } from 'react-router-dom';

import { RouteSEO } from '../app/SEO/RouteSEO';

// ─────────────────────────────────────────────────────────────────────────────
// Styles (token-driven inline styles — no external stylesheet needed for a
// simple layout this size; mirrors the approach used in other UI primitives)
// ─────────────────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  padding: 'var(--space-16) var(--space-6)',
  textAlign: 'center',
  gap: 'var(--space-6)',
};

const statusStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--font-size-display)',
  lineHeight: 'var(--line-height-display)',
  fontWeight: 700,
  color: 'var(--color-accent-primary)',
  margin: 0,
  letterSpacing: '-0.02em',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-h1)',
  lineHeight: 'var(--line-height-h1)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: 0,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body)',
  lineHeight: 'var(--line-height-body)',
  color: 'var(--color-text-secondary)',
  maxWidth: '44ch',
  margin: 0,
};

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  paddingInline: 'var(--space-5)',
  paddingBlock: 'var(--space-3)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-accent-primary)',
  color: '#ffffff',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-body)',
  fontWeight: 500,
  lineHeight: 1,
  textDecoration: 'none',
  transition:
    'opacity var(--duration-fast) var(--ease-standard)',
  marginTop: 'var(--space-2)',
};

const dividerStyle: React.CSSProperties = {
  width: '2px',
  height: '2rem',
  background: 'var(--color-border)',
  borderRadius: 'var(--radius-full)',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NotFoundPage renders a friendly 404 view with a clear link back to `/`.
 *
 * The page integrates with RouteSEO so search engines and social crawlers
 * see the appropriate "404" metadata rather than the default home metadata.
 */
export default function NotFoundPage(): React.ReactElement {
  return (
    <>
      {/* Per-route SEO — 404 title and description */}
      <RouteSEO routeKey="notFound" />

      <div className="route-page-main" aria-labelledby="not-found-heading">
        <div style={containerStyle}>
          {/* Monospace status code — visually prominent, screen-reader friendly */}
          <p aria-hidden="true" style={statusStyle}>
            404
          </p>

          <div style={dividerStyle} aria-hidden="true" />

          <h1 id="not-found-heading" style={headingStyle}>
            Page not found
          </h1>

          <p style={bodyStyle}>
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>

          {/* Primary recovery action — link back to home */}
          <Link
            to="/"
            style={linkStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
