import React from 'react';

/**
 * AnimatedBackgroundLite
 *
 * Lightweight, GPU-cheap ambient backdrop used by default and on
 * reduced-motion / low-power devices. Renders the premium aurora mesh and a
 * fading engineering grid (both pure CSS, fixed behind all content).
 */
const AnimatedBackgroundLite = () => {
  return (
    <>
      <div className="premium-aurora" aria-hidden="true" />
      <div className="premium-grid" aria-hidden="true" />
    </>
  );
};

export default AnimatedBackgroundLite;
