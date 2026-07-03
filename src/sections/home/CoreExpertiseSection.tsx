/**
 * CoreExpertiseSection
 *
 * Renders the "Core Expertise" section on the Home page as a premium,
 * asymmetric BENTO mosaic. Content is sourced from the typed
 * `expertiseAreas` module export and rendered verbatim.
 *
 * Layout: CSS grid (6 columns on desktop) where tiles span different
 * column/row counts to create an intentional, balanced asymmetric layout.
 * The first/most-important area is a feature tile (3 cols × 2 rows).
 * Collapses to 2 columns on tablet and 1 column on mobile.
 *
 * Validates: Requirements 2.1, 9.2
 */
import React from 'react';
import { m } from 'framer-motion';

import { Section, Tag } from '../../components/ui';
import { fadeUp } from '../../design-system/motionVariants';
import { expertiseAreas } from '../../content/expertise';
import type { ExpertiseArea } from '../../content/expertise';
import './CoreExpertiseSection.css';

// ─────────────────────────────────────────────────────────────
// Per-area icons — gives each expertise tile a distinct identity
// ─────────────────────────────────────────────────────────────

const AREA_ICONS: Record<string, React.ReactNode> = {
  'backend-platform': (
    <path d="M4 7a8 3 0 1 0 16 0A8 3 0 1 0 4 7m0 0v10a8 3 0 0 0 16 0V7M4 12a8 3 0 0 0 16 0" />
  ),
  'ai-automation': (
    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  ),
  'messaging-realtime': (
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
  ),
  'healthcare-workflow': (
    <path d="M12 8v8m-4-4h8M7.5 3h9L21 7.5v9L16.5 21h-9L3 16.5v-9L7.5 3Z" />
  ),
  'devops-infra': (
    <path d="m12 2 3 2.5L18.5 4 20 7.5 23 9l-1.5 3L23 15l-3 1.5L18.5 20 15 19.5 12 22l-3-2.5L5.5 20 4 16.5 1 15l1.5-3L1 9l3-1.5L5.5 4 9 4.5 12 2Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
  ),
  'full-stack': (
    <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18" />
  ),
};

const DEFAULT_ICON = <path d="M4 5h16v14H4zM4 9h16M9 5v14" />;

const MAX_VISIBLE_TAGS = 5;

/**
 * Bento span class for a tile by its position.
 * Index 0 → feature (3×2), 1–2 → wide (3 cols), 3–5 → third (2 cols).
 * Auto-flow then composes a balanced mosaic for 6 items.
 */
const tileSizeClass = (index: number): string => {
  if (index === 0) return 'bento-tile--feature';
  if (index <= 2) return 'bento-tile--wide';
  return 'bento-tile--third';
};

// ─────────────────────────────────────────────────────────────
// Sub-component: individual expertise bento tile
// ─────────────────────────────────────────────────────────────

interface ExpertiseTileProps {
  area: ExpertiseArea;
  index: number;
}

const ExpertiseTile: React.FC<ExpertiseTileProps> = ({ area, index }) => {
  const isFeature = index === 0;
  const visibleTags = area.tags.slice(0, MAX_VISIBLE_TAGS);
  const overflow = area.tags.length - visibleTags.length;

  return (
    <m.article
      variants={fadeUp}
      className={`bento-tile ${tileSizeClass(index)}${isFeature ? ' bento-tile--is-feature' : ''}`}
    >
      <span aria-hidden="true" className="bento-tile__icon">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {AREA_ICONS[area.id] ?? DEFAULT_ICON}
        </svg>
      </span>

      <h3 className="bento-tile__title">{area.title}</h3>

      <p className={`bento-tile__desc${isFeature ? '' : ' bento-tile__desc--clamp'}`}>
        {area.description}
      </p>

      <div className="bento-tile__tags" aria-label={`Technologies for ${area.title}`}>
        {visibleTags.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
        {overflow > 0 && (
          <Tag style={{ color: 'var(--color-text-muted)' }}>+{overflow} more</Tag>
        )}
      </div>
    </m.article>
  );
};

// ─────────────────────────────────────────────────────────────
// Container motion variants for staggered tile entrance
// ─────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Main section
// ─────────────────────────────────────────────────────────────

/**
 * CoreExpertiseSection
 *
 * Displays an asymmetric bento mosaic of engineering expertise areas
 * sourced from the typed `expertiseAreas` content module.
 *
 * @example
 * <CoreExpertiseSection />
 */
export const CoreExpertiseSection: React.FC = () => (
  <Section
    id="expertise"
    eyebrow="Core Expertise"
    title="Engineering depth across the full stack"
    lead="From distributed backend systems to AI automation pipelines and frontend product surfaces — every layer designed for production."
    style={{
      maxWidth: 'var(--page-max)',
      margin: '0 auto',
      paddingInline: 'var(--page-pad-x)',
    }}
  >
    <m.div
      className="bento-grid"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {expertiseAreas.map((area, index) => (
        <ExpertiseTile key={area.id} area={area} index={index} />
      ))}
    </m.div>
  </Section>
);

export default CoreExpertiseSection;
