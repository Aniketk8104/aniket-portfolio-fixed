/**
 * NavbarBrand — the identity module of the ENGINEERING OS.
 *
 * This is not a logo. It is a system-identity component: a soft status light
 * that breathes like a running service, a context-aware title that changes per
 * page, and a subtitle that morphs on hover. Designed to read as a native
 * macOS toolbar item — calm, precise, timeless.
 *
 * Composition (all reusable):
 *   NavbarBrand → StatusLight + BrandTitle + BrandSubtitle
 *
 * Data-driven: the title is resolved from `pageKey` via PAGE_TITLES, never
 * hardcoded. Motion respects `prefers-reduced-motion`. The ambient heartbeat
 * is a CSS keyframe (GPU, self-pausing under reduced motion); Framer Motion
 * drives only the elegant load-in and the hover subtitle crossfade.
 *
 * @module components/NavbarBrand
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import './NavbarBrand.css';

/** First-line label per active page. The subtitle stays constant. */
const PAGE_TITLES: Record<string, string> = {
  home: 'ENGINEERING OS',
  projects: 'PROJECT REGISTRY',
  'case-studies': 'SYSTEM ARCHIVES',
  writing: 'ENGINEERING NOTES',
  contact: 'COMMUNICATION CHANNEL',
};

const DEFAULT_TITLE = 'ENGINEERING OS';
const SUBTITLE_REST = 'by Aniket Kushwaha';
const SUBTITLE_HOVER = 'Backend • Platform • AI';
const DRAWER_TAGLINE = 'Backend • Platform • AI Engineer';

const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const;

// ── StatusLight ──────────────────────────────────────────────────────────────
// 8px cyan-green operational indicator. The halo (::after) breathes via CSS.

const StatusLight: React.FC = () => (
  <span className="brand-status" aria-hidden="true">
    <span className="brand-status__dot" />
  </span>
);

// ── BrandTitle ───────────────────────────────────────────────────────────────

const BrandTitle: React.FC<{ label: string }> = ({ label }) => (
  <span className="brand-title">{label}</span>
);

// ── BrandSubtitle ────────────────────────────────────────────────────────────
// Crossfades between the rest label and the hover label without layout shift.

const BrandSubtitle: React.FC<{ hovered: boolean; reduced: boolean }> = ({ hovered, reduced }) => (
  <span className="brand-subtitle">
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={hovered ? 'hover' : 'rest'}
        className="brand-subtitle__text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.25, ease: [0.2, 0, 0, 1] }}
      >
        {hovered ? SUBTITLE_HOVER : SUBTITLE_REST}
      </motion.span>
    </AnimatePresence>
  </span>
);

export interface NavbarBrandProps {
  /** Active page key used to resolve the first-line label. */
  pageKey?: string;
  /** Called when the brand is activated (e.g. to close the mobile menu). */
  onNavigate?: () => void;
  /** `bar` = navbar module; `drawer` = full stacked identity in mobile menu. */
  variant?: 'bar' | 'drawer';
}

/**
 * The full stacked identity shown inside the mobile navigation drawer.
 */
const DrawerIdentity: React.FC = () => (
  <div className="navbar-brand navbar-brand--drawer" aria-label="Engineering OS by Aniket Kushwaha">
    <StatusLight />
    <span className="brand-text">
      <BrandTitle label={DEFAULT_TITLE} />
      <span className="brand-subtitle brand-subtitle--static">{SUBTITLE_REST}</span>
      <span className="brand-tagline">{DRAWER_TAGLINE}</span>
    </span>
  </div>
);

const NavbarBrand: React.FC<NavbarBrandProps> = ({ pageKey = 'home', onNavigate, variant = 'bar' }) => {
  const reduced = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState(false);
  const title = PAGE_TITLES[pageKey] ?? DEFAULT_TITLE;

  if (variant === 'drawer') return <DrawerIdentity />;

  // Load-in: status → title (slides up 6px) → subtitle, then the heartbeat.
  const container: Variants = {
    hidden: { opacity: reduced ? 1 : 0 },
    show: {
      opacity: 1,
      transition: reduced ? { duration: 0 } : { staggerChildren: 0.09, delayChildren: 0.08 },
    },
  };
  const item: Variants = reduced
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: SPRING } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="navbar-brand-wrap">
      <Link
        to="/"
        className="navbar-brand"
        aria-label="Engineering OS by Aniket Kushwaha"
        onClick={onNavigate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {/* Full identity — desktop & tablet */}
        <span className="navbar-brand__full">
          <motion.span variants={item} className="brand-motion-item">
            <StatusLight />
          </motion.span>
          <span className="brand-text">
            <motion.span variants={item} className="brand-motion-item">
              <BrandTitle label={title} />
            </motion.span>
            <motion.span variants={item} className="brand-motion-item brand-subtitle-slot">
              <BrandSubtitle hovered={hovered} reduced={reduced} />
            </motion.span>
          </span>
        </span>

        {/* Compact identity — mobile */}
        <span className="navbar-brand__compact" aria-hidden="true">
          <StatusLight />
          <span className="brand-ak">AK</span>
        </span>
      </Link>
    </motion.div>
  );
};

export default NavbarBrand;
