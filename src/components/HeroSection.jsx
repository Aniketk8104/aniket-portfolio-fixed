import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './HeroSection.css';
import MissionControl from './MissionControl';
import Magnetic from './ui/Magnetic';

// Ambient 3D accent — lazy-loaded so it never bloats the initial bundle.
const HeroAccent3D = lazy(() => import('./HeroAccent3D'));

/**
 * Decide whether the 3D accent is worth loading *before* we import the
 * three.js / @react-three stack (~hundreds of KB). Mirrors the guard inside
 * HeroAccent3D so the heavy chunk never touches the critical path on devices
 * that would render nothing anyway (touch, small, reduced-motion, data-saver).
 */
function accentEligible() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(max-width: 1024px)').matches) return false;
  if (window.matchMedia('(pointer: coarse)').matches) return false;
  const connection = typeof navigator !== 'undefined' ? navigator.connection : undefined;
  if (connection && connection.saveData) return false;
  return true;
}

/* The hero headline, revealed line-by-line for clean editorial rhythm. */
const HEADLINE = [
  { text: 'I engineer', accent: false },
  { text: 'systems that', accent: false },
  { text: 'stay online', accent: true },
  { text: 'at scale.', accent: true },
];

/* Faint architecture diagram that becomes the hero backdrop. */
const ARCH_NODES = [
  { x: 8, y: 30, t: 'API' },
  { x: 26, y: 64, t: 'Queue' },
  { x: 44, y: 32, t: 'Workers' },
  { x: 62, y: 66, t: 'Mongo' },
  { x: 78, y: 34, t: 'Redis' },
  { x: 92, y: 62, t: 'AI' },
];
const ARCH_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 2], [2, 4],
];

function ArchitectureBackdrop() {
  return (
    <svg className="hero-arch-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {ARCH_EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={ARCH_NODES[a].x}
          y1={ARCH_NODES[a].y}
          x2={ARCH_NODES[b].x}
          y2={ARCH_NODES[b].y}
        />
      ))}
      {ARCH_NODES.map((n) => (
        <circle key={n.t} cx={n.x} cy={n.y} r="0.9" />
      ))}
    </svg>
  );
}

