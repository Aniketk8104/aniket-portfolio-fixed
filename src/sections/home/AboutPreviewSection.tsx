/**
 * AboutPreviewSection — engineering *identity* system (not a bio / profile).
 *
 * One component with several "personalities" across breakpoints. The editorial
 * copy is split into a `heading` block and a `body` block (paragraph + chips +
 * CTA) so the constellation can be re-placed purely via CSS grid-areas:
 *   Desktop / Laptop   editorial │ constellation │ snapshot   (one row)
 *   Tablet landscape   heading → body → constellation → snapshot
 *   Tablet portrait    heading → constellation → body → snapshot  (orb as hero)
 *   Mobile             heading → constellation(icons) → body → snapshot(accordion)
 *
 * No photo, socials, location, years, progress bars, or résumé data — the
 * projects already prove the skills; this communicates mindset.
 *
 * Data-driven: edit `IDENTITY_CHIPS`, `SNAPSHOT`, or the constellation's
 * domains. Reusable pieces: AboutConstellation, IdentityChip, SnapshotItem.
 *
 * Validates: Requirements 2.4, 3.1, 3.3
 * @module sections/home/AboutPreviewSection
 */
import React, { useEffect, useId, useState } from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import { Placeholder } from '../shared/Placeholder';
import { isPlaceholder } from '../../utils/placeholder';
import type { Placeholder as PlaceholderType } from '../../utils/placeholder';
import { fadeUp } from '../../design-system/motionVariants';
import { AboutConstellation } from './AboutConstellation';

import './AboutPreviewSection.css';

// ── Media query hook (SSR / jsdom safe) ───────────────────────────────────────

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

// ── Props ───────────────────────────────────────────────────────────────────

export interface AboutPreviewSectionProps {
  /** Engineering headline (kept for API compatibility; the statement is fixed). */
  headline?: string | PlaceholderType<string>;
  /** Concise positioning paragraph (max ~4 lines). */
  summary: string | PlaceholderType<string>;
  /** CTA target. */
  readMoreHref?: string;
  /** CTA label. */
  readMoreLabel?: string;
}

// ── Editorial data ────────────────────────────────────────────────────────────

/** The bold statement, split so the closing clause carries the accent. */
const STATEMENT = { lead: 'Engineering-first,', accent: 'product-minded.' };

/** Fallback paragraph when no authored summary is supplied. */
const DEFAULT_PARAGRAPH =
  'I build reliable backend platforms and AI-powered systems that stay scalable, maintainable, and resilient as products and teams grow.';

/** Philosophy chips — mindset, not skills. */
const IDENTITY_CHIPS = [
  'Production Focused',
  'Scalable by Design',
  'Automation Driven',
  'Impact Oriented',
];

// ── Snapshot data ─────────────────────────────────────────────────────────────

interface SnapshotBlock {
  title: string;
  items?: string[];
  text?: string;
}

const SNAPSHOT: SnapshotBlock[] = [
  { title: 'Currently Building', items: ['Multi-tenant SaaS platforms', 'Automation systems'] },
  {
    title: 'Focused On',
    items: ['Backend Architecture', 'Platform Engineering', 'AI Infrastructure'],
  },
  { title: 'Experience', text: 'Turning ideas into production systems.' },
  {
    title: 'Open To',
    items: ['Meaningful engineering challenges', 'Founding teams', 'Senior backend opportunities'],
  },
];

// ── Reusable pieces ───────────────────────────────────────────────────────────

const IdentityChip: React.FC<{ label: string }> = ({ label }) => (
  <li className="ab-chip">{label}</li>
);

const SnapshotBody: React.FC<{ block: SnapshotBlock; id?: string }> = ({ block, id }) => (
  <div className="ab-snap__body" id={id}>
    {block.text ? (
      <p className="ab-snap__text">{block.text}</p>
    ) : (
      <ul className="ab-snap__list">
        {block.items?.map((item) => (
          <li key={item} className="ab-snap__list-item">
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);

/** Static item (desktop / tablet) — title always above its content. */
const SnapshotItem: React.FC<{ block: SnapshotBlock }> = ({ block }) => (
  <div className="ab-snap__item">
    <span className="ab-snap__title">{block.title}</span>
    <SnapshotBody block={block} />
  </div>
);

/** Collapsible item (mobile) — only one open at a time. */
const SnapshotAccordionItem: React.FC<{
  block: SnapshotBlock;
  open: boolean;
  onToggle: () => void;
}> = ({ block, open, onToggle }) => {
  const bodyId = useId();
  return (
    <div className={`ab-snap__item ab-snap__item--acc${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="ab-snap__trigger"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span className="ab-snap__title">{block.title}</span>
        <span className="ab-snap__chevron" aria-hidden="true" />
      </button>
      {open && <SnapshotBody block={block} id={bodyId} />}
    </div>
  );
};

const Arrow: React.FC = () => (
  <svg
    className="ab-cta__arrow"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Motion ────────────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

// ── Component ─────────────────────────────────────────────────────────────────

export const AboutPreviewSection: React.FC<AboutPreviewSectionProps> = ({
  summary,
  readMoreHref = '/projects',
  readMoreLabel = 'Know more about my journey',
}) => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  // On mobile the snapshot starts fully collapsed (most compact); tap to open.
  const [openSnap, setOpenSnap] = useState(-1);

  return (
    <LazyMotion features={domAnimation}>
      <div className="ab" aria-labelledby="ab-statement">
        <m.div
          className="ab__grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* ── Heading ── */}
          <m.div className="ab__heading" variants={fadeUp}>
            <span className="ab__label">About</span>
            <h2 id="ab-statement" className="ab__statement">
              {STATEMENT.lead}
              <br />
              <span className="ab__statement-accent">{STATEMENT.accent}</span>
            </h2>
          </m.div>

          {/* ── CENTER: engineering constellation ── */}
          <m.div className="ab__constellation" variants={fadeUp}>
            <AboutConstellation core="AK" />
          </m.div>

          {/* ── Body: paragraph + chips + CTA ── */}
          <m.div className="ab__body" variants={fadeUp}>
            <p className="ab__paragraph">
              {isPlaceholder(summary) ? (
                <Placeholder field={summary.__field} />
              ) : (
                summary || DEFAULT_PARAGRAPH
              )}
            </p>

            <ul className="ab__chips" aria-label="Engineering philosophy">
              {IDENTITY_CHIPS.map((chip) => (
                <IdentityChip key={chip} label={chip} />
              ))}
            </ul>

            <a className="ab-cta" href={readMoreHref}>
              {readMoreLabel}
              <Arrow />
            </a>
          </m.div>

          {/* ── RIGHT: engineering snapshot ── */}
          <m.aside className="ab__snapshot" variants={fadeUp} aria-label="Engineering snapshot">
            <div className="ab-snap">
              {SNAPSHOT.map((block, i) =>
                isMobile ? (
                  <SnapshotAccordionItem
                    key={block.title}
                    block={block}
                    open={openSnap === i}
                    onToggle={() => setOpenSnap((cur) => (cur === i ? -1 : i))}
                  />
                ) : (
                  <SnapshotItem key={block.title} block={block} />
                ),
              )}
              <div className="ab-snap__status">
                <span className="ab-snap__status-dot" aria-hidden="true" />
                Open to Work
              </div>
            </div>
          </m.aside>
        </m.div>
      </div>
    </LazyMotion>
  );
};

export default AboutPreviewSection;
