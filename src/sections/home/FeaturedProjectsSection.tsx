/**
 * FeaturedProjectsSection — a macOS-Dock-style project showcase.
 *
 * Composition (single vertical hero, Apple-keynote style):
 *   1. Intro    — centered eyebrow, headline, and one sentence. Nothing else.
 *   2. Preview  — the large screenshot. This is the hero; it owns the space.
 *   3. Summary  — a whisper of project info beneath the screenshot: name,
 *                 role · tagline, one line, three tech names (the rest reveal
 *                 on hover), and two text CTAs. No metadata, no resume detail.
 *   4. Dock     — a wide, glassy macOS-style dock of identity tiles.
 *
 * Interaction model (exploratory, like macOS):
 *   - Hover / focus a tile  → *previews* that project (screenshot + summary
 *     update live while the cursor is over it).
 *   - Click a tile          → *locks* it as the selected project.
 *   - Leave the dock         → smoothly returns to the locked selection.
 *
 * Data flow (fully data-driven):
 *   - Content lives in `src/content/projects.ts` (single source of truth).
 *   - Presentation metadata (monogram, category, accent, …) is merged in via
 *     `featuredProjectsPresentation.ts`. Reorder the Dock by reordering the
 *     content array; restyle a tile by editing the presentation map.
 *
 * Linking contract (Requirements 4.2 / 4.3 — enforced by property tests):
 *   - `caseStudySlug !== null` → renders `<a href="/case-studies/<slug>">`.
 *   - `caseStudySlug === null` → renders "Case study coming soon" (no anchor).
 *
 * Validates: Requirements 2.3, 4.1, 4.2, 4.3, 4.4
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Section } from '../../components/ui';
import { projects } from '../../content/projects';
import type { ProjectEntry } from '../../content/projects';
import { toDockProject, type DockProject } from './featuredProjectsPresentation';
import './FeaturedProjectsSection.css';

// ─── Dock tuning ────────────────────────────────────────────────────────────

/** Influence radius (px) of the cursor on tile magnification. */
const MAGNIFY_RADIUS = 160;
/** Peak scale of the tile directly under the cursor. */
const MAGNIFY_SCALE = 1.45;
/** Upward lift (px) applied to a tile at peak magnification. */
const MAGNIFY_LIFT = 14;
/** Constant lift (px) of the active tile — it "detaches" from the dock. */
const ACTIVE_LIFT = 9;
/** Spring used for the featured-panel transition. */
const SPRING = { mass: 0.18, stiffness: 320, damping: 24 } as const;
/** Beyond this count, surplus tiles collapse into a "More" tile → /projects. */
const MAX_VISIBLE_TILES = 8;
/** Tech names shown before the "+N" hover-reveal. */
const TECH_VISIBLE = 3;
/** Auto-advance interval (ms). Pauses on hover; stops once the user clicks. */
const AUTOPLAY_MS = 5000;

// ─── Intro ─────────────────────────────────────────────────────────────────────

/** Headline split so the trailing clause can carry the accent gradient. */
const HEADLINE = { lead: 'Product Engineering That ', accent: 'Ships Outcomes' };
const SUBHEAD =
  "A few production systems I've architected and shipped — hover the dock to explore.";

interface IntroProps {
  reduceMotion: boolean;
  inView: boolean;
}

