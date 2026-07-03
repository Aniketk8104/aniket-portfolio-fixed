import { useId } from 'react';

/**
 * Hook that returns stable, unique IDs for wiring `aria-labelledby`
 * on SVG diagram roots to their `<title>` and `<desc>` elements.
 *
 * Uses React's `useId()` to guarantee stable, SSR-safe identifiers
 * that remain consistent across renders.
 *
 * @example
 * ```tsx
 * const { titleId, descId } = useDiagramAccessibilityIds();
 * return (
 *   <svg aria-labelledby={`${titleId} ${descId}`}>
 *     <title id={titleId}>Diagram Title</title>
 *     <desc id={descId}>Diagram Description</desc>
 *     ...
 *   </svg>
 * );
 * ```
 *
 * @returns An object with `titleId` and `descId` strings.
 *
 * Validates: Requirements 10.2, 16.3
 */
export interface DiagramAccessibilityIds {
  /** Stable ID for the `<title>` element */
  titleId: string;
  /** Stable ID for the `<desc>` element */
  descId: string;
}

export function useDiagramAccessibilityIds(): DiagramAccessibilityIds {
  const id = useId();
  return {
    titleId: `${id}-diagram-title`,
    descId: `${id}-diagram-desc`,
  };
}
