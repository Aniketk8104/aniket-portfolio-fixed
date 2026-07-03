/**
 * Placeholder component for marking unset content fields.
 * 
 * This component renders a clearly visible sentinel node for content fields
 * that require user authorship. It never fabricates content or generates
 * placeholder prose - it simply marks the field as "TODO".
 * 
 * @module sections/shared/Placeholder
 */

import React from 'react';
import './Placeholder.css';

export interface PlaceholderProps {
  /** The name of the field that requires authoring */
  field: string;
}

/**
 * Renders a visible placeholder marker for unset content fields.
 * 
 * The component uses semantic HTML with ARIA attributes to ensure
 * the placeholder is accessible to assistive technologies while
 * remaining clearly visible to authors.
 * 
 * @example
 * ```tsx
 * if (isPlaceholder(article.body)) {
 *   return <Placeholder field={article.body.__field} />;
 * } else {
 *   return <RichTextRenderer value={article.body} />;
 * }
 * ```
 */
export const Placeholder: React.FC<PlaceholderProps> = ({ field }) => {
  return (
    <span
      role="note"
      aria-label={`Author content required for ${field}`}
      className="placeholder"
    >
      TODO: {field}
    </span>
  );
};
