/**
 * Breakpoints
 * 
 * Responsive breakpoint definitions for the design system.
 * These breakpoints align with common device sizes and are used
 * throughout the application for responsive layouts.
 * 
 * Usage:
 *   import { breakpoints } from '@/design-system/breakpoints';
 *   const isMobile = window.innerWidth < breakpoints.sm;
 * 
 * @see Requirements 10.4 (Diagram responsiveness)
 */

export const breakpoints = {
  xs: 360,  // Small mobile
  sm: 640,  // Mobile
  md: 768,  // Tablet
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
  '2xl': 1536, // Extra large desktop
  max: 1920, // Maximum supported width
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Media query helpers for use in CSS-in-JS or styled components
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
} as const;

export default breakpoints;
