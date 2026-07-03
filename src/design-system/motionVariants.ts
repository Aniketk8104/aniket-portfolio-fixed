/**
 * Motion Variants with Reduced-Motion Guard
 * 
 * This module exports framer-motion variants for common entrance animations.
 * It reads motion tokens (durations, easings, distances) from tokens.ts and
 * respects the user's prefers-reduced-motion preference.
 * 
 * When reduced motion is preferred (or matchMedia is unavailable), all variants
 * return final-state-only objects with no transitions. Otherwise, real animated
 * variants are returned.
 * 
 * Usage:
 *   import { fadeUp, fadeIn, scaleIn } from '@/design-system/motionVariants';
 *   <motion.div variants={fadeUp} initial="hidden" animate="visible" />
 * 
 * @see src/design-system/tokens.ts
 * @see Requirements 2.6, 18.1, 18.2, 18.3, 18.4, 16.5, 10.5
 */

import { durations, easingsFm, distances } from './tokens';

// ============================================
// REDUCED MOTION DETECTION
// ============================================

/**
 * Detect if the user prefers reduced motion.
 * Defaults to true (reduced motion) when matchMedia is unavailable (SSR, older browsers).
 */
const prefersReducedMotion = (() => {
  // Check if window and matchMedia are available
  if (typeof window === 'undefined' || !window.matchMedia) {
    return true; // Default to reduced motion when matchMedia is unavailable
  }
  
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (error) {
    // If matchMedia throws, default to reduced motion for safety
    console.warn('matchMedia check failed, defaulting to reduced motion:', error);
    return true;
  }
})();

// ============================================
// MOTION VARIANT HELPERS
// ============================================

/**
 * Parse duration string to milliseconds for framer-motion
 */
const parseDuration = (duration: string): number => {
  return parseFloat(duration) / 1000; // Convert ms to seconds for framer-motion
};

/**
 * Parse distance string to number
 */
const parseDistance = (distance: string): number => {
  return parseFloat(distance);
};

// ============================================
// FADE UP VARIANT
// ============================================

/**
 * Fade in with upward motion
 * Animates opacity from 0 to 1 and y from distance to 0
 */
export const fadeUp = prefersReducedMotion
  ? {
      // Reduced motion: final state only, no transition
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    }
  : {
      // Full motion: animate from hidden to visible
      hidden: {
        opacity: 0,
        y: parseDistance(distances.md),
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: parseDuration(durations.base),
          ease: easingsFm.standard,
        },
      },
    };

// ============================================
// FADE IN VARIANT
// ============================================

/**
 * Simple fade in
 * Animates opacity from 0 to 1
 */
export const fadeIn = prefersReducedMotion
  ? {
      // Reduced motion: final state only, no transition
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    }
  : {
      // Full motion: animate from hidden to visible
      hidden: {
        opacity: 0,
      },
      visible: {
        opacity: 1,
        transition: {
          duration: parseDuration(durations.fast),
          ease: easingsFm.standard,
        },
      },
    };

// ============================================
// SCALE IN VARIANT
// ============================================

/**
 * Scale in with fade
 * Animates opacity from 0 to 1 and scale from 0.95 to 1
 */
export const scaleIn = prefersReducedMotion
  ? {
      // Reduced motion: final state only, no transition
      hidden: { opacity: 1, scale: 1 },
      visible: { opacity: 1, scale: 1 },
    }
  : {
      // Full motion: animate from hidden to visible
      hidden: {
        opacity: 0,
        scale: 0.95,
      },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: parseDuration(durations.base),
          ease: easingsFm.emphasized,
        },
      },
    };

// ============================================
// EXPORTS
// ============================================

export const motionVariants = {
  fadeUp,
  fadeIn,
  scaleIn,
} as const;

export default motionVariants;
