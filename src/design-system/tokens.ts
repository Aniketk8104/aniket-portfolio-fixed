/**
 * Design System Tokens (TypeScript Mirror)
 * 
 * This file mirrors the CSS custom properties defined in src/assets/styles/tokens.css
 * as typed TypeScript constants. The parity between this file and tokens.css is
 * enforced by scripts/check-tokens.mjs at build time.
 * 
 * Why two files?
 * - tokens.css: Runtime CSS custom properties for styling components
 * - tokens.ts: Compile-time TypeScript constants for computed styles and type safety
 * 
 * The check-tokens.mjs script runs automatically during the prebuild phase to ensure
 * both files stay in sync. If you add a token to one file, you must add it to the other.
 * 
 * Usage:
 *   import { colors, spacing, tokens } from '@/design-system';
 *   const primaryColor = colors.accentPrimary;
 *   const buttonPadding = spacing[4];
 * 
 * @see src/assets/styles/tokens.css
 * @see scripts/check-tokens.mjs
 */

// ============================================
// COLOR TOKENS - Dark Theme
// ============================================

export const colors = {
  // Background & Surface
  background: '#06070d',
  surface: '#0e1018',
  surfaceElevated: '#161a25',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  
  // Text
  textPrimary: '#f6f7fa',
  textSecondary: '#b8bdca',
  textMuted: '#868c9b',
  
  // Accent Colors
  accentPrimary: '#818cf8',
  accentSecondary: '#a78bfa',
  
  // Semantic Colors
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
} as const;

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const fonts = {
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  mono: '"JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
} as const;

export const fontSizes = {
  display: 'clamp(3.5rem, 10vw, 6rem)',
  title: 'clamp(2.75rem, 8vw, 4.5rem)',
  h1: 'clamp(2.25rem, 6vw, 3.5rem)',
  h2: 'clamp(1.75rem, 5vw, 2.5rem)',
  h3: 'clamp(1.375rem, 4vw, 1.875rem)',
  h4: 'clamp(1.125rem, 3vw, 1.25rem)',
  body: 'clamp(1rem, 2.5vw, 1.125rem)',
  caption: 'clamp(0.875rem, 2.2vw, 1rem)',
  mono: 'clamp(0.875rem, 2.2vw, 1rem)',
} as const;

export const lineHeights = {
  display: 1.1,
  title: 1.15,
  h1: 1.2,
  h2: 1.25,
  h3: 1.3,
  h4: 1.4,
  body: 1.6,
  caption: 1.5,
  mono: 1.5,
} as const;

// ============================================
// SPACING SCALE (px-based)
// ============================================

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
  24: '96px',
} as const;

// ============================================
// RADII
// ============================================

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

// ============================================
// ELEVATION (Shadows)
// ============================================

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
  md: '0 12px 28px -14px rgba(0, 0, 0, 0.6)',
  lg: '0 28px 64px -24px rgba(0, 0, 0, 0.8)',
} as const;

export const glassSurface = 'rgba(18, 21, 31, 0.66)' as const;

// ============================================
// MOTION TOKENS
// ============================================

export const durations = {
  instant: '80ms',
  fast: '150ms',
  base: '240ms',
  slow: '400ms',
  page: '600ms',
} as const;

export const easings = {
  // CSS strings — for use in CSS/style props
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

/**
 * Framer-motion bezier arrays — identical curves to `easings` but in the
 * `[x1, y1, x2, y2]` format that framer-motion's `ease` transition prop accepts.
 * Not tracked by check-tokens.mjs (not CSS custom properties).
 */
export const easingsFm = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  emphasized: [0.2, 0, 0, 1.2] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
} as const;

export const distances = {
  sm: '4px',
  md: '8px',
  lg: '12px',
} as const;

// ============================================
// EXPORTS
// ============================================

export const tokens = {
  colors,
  fonts,
  fontSizes,
  lineHeights,
  spacing,
  radii,
  shadows,
  glassSurface,
  durations,
  easings,
  easingsFm,
  distances,
} as const;

export default tokens;
