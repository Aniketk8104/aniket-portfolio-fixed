/**
 * forceMotion.ts  — GLOBAL MOTION POLICY (single source of truth)
 *
 * Product decision: the signature experience (smooth inertial scroll, elastic
 * overscroll, hero choreography, scroll reveals, the custom cursor and every
 * other motion effect) must look identical for ALL visitors — including those
 * whose operating system requests reduced motion.
 *
 * Rather than editing dozens of scattered `prefers-reduced-motion` checks, we
 * neutralise the signal at its source: any `matchMedia('(prefers-reduced-motion
 * …)')` query now reports "no preference". Because framer-motion's
 * `useReducedMotion`, the scroll engine, the cursor and all bespoke gates read
 * this same media query, flipping it here turns motion on everywhere.
 *
 * IMPORTANT: this MUST be imported before anything else in `main.tsx` so the
 * shim is installed before any module reads the query at evaluation time
 * (e.g. design-system/motionVariants.ts).
 *
 * ──────────────────────────────────────────────────────────────────────────
 * TO RESTORE ACCESSIBLE, MOTION-RESPECTING BEHAVIOUR:
 *   simply remove the `import './utils/forceMotion';` line from main.tsx.
 *   (The matching CSS `@media (prefers-reduced-motion: reduce)` guards were
 *   also removed for consistency; re-add them if you revert this.)
 * ──────────────────────────────────────────────────────────────────────────
 */

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const nativeMatchMedia = window.matchMedia.bind(window);

  const makeStaticList = (query: string, matches: boolean): MediaQueryList =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      // Legacy Safari API — kept as no-ops so older callers don't throw.
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;

  window.matchMedia = ((query: string): MediaQueryList => {
    if (typeof query === 'string' && query.includes('prefers-reduced-motion')) {
      // `(prefers-reduced-motion: reduce)`        → matches: false
      // `(prefers-reduced-motion: no-preference)` → matches: true
      return makeStaticList(query, query.includes('no-preference'));
    }
    return nativeMatchMedia(query);
  }) as typeof window.matchMedia;
}

export {};