/** Centered intro: eyebrow, accented headline, one sentence. That's all. */
const Intro: React.FC<IntroProps> = ({ reduceMotion, inView }) => (
  <motion.div
    className="fp-intro"
    initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
    animate={
      reduceMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
    }
    transition={reduceMotion ? undefined : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  >
    <span className="fp-intro__eyebrow">
      <span className="fp-intro__eyebrow-dot" aria-hidden="true" />
      Featured Project
    </span>
    <h2 className="fp-intro__title">
      {HEADLINE.lead}
      <span className="fp-intro__accent">{HEADLINE.accent}</span>
    </h2>
    <p className="fp-intro__lead">{SUBHEAD}</p>
  </motion.div>
);

// ─── Featured preview (the hero) ───────────────────────────────────────────────

interface FeaturedPreviewProps {
  project: DockProject;
  reduceMotion: boolean;
}

/**
 * The large screenshot. On change, the new shot slides up and scales 98% → 100%
 * while the outgoing one slides up and out — never a full crossfade.
 */
const FeaturedPreview: React.FC<FeaturedPreviewProps> = ({
  project,
  reduceMotion,
}) => {
  const visualMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -12, scale: 0.98 },
        transition: { type: 'spring' as const, ...SPRING },
      };

  return (
    <div
      className="fp-preview"
      style={{ ['--fp-accent' as string]: project.accent }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={project.id}
          className="fp-preview__frame"
          {...visualMotion}
        >
          {project.coverImage ? (
            <img
              className="fp-preview__img"
              src={project.coverImage}
              alt={`${project.name} preview`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="fp-preview__mono" aria-hidden="true">
              {project.monogram}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Featured summary (beneath the hero) ───────────────────────────────────────

interface FeaturedSummaryProps {
  project: DockProject;
  index: number;
  total: number;
  reduceMotion: boolean;
}

/**
 * The whisper of info under the screenshot: counter, name, role · tagline, one
 * line, three tech names (rest reveal on hover), and two text CTAs.
 */
const FeaturedSummary: React.FC<FeaturedSummaryProps> = ({
  project,
  index,
  total,
  reduceMotion,
}) => {
  const textMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { type: 'spring' as const, ...SPRING },
      };

  const counter = `${String(index + 1).padStart(2, '0')} / ${String(
    total,
  ).padStart(2, '0')}`;

  const extra = Math.max(project.tech.length - TECH_VISIBLE, 0);

  return (
    <div
      className="fp-summary"
      style={{ ['--fp-accent' as string]: project.accent }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={project.id} className="fp-summary__body" {...textMotion}>
          <span className="fp-summary__count">{counter}</span>
          <h3 className="fp-name">{project.name}</h3>
          <p className="fp-summary__meta">
            {project.role && <span>{project.role}</span>}
            {project.role && (
              <span className="fp-summary__sep" aria-hidden="true">
                ·
              </span>
            )}
            <span>{project.tagline}</span>
          </p>
          {project.description && (
            <p className="fp-desc">{project.description}</p>
          )}

          {project.tech.length > 0 && (
            <div className="fp-tech" aria-label="Tech stack">
              {project.tech.map((tech, i) => (
                <span
                  key={tech}
                  className={`fp-tech__item${i >= TECH_VISIBLE ? ' is-extra' : ''}`}
                >
                  {tech}
                </span>
              ))}
              {extra > 0 && (
                <span className="fp-tech__more" aria-hidden="true">
                  +{extra}
                </span>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTAs live outside AnimatePresence so they never unmount mid-transition */}
      <div className="fp-cta-row">
        {project.caseStudyUrl ? (
          <Link
            to={project.caseStudyUrl}
            className="fp-cta fp-cta--primary"
            aria-label={`Read the case study for ${project.name}`}
          >
            Case Study
            <CtaArrow />
          </Link>
        ) : (
          <span className="fp-cta fp-cta--ghost" aria-disabled="true">
            Case study coming soon
          </span>
        )}

        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            className="fp-cta fp-cta--secondary"
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open the live demo for ${project.name}`}
          >
            Live
            <CtaArrow />
          </a>
        ) : (
          <span
            className="fp-cta fp-cta--secondary fp-cta--disabled"
            aria-disabled="true"
            title="Live demo coming soon"
          >
            Live
            <CtaArrow />
          </span>
        )}
      </div>
    </div>
  );
};

const CtaArrow: React.FC = () => (
  <svg
    className="fp-cta__arrow"
    width="13"
    height="13"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Media query hook ─────────────────────────────────────────────────────────

/** Subscribe to a media query; returns whether it currently matches. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

// ─── Dock magnification engine ──────────────────────────────────────────────

/**
 * Continuous, distance-driven tile scaling — the macOS Dock model, implemented
 * without layout shift. Tile transforms are written directly to the DOM on a
 * rAF loop (never via React state), so motion stays at 60fps and is fully
 * interruptible. Falloff is smoothstep in distance from a focus point: the tile
 * under the focus reaches peak scale, neighbours scale less, far tiles rest.
 *
 * Desktop drives the focus with the cursor (`onMove`). Mobile drives it with
 * the dock's own centre on scroll, so the centred card is always largest —
 * Apple Wallet / Music style. `nearest()` reports the tile closest to a focus
 * point, used on mobile to make the centred card the active project.
 */
function useDockMagnify(activeId: string, enabled: boolean) {
  const tiles = useRef(new Map<string, HTMLElement>());
  const dockRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const liftRef = useRef(true);
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) tiles.current.set(id, el);
    else tiles.current.delete(id);
  }, []);

  /** Enable/disable vertical lift (off on the flat mobile rail — scale only). */
  const setLift = useCallback((on: boolean) => {
    liftRef.current = on;
  }, []);

  const paint = useCallback((focusX: number | null) => {
    tiles.current.forEach((el, id) => {
      let factor = 0;
      if (focusX !== null) {
        const rect = el.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const t = 1 - Math.min(Math.abs(focusX - center) / MAGNIFY_RADIUS, 1);
        factor = t * t * (3 - 2 * t); // smoothstep — no snapping
      }
      const scale = 1 + (MAGNIFY_SCALE - 1) * factor;
      let translateY = 0;
      if (liftRef.current) {
        const base = id === activeRef.current ? ACTIVE_LIFT : 0;
        translateY = -(base + MAGNIFY_LIFT * factor);
      }
      el.style.transform = `translateY(${translateY}px) scale(${scale})`;
    });
  }, []);

  /** Id of the tile whose centre is closest to `focusX`. */
  const nearest = useCallback((focusX: number): string | null => {
    let best: string | null = null;
    let bestDist = Infinity;
    tiles.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      const d = Math.abs(focusX - (rect.left + rect.width / 2));
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    });
    return best;
  }, []);

  const onMove = useCallback(
    (clientX: number) => {
      if (!enabled) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => paint(clientX));
    },
    [enabled, paint],
  );

  const onLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => paint(null));
  }, [paint]);

  // Repaint when the active tile changes so its detached lift stays in sync.
  useEffect(() => {
    paint(null);
  }, [activeId, paint]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { register, dockRef, paint, nearest, setLift, onMove, onLeave };
}

// ─── Dock ──────────────────────────────────────────────────────────────────────

interface DockProps {
  projectsToShow: DockProject[];
  overflowCount: number;
  activeId: string;
  onPreview: (id: string) => void;
  onSelect: (id: string) => void;
  onPreviewEnd: () => void;
  reduceMotion: boolean;
  isMobile: boolean;
}

const Dock: React.FC<DockProps> = ({
  projectsToShow,
  overflowCount,
  activeId,
  onPreview,
  onSelect,
  onPreviewEnd,
  reduceMotion,
  isMobile,
}) => {
  const enableMagnify = !reduceMotion && !isMobile;
  const { register, dockRef, paint, nearest, setLift, onMove, onLeave } =
    useDockMagnify(activeId, enableMagnify);

  // Flat rail on mobile (scale only, no lift); lifted dock on desktop.
  useEffect(() => {
    setLift(!isMobile);
    paint(null);
  }, [isMobile, setLift, paint]);

  const handleLeave = useCallback(() => {
    onLeave();
    onPreviewEnd();
  }, [onLeave, onPreviewEnd]);

  // Mobile: the centred card is the active project. As the rail scrolls, scale
  // tiles by distance from the dock centre and lock the nearest one — swipe to
  // change projects, no tap required.
  const lastCenteredRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isMobile) return;
    const dock = dockRef.current;
    if (!dock) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = dock.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        if (!reduceMotion) paint(cx);
        const id = nearest(cx);
        if (id && id !== lastCenteredRef.current) {
          lastCenteredRef.current = id;
          onSelect(id);
        }
      });
    };
    dock.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      dock.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMobile, reduceMotion, dockRef, paint, nearest, onSelect]);

  // Tap (or programmatic select) on mobile scrolls that tile to centre.
  const scrollToCenter = useCallback(
    (el: HTMLElement | null) => {
      if (!isMobile || !el) return;
      el.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    },
    [isMobile, reduceMotion],
  );

  return (
    <div className="fp-dock-wrap">
      <div
        ref={dockRef}
        className="fp-dock"
        role="tablist"
        aria-label="Project dock"
        onPointerMove={isMobile ? undefined : (e) => onMove(e.clientX)}
        onPointerLeave={isMobile ? undefined : handleLeave}
      >
        {projectsToShow.map((project) => {
          const active = project.id === activeId;
          return (
            <button
              key={project.id}
              ref={(el) => register(project.id, el)}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Show ${project.name} — ${project.category}`}
              className={`fp-tile${active ? ' is-active' : ''}`}
              style={{ ['--fp-accent' as string]: project.accent }}
              onClick={(e) => {
                onSelect(project.id);
                scrollToCenter(e.currentTarget);
              }}
              onMouseEnter={isMobile ? undefined : () => onPreview(project.id)}
              onFocus={isMobile ? undefined : () => onPreview(project.id)}
            >
              <span className="fp-tile__indicator" aria-hidden="true" />
              <span className="fp-tile__mono">{project.monogram}</span>
              <span className="fp-tile__name">{project.name}</span>
              <span className="fp-tile__cat">{project.category}</span>
            </button>
          );
        })}

        {/* Persistent portal to the full projects index. Shows the overflow
            count when tiles are collapsed, otherwise a plain "View All". */}
        <Link
          to="/projects"
          className="fp-tile fp-tile--more"
          aria-label={
            overflowCount > 0
              ? `View all projects — ${overflowCount} more`
              : 'View all projects'
          }
        >
          <span className="fp-tile__mono fp-tile__mono--more" aria-hidden="true">
            <span /> <span /> <span />
          </span>
          <span className="fp-tile__name">More Projects</span>
          <span className="fp-tile__cat">
            {overflowCount > 0 ? `+${overflowCount}` : 'View All'}
          </span>
        </Link>
      </div>
    </div>
  );
};

// ─── Section ─────────────────────────────────────────────────────────────────

export interface FeaturedProjectsSectionProps {
  /**
   * Optional override for the projects list. Defaults to the canonical
   * `projects` content array. Exposed for property-based tests.
   */
  projectList?: ProjectEntry[];
}

/**
 * FeaturedProjectsSection — the home-page signature interaction.
 *
 * Renders projects in content-array order. A single large preview is paired
 * with a magnifying Dock: hover previews, click locks, leaving returns.
 */
export const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = ({
  projectList,
}) => {
  const source = projectList ?? projects;
  const dockProjects = source.map(toDockProject);

  const reduceMotion = useReducedMotion() ?? false;
  const isMobile = useMediaQuery('(max-width: 600px)');
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  // Two-layer selection model: a locked `selectedId` and a transient
  // `previewId` driven by hover/focus. The displayed project is the preview
  // when present, otherwise the locked selection.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  // Set once the user explicitly picks a project — auto-advance then stops.
  const [userEngaged, setUserEngaged] = useState(false);

  const displayedId = previewId ?? selectedId;
  const active =
    dockProjects.find((p) => p.id === displayedId) ?? dockProjects[0] ?? null;
  const total = dockProjects.length;
  const activeIndex = active
    ? dockProjects.findIndex((p) => p.id === active.id)
    : 0;

  // Collapse surplus tiles into a single "More" tile → /projects.
  const hasOverflow = total > MAX_VISIBLE_TILES;
  const projectsToShow = hasOverflow
    ? dockProjects.slice(0, MAX_VISIBLE_TILES - 1)
    : dockProjects;
  const overflowCount = hasOverflow ? total - (MAX_VISIBLE_TILES - 1) : 0;

  const handlePreview = useCallback((id: string) => setPreviewId(id), []);
  const handlePreviewEnd = useCallback(() => setPreviewId(null), []);
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setPreviewId(id);
    setUserEngaged(true);
  }, []);

  // Auto-advance through projects at a calm interval. It only runs on desktop
  // while the section is in view and motion is allowed; it pauses whenever the
  // cursor is previewing a tile, and stops for good once the user clicks.
  const orderRef = useRef<string[]>([]);
  orderRef.current = dockProjects.map((p) => p.id);
  const autoplay =
    !reduceMotion && !isMobile && inView && !userEngaged && previewId === null;
  useEffect(() => {
    if (!autoplay || total <= 1) return;
    const timer = window.setInterval(() => {
      setSelectedId((prev) => {
        const order = orderRef.current;
        const idx = order.indexOf(prev ?? order[0]);
        return order[(idx + 1) % order.length] ?? prev;
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, total]);

  const revealMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <Section
      id="portfolio"
      padding="8"
      style={{
        maxWidth: 'var(--page-max)',
        margin: '0 auto',
        paddingInline: 'var(--page-pad-x)',
      }}
    >
      {active && (
        <motion.div
          ref={ref}
          className="fp-showcase"
          style={
            active.coverImage
              ? ({ ['--fp-cover' as string]: `url("${active.coverImage}")` } as React.CSSProperties)
              : undefined
          }
          {...revealMotion}
        >
          {/* Blurred ambient backdrop derived from the active project cover —
              contained to the showcase and faded out at the bottom. */}
          <div className="fp-ambient" aria-hidden="true" />
          <Intro reduceMotion={reduceMotion} inView={inView} />
          <div className="fp-stage">
            <FeaturedPreview project={active} reduceMotion={reduceMotion} />
            <FeaturedSummary
              project={active}
              index={activeIndex}
              total={total}
              reduceMotion={reduceMotion}
            />
          </div>

          <div className="fp-dock-zone">
            <Dock
              projectsToShow={projectsToShow}
              overflowCount={overflowCount}
              activeId={active.id}
              onPreview={handlePreview}
              onSelect={handleSelect}
              onPreviewEnd={handlePreviewEnd}
              reduceMotion={reduceMotion}
              isMobile={isMobile}
            />

            <p className="fp-hint">
              <MouseGlyph />
              {isMobile ? 'Swipe to explore projects' : 'Hover to preview · click to lock'}
            </p>
          </div>
        </motion.div>
      )}
    </Section>
  );
};

const MouseGlyph: React.FC = () => (
  <svg
    className="fp-hint__icon"
    width="14"
    height="18"
    viewBox="0 0 14 18"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="1"
      y="1"
      width="12"
      height="16"
      rx="6"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path d="M7 4.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default FeaturedProjectsSection;
