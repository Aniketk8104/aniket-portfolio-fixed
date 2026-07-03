/**
 * SiteShell
 *
 * Global layout route — rendered exactly once for every client-side route.
 * Mounts all persistent chrome:
 *   - Navbar
 *   - AnimatedBackground (full / lite variant determined once at boot)
 *   - CustomCursor
 *   - ScrollProgress
 *   - FloatingCTA
 *   - Footer
 *   - Suspense + Outlet (route content)
 *   - RouteFocusManager
 *
 * Wrapped in framer-motion LazyMotion + domAnimation to keep the bundle small.
 *
 * Validates: Requirements 1.5, 19.1, 19.2, 19.3, 19.4, 19.5
 */

import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useMemo,
} from 'react';
import { Outlet } from 'react-router-dom';
import { LazyMotion, domAnimation, m } from 'framer-motion';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingCTA from '../components/FloatingCTA';
import BootSequence from './BootSequence';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — legacy JSX module, no TS types available
import ContactModal from '../components/ContactModal';
import { RouteFocusManager } from './RouteFocusManager';
import { ComponentLoader } from './ComponentLoader';
import { lazyWithPreload } from '../utils/lazyWithPreload';
import { useSmoothScroll } from '../utils/smoothScroll';

// ---------------------------------------------------------------------------
// Lazy-loaded background variants
// ---------------------------------------------------------------------------
const AnimatedBackground = lazyWithPreload(
  () => import('../components/AnimatedBackground')
);
const AnimatedBackgroundLite = lazyWithPreload(
  () => import('../components/AnimatedBackgroundLite')
);