const HeroSection = () => {
  const reduced = useReducedMotion();
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  // Gate the heavy 3D chunk: only after the hero has painted and the main
  // thread is idle, and only on devices that will actually render it. This
  // keeps three.js / @react-three off the LCP critical path entirely.
  const [mount3D, setMount3D] = useState(false);
  // Pause heavy work (simulation + 3D) when the hero is off-screen or the tab
  // is hidden — saves CPU/GPU without affecting the on-screen experience.
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const active = inView && tabVisible;

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
        threshold: 0.05,
      });
      io.observe(hero);
    }
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    if (!accentEligible()) return undefined;
    let idleId = 0;
    let timeoutId = 0;
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setMount3D(true), { timeout: 2500 });
      } else {
        timeoutId = window.setTimeout(() => setMount3D(true), 1200);
      }
    };
    // Wait one frame past first paint before even scheduling the import.
    const raf = requestAnimationFrame(schedule);
    return () => {
      cancelAnimationFrame(raf);
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Cursor-as-light + architecture reveal origin.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof window === 'undefined') return undefined;
    const fine = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduceMq.matches) return undefined;
    let raf = 0;
    let mx = 50;
    let my = 30;
    const commit = () => {
      raf = 0;
      hero.style.setProperty('--hero-mx', `${mx.toFixed(1)}%`);
      hero.style.setProperty('--hero-my', `${my.toFixed(1)}%`);
    };
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth) * 100;
      my = (e.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(commit);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  // Pointer perspective tilt + spotlight ("glass hardware").
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof window === 'undefined') return undefined;
    const fine = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduceMq.matches) return undefined;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let mx = 50;
    let my = 50;
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const commit = () => {
      raf = 0;
      stage.style.setProperty('--ry', `${(tx * 6).toFixed(2)}deg`);
      stage.style.setProperty('--rx', `${(ty * -4.5).toFixed(2)}deg`);
      stage.style.setProperty('--mx', `${mx.toFixed(1)}%`);
      stage.style.setProperty('--my', `${my.toFixed(1)}%`);
    };
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
      ty = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
      mx = ((e.clientX - r.left) / r.width) * 100;
      my = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(commit);
    };
    const onEnter = () => stage.classList.add('is-active');
    const onLeave = () => {
      stage.classList.remove('is-active');
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ['--rx', '--ry', '--mx', '--my'].forEach((p) => stage.style.removeProperty(p));
      tx = 0;
      ty = 0;
    };
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseenter', onEnter);
    stage.addEventListener('mouseleave', onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseenter', onEnter);
      stage.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const lead = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
  };
  const line = {
    hidden: { y: '110%' },
    visible: { y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };
  // LCP element. Keep the entrance subtle and fast so the hero copy paints
  // quickly instead of being gated behind a long opacity hold.
  const fade = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section id="home" className="hero" ref={heroRef}>
      {/* Architecture backdrop — faint, glows near the cursor.
          data-parallax: drifts slowly against scroll for cinematic depth
          (handled by the global smooth-scroll engine; inert on touch/reduced). */}
      <div className="hero-arch hero-arch--base" data-parallax="0.12" aria-hidden="true">
        <ArchitectureBackdrop />
      </div>
      <div className="hero-arch hero-arch--reveal" aria-hidden="true">
        <ArchitectureBackdrop />
      </div>
      <div className="hero-light" aria-hidden="true" />

      <div className="hero-inner">
        {/* Heading block (eyebrow + headline) */}
        <div className="hero-head">
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="hero-os-dot" />
            <span className="hero-os-name">Runtime&nbsp;Status</span>
            <span className="hero-os-sep" />
            <span className="hero-os-state">all systems operational</span>
          </motion.div>

          <motion.h1
            className="hero-headline"
            variants={reduced ? undefined : lead}
            initial={reduced ? false : 'hidden'}
            animate={reduced ? false : 'visible'}
          >
            {HEADLINE.map((l, i) => (
              <span className="hero-line" key={i}>
                <motion.span
                  className={`hero-line-inner ${l.accent ? 'hero-accent' : ''}`}
                  variants={reduced ? undefined : line}
                >
                  {l.text}
                </motion.span>
              </span>
            ))}
          </motion.h1>
        </div>

        {/* Mission Control centerpiece */}
        <motion.div
          className="hero-stagewrap"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className="hero-accent3d" aria-hidden="true">
            {mount3D && (
              <Suspense fallback={null}>
                <HeroAccent3D active={active} />
              </Suspense>
            )}
          </div>
          <div className="mc-stage" ref={stageRef}>
            <div className="mc-tilt">
              <MissionControl reduced={!!reduced} active={active} />
            </div>
          </div>
        </motion.div>

        {/* Body (paragraph + CTAs + hint) */}
        <div className="hero-body">
          <motion.p
            className="hero-statement"
            variants={reduced ? undefined : fade}
            initial={reduced ? false : 'hidden'}
            animate={reduced ? false : 'visible'}
            transition={{ delay: 0.28 }}
          >
            Distributed backends, platform infrastructure, and AI automation —
            architected for reliability and owned through production.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={reduced ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <Magnetic
              as="a"
              href="#contact"
              data-open-contact
              className="btn btn-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Start a conversation
            </Magnetic>
            <Magnetic
              as="a"
              href="#portfolio"
              className="btn btn-secondary"
            >
              View projects
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Magnetic>
          </motion.div>

          <motion.p
            className="hero-hint"
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? false : { opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <span className="hero-hint-key">↔</span> Hover a node to inspect the
            live system · switch projects to morph it
          </motion.p>
        </div>
      </div>

      <motion.a
        href="#about"
        className="scroll-cue"
        animate={reduced ? undefined : { y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        aria-label="Scroll to learn more"
      >
        <span className="scroll-cue-text">Scroll</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.a>
    </section>
  );
};

export default HeroSection;
