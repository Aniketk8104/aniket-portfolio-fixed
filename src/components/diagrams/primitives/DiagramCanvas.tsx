/**
 * DiagramCanvas — Responsive SVG root container for diagram primitives.
 *
 * Renders an accessible `<svg>` with `<title>` and `<desc>` elements wired
 * via `aria-labelledby`. Consumes design tokens through CSS custom properties
 * and wraps content in framer-motion with reduced-motion guards.
 *
 * @module components/diagrams/primitives/DiagramCanvas
 * Validates: Requirements 10.1, 10.2, 10.3, 10.5
 */

import React from 'react';
import { m } from 'framer-motion';
import { useDiagramAccessibilityIds } from './useDiagramAccessibilityIds';
import { fadeIn } from '../../../design-system/motionVariants';
import type { DiagramCanvasProps } from './types';

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  title,
  description,
  viewBox,
  width = '100%',
  aspectRatio,
  children,
  id,
  className,
  ariaLabel,
}) => {
  const { titleId, descId } = useDiagramAccessibilityIds();

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    maxWidth: '100%',
    height: 'auto',
    ...(aspectRatio ? { aspectRatio: `${aspectRatio}` } : {}),
    // Consume design tokens via CSS variables
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-sans)',
  };

  return (
    <m.svg
      viewBox={viewBox}
      width={typeof width === 'number' ? width : undefined}
      style={style}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      aria-label={ariaLabel}
      id={id}
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{description}</desc>
      {children}
    </m.svg>
  );
};

export default DiagramCanvas;