// ---------------------------------------------------------------------------
// CustomCursor
//
// Lifted from App.jsx into SiteShell so it mounts exactly once globally,
// persisting across route changes without remounting.
//
// Audit (task 8.5):
//   - State: `enabled` (bool) — set once on mount from pointer/touch detection.
//     No dependency on current route. Effects use deps [] or [enabled] only.
//   - No useLocation() or any router hook. Entirely device/DOM-driven.
//   - Verdict: stateless with respect to routing; animation-only interactions
//     are handled via direct DOM manipulation (classList, style transforms).
//
// Preserved behaviour: disabled on touch-only / coarse-pointer devices.
// Validates: Requirements 19.2, 1.5
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// "Lumen" — a bespoke, magnetic luxury cursor.
//
//   - A focal dot (the lumen) tracking the pointer 1:1 with zero latency.
//   - A magnetic halo that doesn't just trail the pointer — over interactive
//     elements it *conforms* to their shape, easing to the element's centre
//     and morphing into a rounded outline sized to the element's bounding box
//     (reading the element's own border-radius). The result feels like the UI
//     is being gently "grasped" rather than merely hovered.
//   - A continuously rotating conic sheen on the halo rim (a masked gradient
//     border) gives a quiet, jewel-like metallic shimmer.
//   - Contextual morphing: a slim I-beam over text fields, an expanded glass
//     lens with a "View" label over media (`data-cursor="view"`), and a
//     velocity-aware comet stretch during free motion.
//   - A refined click ripple radiates from the press point for tactile
//     feedback.
//
// Implemented with a single requestAnimationFrame loop driving DOM transforms
// directly (no per-frame React re-renders). Disabled on touch/coarse pointers
// and degrades gracefully under prefers-reduced-motion.
// ---------------------------------------------------------------------------
const CustomCursor: React.FC = React.memo(() => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasFinePointer =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: fine)').matches
        : true;
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (hasFinePointer && !isTouchDevice) {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.add('custom-cursor-active');
    return () => {
      root.classList.remove('custom-cursor-active');
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const container = containerRef.current;
    const dot = dotRef.current;
    const halo = ringRef.current;
    if (!container || !dot || !halo) return;

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const VARIANT_CLASSES = ['is-pointer', 'is-text', 'is-view'];
    const DEFAULT_SIZE = 36;
    // Beyond these bounds we stop conforming to the element (would feel heavy)
    // and fall back to the compact default halo.
    const MAGNET_MAX_W = 520;
    const MAGNET_MAX_H = 320;

    let variant = 'default';
    let magnetEl: Element | null = null;
    let magnetRadius = 0;

    const applyVariant = (next: string, el: Element | null) => {
      magnetEl = el;
      if (el) {
        const parsed = parseFloat(getComputedStyle(el).borderTopLeftRadius);
        magnetRadius = Number.isFinite(parsed) ? parsed : 0;
      }
      if (next === variant) return;
      variant = next;
      dot.classList.remove(...VARIANT_CLASSES);
      halo.classList.remove(...VARIANT_CLASSES);
      if (next !== 'default') {
        dot.classList.add(`is-${next}`);
        halo.classList.add(`is-${next}`);
      }
    };

    // Pointer position (px,py) and eased halo geometry.
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let hx = px;
    let hy = py;
    let hw = DEFAULT_SIZE;
    let hh = DEFAULT_SIZE;
    let hr = DEFAULT_SIZE / 2;
    let pressScale = 1;
    let pressTarget = 1;
    let lastAngle = 0;
    let visible = false;
    let raf = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // Resolve the desired geometry for the current variant.
      let dW = DEFAULT_SIZE;
      let dH = DEFAULT_SIZE;
      let dR = DEFAULT_SIZE / 2;
      let cx = px;
      let cy = py;
      let stretchOn = !prefersReduced;
      let centerEase = prefersReduced ? 1 : 0.22;

      if (variant === 'text') {
        dW = 2;
        dH = 26;
        dR = 2;
        stretchOn = false;
        centerEase = 1;
      } else if (magnetEl && (variant === 'pointer' || variant === 'view')) {
        const r = magnetEl.getBoundingClientRect();
        const ecx = r.left + r.width / 2;
        const ecy = r.top + r.height / 2;

        if (variant === 'view') {
          dW = 92;
          dH = 92;
          dR = 46;
          stretchOn = false;
          // Gravitate toward the media centre while keeping a little parallax.
          cx = ecx + (px - ecx) * 0.16;
          cy = ecy + (py - ecy) * 0.16;
        } else if (r.width <= MAGNET_MAX_W && r.height <= MAGNET_MAX_H) {
          const pad = 9;
          dW = r.width + pad * 2;
          dH = r.height + pad * 2;
          dR = Math.min(magnetRadius + pad, Math.min(dW, dH) / 2);
          stretchOn = false;
          cx = ecx + (px - ecx) * 0.18;
          cy = ecy + (py - ecy) * 0.18;
        }
      }

      const sizeEase = prefersReduced ? 1 : 0.2;
      hw = lerp(hw, dW, sizeEase);
      hh = lerp(hh, dH, sizeEase);
      hr = lerp(hr, dR, sizeEase);
      hx = lerp(hx, cx, centerEase);
      hy = lerp(hy, cy, centerEase);

      // Velocity-aware comet stretch (free motion only).
      let sx = 1;
      let sy = 1;
      if (stretchOn) {
        const dx = px - hx;
        const dy = py - hy;
        const dist = Math.hypot(dx, dy);
        const stretch = Math.min(dist, 80) / 320; // 0 → 0.25
        if (dist > 0.6) lastAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        sx = 1 + stretch;
        sy = 1 - stretch * 0.6;
      } else {
        // Conforming to an element (button/link/media) or an I-beam: there is
        // no comet, so the halo must align to the element's box. Ease the
        // rotation back to 0 — otherwise it inherits a stale angle from the
        // last free movement and a wide pill ends up rendered vertically.
        // Reduce modulo 180 first (a symmetric box looks identical at θ and
        // θ±180) so the path home is never more than 90°.
        if (lastAngle > 90) lastAngle -= 180;
        else if (lastAngle < -90) lastAngle += 180;
        lastAngle += (0 - lastAngle) * 0.3;
        if (Math.abs(lastAngle) < 0.1) lastAngle = 0;
      }

      pressScale += (pressTarget - pressScale) * 0.3;

      halo.style.width = `${hw}px`;
      halo.style.height = `${hh}px`;
      halo.style.borderRadius = `${hr}px`;
      halo.style.transform =
        `translate(${hx}px, ${hy}px) translate(-50%, -50%) rotate(${lastAngle}deg) scale(${sx * pressScale}, ${sy * pressScale})`;

      dot.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%)`;

      // Run continuously while visible — the magnet must keep tracking the
      // element through scroll, and the lerps converge smoothly.
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const show = () => {
      if (visible) return;
      visible = true;
      container.classList.remove('is-hidden');
      start();
    };
    const hide = () => {
      visible = false;
      container.classList.add('is-hidden');
    };

    const handleMouseMove = (event: MouseEvent) => {
      px = event.clientX;
      py = event.clientY;
      if (!visible) show();
    };

    const resolveVariant = (
      target: Element | null
    ): { mode: string; el: Element | null } => {
      if (!target) return { mode: 'default', el: null };

      const override = target.closest('[data-cursor]');
      if (override) {
        return { mode: override.getAttribute('data-cursor') ?? 'pointer', el: override };
      }

      const textTarget = target.closest(
        '[contenteditable="true"], [contenteditable=""], textarea, input[type="text"], input[type="search"], input[type="email"], input[type="password"], .text-input'
      );
      if (textTarget) return { mode: 'text', el: null };

      const pointerTarget = target.closest(
        'a, button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], select, label'
      );
      if (pointerTarget) return { mode: 'pointer', el: pointerTarget };

      return { mode: 'default', el: null };
    };

    const handleIntent = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      const { mode, el } = resolveVariant(target);
      applyVariant(mode, el);
    };

    const spawnRipple = () => {
      if (prefersReduced) return;
      const ripple = document.createElement('span');
      ripple.className = 'lumen-cursor__ripple';
      ripple.style.left = `${px}px`;
      ripple.style.top = `${py}px`;
      container.appendChild(ripple);
      const cleanup = () => ripple.remove();
      ripple.addEventListener('animationend', cleanup, { once: true });
      window.setTimeout(cleanup, 700);
    };

    const handleDown = () => {
      pressTarget = 0.78;
      spawnRipple();
    };
    const handleUp = () => {
      pressTarget = 1;
    };
    const handleLeave = () => hide();
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') hide();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('mouseover', handleIntent, true);
    document.addEventListener('focusin', handleIntent, true);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mouseover', handleIntent, true);
      document.removeEventListener('focusin', handleIntent, true);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="ultra-cursor-container lumen-cursor is-hidden"
      aria-hidden="true"
    >
      <div ref={ringRef} className="lumen-cursor__halo">
        <span className="lumen-cursor__label">View</span>
      </div>
      <div ref={dotRef} className="lumen-cursor__dot" />
    </div>
  );
});

CustomCursor.displayName = 'CustomCursor';

// ---------------------------------------------------------------------------
// ScrollProgress
//
// Lifted from App.jsx into SiteShell so it mounts exactly once globally,
// persisting across route changes without remounting.
//
// Audit (task 8.5):
//   - State: `scrollProgress` (number) — driven purely by window scroll events.
//     No dependency on current route. Effect dep array is [].
//   - No useLocation() or any router hook. Entirely scroll-driven.
//   - Verdict: stateless with respect to routing; animation-only (scaleX
//     transform on the progress bar element).
//
// Validates: Requirements 19.3, 1.5
// ---------------------------------------------------------------------------
const ScrollProgress: React.FC = React.memo(() => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setScrollProgress(Math.min(100, Math.max(0, progress)));
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollProgress);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <m.div
      className="scroll-progress"
      style={{
        transform: `scaleX(${scrollProgress / 100})`,
        transformOrigin: 'left',
        willChange: 'transform',
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: scrollProgress / 100 }}
      transition={{ duration: 0.1 }}
    />
  );
});

ScrollProgress.displayName = 'ScrollProgress';

// ---------------------------------------------------------------------------
// useScrollReveal
//
// Toggles `.is-revealed` on any element carrying the `.reveal` class once it
// scrolls into the lower part of the viewport. Mounted once in the shell so
// every route benefits without per-component wiring.
//
// Implemented with a scroll/rAF position check rather than IntersectionObserver
// so it can NEVER miss an element — even during fast/inertial scrolling an
// element whose top has crossed the reveal line is revealed on the next frame.
// This guarantees section headings are never left invisible.
// ---------------------------------------------------------------------------
function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let raf = 0;

    const revealVisible = () => {
      raf = 0;
      const line = window.innerHeight * 0.9;
      const nodes = document.querySelectorAll('.reveal:not(.is-revealed)');
      nodes.forEach((el) => {
        if (el.getBoundingClientRect().top < line) {
          el.classList.add('is-revealed');
        }
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(revealVisible);
    };

    // Initial pass (above-the-fold content) + listeners.
    revealVisible();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    // Re-check briefly for lazily-mounted route content.
    const interval = window.setInterval(revealVisible, 500);
    const stop = window.setTimeout(() => window.clearInterval(interval), 6000);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, []);
}

// ---------------------------------------------------------------------------
// AnimatedBackground variant-switching heuristic
//
// Lifted from App.jsx so it runs once globally and persists across route
// changes (no remount on navigation).
// Validates: Requirement 19.1
// ---------------------------------------------------------------------------
function useBackgroundVariant(loading: boolean) {
  const [backgroundVariant, setBackgroundVariant] = useState<'lite' | 'full'>(
    'lite'
  );
  const [shouldRenderBackground, setShouldRenderBackground] = useState(false);

  const backgroundVariantRef = useRef<'lite' | 'full'>('lite');
  const targetBackgroundRef = useRef<'lite' | 'full'>('lite');
  const backgroundUpgradeIdleRef = useRef<number | null>(null);
  const backgroundUpgradeTimeoutRef = useRef<number | null>(null);
  const backgroundUpgradeWaitRef = useRef<number | null>(null);
  const backgroundIdleRef = useRef<number | null>(null);
  const upgradeInteractionCleanupRef = useRef<(() => void) | null>(null);
  const hasUserInteractionRef = useRef(false);

  // Defer background render until idle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scheduleBackground = () => setShouldRenderBackground(true);

    if ('requestIdleCallback' in window) {
      backgroundIdleRef.current = window.requestIdleCallback(
        scheduleBackground,
        { timeout: 1500 }
      );
    } else {
      backgroundIdleRef.current = (window as Window).setTimeout(scheduleBackground, 300) as unknown as number;
    }

    return () => {
      if (!backgroundIdleRef.current) return;
      if (
        'cancelIdleCallback' in window &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(backgroundIdleRef.current);
      } else {
        window.clearTimeout(backgroundIdleRef.current);
      }
    };
  }, []);

  // Full vs lite decision
  useEffect(() => {
    if (typeof window === 'undefined') {
      backgroundVariantRef.current = 'lite';
      targetBackgroundRef.current = 'lite';
      setBackgroundVariant('lite');
      return;
    }

    if (typeof window.matchMedia !== 'function') {
      backgroundVariantRef.current = 'lite';
      targetBackgroundRef.current = 'lite';
      setBackgroundVariant('lite');
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    type NetworkConnection = { saveData?: boolean; effectiveType?: string; addEventListener?: (e: string, fn: () => void) => void; removeEventListener?: (e: string, fn: () => void) => void };
    const connection: NetworkConnection | undefined =
      (navigator as unknown as { connection?: NetworkConnection; mozConnection?: NetworkConnection; webkitConnection?: NetworkConnection }).connection ||
      (navigator as unknown as { mozConnection?: NetworkConnection }).mozConnection ||
      (navigator as unknown as { webkitConnection?: NetworkConnection }).webkitConnection;

    const cancelBackgroundUpgrade = () => {
      if (
        backgroundUpgradeIdleRef.current &&
        'cancelIdleCallback' in window &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(backgroundUpgradeIdleRef.current);
      }
      if (backgroundUpgradeTimeoutRef.current) {
        window.clearTimeout(backgroundUpgradeTimeoutRef.current);
        backgroundUpgradeTimeoutRef.current = null;
      }
      if (backgroundUpgradeWaitRef.current) {
        window.clearTimeout(backgroundUpgradeWaitRef.current);
        backgroundUpgradeWaitRef.current = null;
      }
      if (upgradeInteractionCleanupRef.current) {
        upgradeInteractionCleanupRef.current();
        upgradeInteractionCleanupRef.current = null;
      }
      backgroundUpgradeIdleRef.current = null;
    };

    const commitBackgroundUpgrade = () => {
      if (targetBackgroundRef.current !== 'full') {
        cancelBackgroundUpgrade();
        return;
      }
      backgroundUpgradeIdleRef.current = null;
      backgroundUpgradeTimeoutRef.current = null;
      if (backgroundUpgradeWaitRef.current) {
        window.clearTimeout(backgroundUpgradeWaitRef.current);
        backgroundUpgradeWaitRef.current = null;
      }
      if (upgradeInteractionCleanupRef.current) {
        upgradeInteractionCleanupRef.current();
        upgradeInteractionCleanupRef.current = null;
      }
      hasUserInteractionRef.current = true;
      AnimatedBackground.preload?.();
      backgroundVariantRef.current = 'full';
      setBackgroundVariant('full');
    };

    const scheduleBackgroundUpgrade = () => {
      if (targetBackgroundRef.current !== 'full') return;

      if (
        backgroundUpgradeIdleRef.current ||
        backgroundUpgradeTimeoutRef.current ||
        backgroundUpgradeWaitRef.current
      ) {
        return;
      }

      if (!hasUserInteractionRef.current) {
        const handleUserInteraction = () => {
          hasUserInteractionRef.current = true;
          if (upgradeInteractionCleanupRef.current) {
            upgradeInteractionCleanupRef.current();
            upgradeInteractionCleanupRef.current = null;
          }
          if (backgroundUpgradeWaitRef.current) {
            window.clearTimeout(backgroundUpgradeWaitRef.current);
            backgroundUpgradeWaitRef.current = null;
          }
          scheduleBackgroundUpgrade();
        };

        const interactionEvents = [
          'pointerdown',
          'pointermove',
          'touchstart',
          'keydown',
          'scroll',
        ] as const;

        interactionEvents.forEach((event) => {
          window.addEventListener(event, handleUserInteraction, {
            passive: true,
            once: true,
          });
        });

        upgradeInteractionCleanupRef.current = () => {
          interactionEvents.forEach((event) => {
            window.removeEventListener(event, handleUserInteraction);
          });
        };

        backgroundUpgradeWaitRef.current = window.setTimeout(() => {
          backgroundUpgradeWaitRef.current = null;
          hasUserInteractionRef.current = true;
          if (upgradeInteractionCleanupRef.current) {
            upgradeInteractionCleanupRef.current();
            upgradeInteractionCleanupRef.current = null;
          }
          scheduleBackgroundUpgrade();
        }, 45000) as unknown as number;

        return;
      }

      if (loading) {
        backgroundUpgradeTimeoutRef.current = window.setTimeout(() => {
          backgroundUpgradeTimeoutRef.current = null;
          scheduleBackgroundUpgrade();
        }, 1200) as unknown as number;
        return;
      }

      if ('requestIdleCallback' in window) {
        backgroundUpgradeIdleRef.current = window.requestIdleCallback(
          () => {
            commitBackgroundUpgrade();
          },
          { timeout: 4000 }
        );
      } else {
        backgroundUpgradeTimeoutRef.current = globalThis.setTimeout(
          commitBackgroundUpgrade,
          1800
        ) as unknown as number;
      }
    };

    const evaluateVariant = () => {
      // Product decision: the heavy WebGL constellation reads as visually
      // "chunky". We keep only the clean premium aurora + grid (the "lite"
      // backdrop) for everyone, on every device. No upgrade to the full
      // variant is ever scheduled.
      const nextVariant: 'lite' | 'full' = 'lite';

      targetBackgroundRef.current = nextVariant;

      if (nextVariant === 'lite') {
        AnimatedBackgroundLite.preload?.();
        cancelBackgroundUpgrade();
        if (backgroundVariantRef.current !== 'lite') {
          backgroundVariantRef.current = 'lite';
          setBackgroundVariant('lite');
        }
        return;
      }

      // Default to lite first, upgrade once idle
      AnimatedBackgroundLite.preload?.();
      if (backgroundVariantRef.current !== 'lite') {
        backgroundVariantRef.current = 'lite';
        setBackgroundVariant('lite');
      }

      scheduleBackgroundUpgrade();
    };

    evaluateVariant();

    const cleanupFns: (() => void)[] = [];

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', evaluateVariant);
      cleanupFns.push(() => motionQuery.removeEventListener('change', evaluateVariant));
    } else if (typeof (motionQuery as MediaQueryList & { addListener?: (fn: () => void) => void }).addListener === 'function') {
      (motionQuery as MediaQueryList & { addListener: (fn: () => void) => void }).addListener(evaluateVariant);
      cleanupFns.push(() =>
        (motionQuery as MediaQueryList & { removeListener: (fn: () => void) => void }).removeListener(evaluateVariant)
      );
    }

    const handleResize = () => evaluateVariant();
    window.addEventListener('resize', handleResize);
    cleanupFns.push(() => window.removeEventListener('resize', handleResize));

    if (connection?.addEventListener) {
      connection.addEventListener('change', evaluateVariant);
      cleanupFns.push(() => connection.removeEventListener?.('change', evaluateVariant));
    }

    return () => {
      cancelBackgroundUpgrade();
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, [loading]);

  return { backgroundVariant, shouldRenderBackground };
}

// ---------------------------------------------------------------------------
// SiteShell
// ---------------------------------------------------------------------------

/**
 * Props allow the shell to be told whether the app is still in the loading
 * phase. When `App.tsx` drives the loading state it passes it down; if not
 * provided the shell defaults to `false` (already loaded).
 */
export interface SiteShellProps {
  /** Whether the app is still loading (used by background variant heuristic) */
  loading?: boolean;
}

export const SiteShell: React.FC<SiteShellProps> = ({ loading = false }) => {
  const { backgroundVariant, shouldRenderBackground } =
    useBackgroundVariant(loading);

  useScrollReveal();

  // Global inertial smooth scroll — the "luxury glide". Self-disables on
  // touch / reduced-motion and pauses while a modal locks page scroll.
  useSmoothScroll();

  const outletFallback = useMemo(
    () => <ComponentLoader height="100vh" />,
    []
  );

  return (
    <LazyMotion features={domAnimation}>
      {/* Cold boot of ENGINEERING OS — self-dismisses once operational */}
      <BootSequence />

      {/* Custom cursor — self-disables on touch/coarse-pointer devices */}
      <CustomCursor />

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Global navigation */}
      <Navbar />

      {/* Animated background — persists across route changes */}
      {shouldRenderBackground && (
        <Suspense fallback={null}>
          {backgroundVariant === 'full' && <AnimatedBackground />}
          {backgroundVariant === 'lite' && <AnimatedBackgroundLite />}
        </Suspense>
      )}

      {/* Elastic content layer — main + footer ride the rubber-band overscroll
          at the page extremes; all fixed chrome stays anchored outside it. */}
      <div className="scroll-content" data-scroll-content>
        {/* Route content — lazy-loaded route components render here */}
        <main id="main-content" tabIndex={-1}>
          <Suspense fallback={outletFallback}>
            <Outlet />
          </Suspense>
        </main>

        {/* Footer */}
        <Suspense fallback={<ComponentLoader height="200px" />}>
          <Footer />
        </Suspense>
      </div>

      {/* Floating CTA */}
      <FloatingCTA />

      {/* Global premium contact popup */}
      <ContactModal />

      {/* Accessibility: move focus to primary heading on route change */}
      <RouteFocusManager />
    </LazyMotion>
  );
};

export default SiteShell;
