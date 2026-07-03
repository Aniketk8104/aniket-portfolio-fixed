import React, { useRef, useEffect } from 'react';

/**
 * Magnetic
 *
 * A reserved, "luxury" magnetic interaction for primary CTAs. Rather than
 * snapping a transform on every mousemove (which reads as twitchy), the element
 * *eases* toward the pointer via a requestAnimationFrame lerp and gently springs
 * back on release. A subtle hover-lift and press-in scale are folded into the
 * same transform so there is exactly one source of truth for motion (no fighting
 * with CSS transitions or framer-motion).
 *
 * Restraint is the point: use this on hero / nav CTAs only. Spraying magnetism
 * across every link and tag makes a page feel cheap, not premium.
 *
 * Fully inert on coarse/touch pointers and under prefers-reduced-motion — it
 * simply renders the element with no listeners attached.
 *
 * @param {object}  props
 * @param {string|React.ElementType} [props.as='button']  Element/tag to render.
 * @param {number}  [props.strength=0.3]   Fraction of the pointer offset the box follows.
 * @param {number}  [props.hoverScale=1.035] Scale while hovered.
 * @param {number}  [props.pressScale=0.96] Scale while pressed.
 * @param {string}  [props.className='']
 * @param {React.ReactNode} props.children
 */
const TRANSITION_ACTIVE =
  'transform 0s linear, box-shadow 0.3s ease, background 0.3s ease, ' +
  'border-color 0.3s ease, filter 0.25s ease, color 0.25s ease';

const Magnetic = ({
  as: Tag = 'button',
  strength = 0.3,
  hoverScale = 1.035,
  pressScale = 0.96,
  className = '',
  children,
  ...rest
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let ts = 1; // target scale
    let cx = 0;
    let cy = 0;
    let cs = 1; // current scale
    let hovering = false;
    let pressed = false;

    const lerp = (a, b, t) => a + (b - a) * t;
    const syncScale = () => {
      ts = pressed ? pressScale : hovering ? hoverScale : 1;
    };

    const tick = () => {
      cx = lerp(cx, tx, 0.18);
      cy = lerp(cy, ty, 0.18);
      cs = lerp(cs, ts, 0.2);
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) scale(${cs.toFixed(3)})`;

      const settled =
        Math.abs(cx - tx) < 0.04 &&
        Math.abs(cy - ty) < 0.04 &&
        Math.abs(cs - ts) < 0.002;

      if (!hovering && settled) {
        // Fully at rest — hand styling back to CSS so resting hover/box-shadow
        // transitions behave normally.
        el.style.transform = '';
        el.style.transition = '';
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      start();
    };
    const onEnter = () => {
      hovering = true;
      // Drive transform ourselves; keep other transitions intact.
      el.style.transition = TRANSITION_ACTIVE;
      syncScale();
      start();
    };
    const onLeave = () => {
      hovering = false;
      pressed = false;
      tx = 0;
      ty = 0;
      syncScale();
      start();
    };
    const onDown = () => {
      pressed = true;
      syncScale();
      start();
    };
    const onUp = () => {
      pressed = false;
      syncScale();
      start();
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseup', onUp);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('mouseup', onUp);
      el.style.transform = '';
      el.style.transition = '';
    };
  }, [strength, hoverScale, pressScale]);

  return (
    <Tag ref={ref} className={`magnetic ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
};

export default Magnetic;
