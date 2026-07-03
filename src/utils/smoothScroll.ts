/**
 * smoothScroll.ts
 *
 * Global "luxury" inertial smooth-scroll engine, layered on top of Lenis.
 *
 * Why this exists
 * ---------------
 * Native `scroll-behavior: smooth` only smooths *programmatic* anchor jumps —
 * free wheel/trackpad scrolling still moves the page in hard, mechanical steps.
 * The single biggest lever for a site to *feel* premium is momentum scrolling:
 * the viewport eases toward the target position instead of snapping to it. That
 * continuous, weighted motion is what reads as "expensive".
 *
 * Design decisions (senior-UX rationale)
 * --------------------------------------
 *  - We do NOT vary the *input* speed per section. Making the wheel behave
 *    differently in different places destroys the user's sense of control and
 *    reads as broken, not luxurious. Input stays 1:1 and inertial everywhere.
 *  - Perceived pacing ("slow here, fast there") is created by scroll-LINKED
 *    motion instead: a gentle parallax depth on decorative layers plus the
 *    existing reveal choreography. We expose `--scroll-velocity` and
 *    `--scroll-progress` on <html> so any section can opt into velocity-aware
 *    effects purely in CSS.
 *  - Touch devices are left on native momentum scroll (already excellent);
 *    hijacking touch is the classic way to make a "smooth scroll" site feel
 *    laggy. We only engage on fine pointers.
 *  - Fully inert under `prefers-reduced-motion` — the browser's native scroll
 *    is used, and anchor navigation falls back to the caller's own logic.
 *  - Pauses automatically while a scroll-lock is active (e.g. the contact
 *    modal sets `body { overflow: hidden }`), so the page behind a modal does
 *    not drift and the modal's own content scrolls natively.
 *
 * The engine is a module-level singleton driven by a single requestAnimationFrame
 * loop. It renders no DOM of its own, so it never affects the global-chrome
 * ubiquity invariant.
 */

import { useEffect } from 'react';
import Lenis from 'lenis';

// ---------------------------------------------------------------------------
// Module state (singleton)
// ---------------------------------------------------------------------------

let lenis: Lenis | null = null;
let rafId = 0;
let refCount = 0;
let parallaxItems: ParallaxItem[] = [];
let parallaxScanTimer: number | null = null;
let parallaxScanStop: number | null = null;
let bodyObserver: MutationObserver | null = null;
let lockedByModal = false;

// --- Rubber-band overscroll state -------------------------------------------
// A premium elastic "stop" at the very top and bottom of the page. Because
// Lenis consumes wheel events, the browser's native overscroll bounce never
// fires — so we synthesise it by translating the content layer with resistance
// and easing it home with a slow, weighted spring.
let bounceEl: HTMLElement | null = null;
let bounceTarget = 0; // where the pull wants the content (px)
let bounceCurrent = 0; // rendered offset (px), eased toward target
let bounceActive = false; // whether an inline transform is currently applied
let lastBounceTs = 0;
const MAX_BOUNCE = 110; // hard ceiling on the elastic pull (px)

interface ParallaxItem {
  el: HTMLElement;
  /** Pixels of counter-movement per viewport of scroll. Positive = drifts up. */
  speed: number;
}

// ---------------------------------------------------------------------------
// Environment guards
// ---------------------------------------------------------------------------

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
}

function hasFinePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  try {
    // `any-pointer: fine` is true whenever a mouse/trackpad/stylus exists —
    // including touchscreen laptops whose *primary* pointer reports as coarse.
    // Phones/tablets with no fine pointer stay on native momentum scroll.
    return (
      window.matchMedia('(any-pointer: fine)').matches ||
      window.matchMedia('(pointer: fine)').matches
    );
  } catch {
    return false;
  }
}

/**
 * Whether the inertial engine should run at all.
 *
 * Motion policy is governed globally by `src/utils/forceMotion.ts` (imported
 * first in main.tsx), which makes `prefers-reduced-motion` report "no
 * preference" for every visitor. So with `HONOR_REDUCED_MOTION = true` the
 * engine still runs for everyone today, and automatically becomes accessible
 * again the moment that shim is removed. One source of truth.
 */
const HONOR_REDUCED_MOTION = true;

