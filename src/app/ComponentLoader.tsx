import React from 'react';

/**
 * ComponentLoader
 *
 * Shimmer skeleton used as the Suspense fallback for lazy-loaded route
 * components and heavy below-the-fold sections.
 */
export interface ComponentLoaderProps {
  height?: string;
}

export const ComponentLoader: React.FC<ComponentLoaderProps> = React.memo(
  ({ height = '400px' }) => (
    <div
      className="component-loader"
      style={{
        minHeight: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="loading-spinner" />
    </div>
  )
);

ComponentLoader.displayName = 'ComponentLoader';