export function smoothScrollSupported(): boolean {
  if (!hasFinePointer()) return false;
  if (HONOR_REDUCED_MOTION && prefersReducedMotion()) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Parallax — perceived pacing without hijacking input speed
// ---------------------------------------------------------------------------

function scanParallax(): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-parallax]');
  const next: ParallaxItem[] = [];
  nodes.forEach((el) => {
    const raw = parseFloat(el.getAttribute('data-parallax') || '');
    const speed = Number.isFinite(raw) ? raw : 0.08;
    el.style.willChange = 'transform';
    next.push({ el, speed });
  });
  parallaxItems = next;
}

function updateParallax(): void {
  if (parallaxItems.length === 0) return;
  const vh = window.innerHeight || 1;
  for (const { el, speed } of parallaxItems) {
    const rect = el.getBoundingClientRect();
    // Only pay layout cost for elements near the viewport.
    if (rect.bottom < -vh || rect.top > vh * 2) continue;
    // Distance of the element's centre from the viewport centre, normalised.
    const centre = rect.top + rect.height / 2;
    const fromCentre = centre - vh / 2;
    const shift = -(fromCentre / vh) * speed * vh;
    el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
  }
}

// ---------------------------------------------------------------------------
// Rubber-band overscroll — elastic "stop" at the page extremes
// ---------------------------------------------------------------------------

/** Normalise a wheel event's vertical delta to pixels regardless of deltaMode. */
function wheelDeltaPx(e: WheelEvent): number {
  if (e.deltaMode === 1) return e.deltaY * 16; // lines → px
  if (e.deltaMode === 2) return e.deltaY * (window.innerHeight || 800); // pages → px
  return e.deltaY;
}

function resolveBounceEl(): HTMLElement | null {
  if (bounceEl && bounceEl.isConnected) return bounceEl;
  bounceEl = document.querySelector<HTMLElement>('[data-scroll-content]');
  return bounceEl;
}

function onBoundaryWheel(e: WheelEvent): void {
  if (!lenis || lockedByModal) return;
  const atTop = lenis.scroll <= 0.5;
  const atBottom = lenis.scroll >= lenis.limit - 0.5;
  const pullingPastTop = atTop && e.deltaY < 0;
  const pullingPastBottom = atBottom && e.deltaY > 0;
  if (!pullingPastTop && !pullingPastBottom) return;
  if (!resolveBounceEl()) return;

  // Diminishing resistance — the further it is pulled, the harder it resists,
  // so the elastic asymptotes toward MAX_BOUNCE instead of snapping to it.
  const resist = 1 - Math.min(Math.abs(bounceTarget) / MAX_BOUNCE, 1);
  bounceTarget += -wheelDeltaPx(e) * 0.22 * resist;
  bounceTarget = Math.max(-MAX_BOUNCE, Math.min(MAX_BOUNCE, bounceTarget));
  lastBounceTs = performance.now();
}

function updateBounce(): void {
  const el = bounceEl;
  if (!el) return;

  // No fresh pull for a moment → release and let it spring home.
  const idle = performance.now() - lastBounceTs > 60;
  if (idle) bounceTarget = 0;

  // Slow, weighted return (low ease) reads as a premium settle; the pull itself
  // tracks the finger/wheel a little more eagerly.
  const ease = idle ? 0.09 : 0.22;
  bounceCurrent += (bounceTarget - bounceCurrent) * ease;

  if (bounceTarget === 0 && Math.abs(bounceCurrent) < 0.08) {
    if (bounceActive) {
      el.style.transform = '';
      el.style.willChange = '';
      bounceActive = false;
    }
    bounceCurrent = 0;
    return;
  }

  if (!bounceActive) {
    el.style.willChange = 'transform';
    bounceActive = true;
  }
  el.style.transform = `translate3d(0, ${bounceCurrent.toFixed(2)}px, 0)`;
}

// ---------------------------------------------------------------------------
// Scroll-lock awareness (modals etc.)
// ---------------------------------------------------------------------------

function syncLockState(): void {
  if (!lenis) return;
  const locked =
    document.body.style.overflow === 'hidden' ||
    document.documentElement.style.overflow === 'hidden';
  if (locked === lockedByModal) return;
  lockedByModal = locked;
  if (locked) {
    lenis.stop();
  } else {
    lenis.start();
  }
}

// ---------------------------------------------------------------------------
// Engine lifecycle
// ---------------------------------------------------------------------------

function loop(time: number): void {
  lenis?.raf(time);
  updateBounce();
  rafId = requestAnimationFrame(loop);
}

function start(): void {
  if (lenis || typeof window === 'undefined') return;
  if (!smoothScrollSupported()) return;
  // Lenis relies on ResizeObserver. Environments without it (jsdom/SSR) get
  // native scroll — and we must never let construction throw into React render.
  if (typeof ResizeObserver === 'undefined') return;

  try {
    lenis = new Lenis({
      // Easing weight per frame. Lower = heavier/slower settle (more "luxury"),
      // higher = snappier. ~0.08 is a calm, premium glide that is unmistakably
      // smooth while still feeling responsive to intent.
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1,
      // Touch is left to the browser; this only applies if syncTouch is enabled.
      syncTouch: false,
      touchMultiplier: 1.5,
    });
  } catch {
    lenis = null;
    return;
  }

  const root = document.documentElement;
  root.classList.add('has-smooth-scroll');

  lenis.on('scroll', ({ velocity, progress }: { velocity: number; progress: number }) => {
    // Expose motion state for any CSS that wants to react (e.g. subtle skew
    // on fast flicks). Clamped so a hard flick can't blow out a transform.
    const v = Math.max(-40, Math.min(40, velocity));
    root.style.setProperty('--scroll-velocity', v.toFixed(2));
    root.style.setProperty('--scroll-progress', progress.toFixed(4));
    updateParallax();
  });

  rafId = requestAnimationFrame(loop);

  // Build the parallax set now, then re-scan a few times because lazy route
  // content mounts asynchronously (mirrors the reveal scanner in SiteShell).
  scanParallax();
  updateParallax();
  parallaxScanTimer = window.setInterval(() => {
    scanParallax();
    updateParallax();
  }, 600);
  parallaxScanStop = window.setTimeout(() => {
    if (parallaxScanTimer) window.clearInterval(parallaxScanTimer);
    parallaxScanTimer = null;
  }, 4000);

  // Pause the engine whenever something locks page scroll (modals).
  bodyObserver = new MutationObserver(syncLockState);
  bodyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
  syncLockState();

  // Rubber-band overscroll at the page extremes.
  resolveBounceEl();
  window.addEventListener('wheel', onBoundaryWheel, { passive: true });
}

function stop(): void {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  window.removeEventListener('wheel', onBoundaryWheel);
  if (bounceEl) {
    bounceEl.style.transform = '';
    bounceEl.style.willChange = '';
  }
  bounceEl = null;
  bounceTarget = 0;
  bounceCurrent = 0;
  bounceActive = false;
  if (parallaxScanTimer) window.clearInterval(parallaxScanTimer);
  if (parallaxScanStop) window.clearTimeout(parallaxScanStop);
  parallaxScanTimer = null;
  parallaxScanStop = null;
  bodyObserver?.disconnect();
  bodyObserver = null;
  lockedByModal = false;
  parallaxItems.forEach(({ el }) => {
    el.style.transform = '';
    el.style.willChange = '';
  });
  parallaxItems = [];
  lenis?.destroy();
  lenis = null;
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('has-smooth-scroll');
    root.style.removeProperty('--scroll-velocity');
    root.style.removeProperty('--scroll-progress');
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** The live Lenis instance, or null when the engine is inactive. */
export function getLenis(): Lenis | null {
  return lenis;
}

/**
 * Smoothly scroll to an absolute Y position through the shared engine.
 * Returns true if the engine handled it, false if the caller should fall back
 * to its own scrolling (reduced motion, touch, or engine not running).
 */
export function scrollToY(
  y: number,
  options: { duration?: number; offset?: number } = {}
): boolean {
  if (!lenis) return false;
  lenis.scrollTo(Math.max(0, y), {
    duration: options.duration ?? 0.9,
    offset: options.offset ?? 0,
  });
  return true;
}

// ---------------------------------------------------------------------------
// React hook — mount once in the app shell
// ---------------------------------------------------------------------------

/**
 * Activates the global smooth-scroll engine for the lifetime of the host
 * component. Reference-counted so multiple mounts (e.g. StrictMode double
 * invoke) collapse to a single engine, and it only tears down when the last
 * consumer unmounts.
 */
export function useSmoothScroll(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!smoothScrollSupported()) return undefined;

    refCount += 1;
    start();

    return () => {
      refCount -= 1;
      if (refCount <= 0) {
        refCount = 0;
        stop();
      }
    };
  }, []);
}
