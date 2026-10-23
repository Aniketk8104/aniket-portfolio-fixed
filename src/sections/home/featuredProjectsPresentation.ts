/**
 * Featured Projects — Presentation Layer
 *
 * The macOS-Dock-style showcase is fully data-driven. Content (title, summary,
 * role, tech, case-study link) is owned by `src/content/projects.ts` and stays
 * the single source of truth for the rest of the site. This module adds the
 * *presentation* metadata the Dock needs — monogram, category, accent, live
 * URL, and a few light identity fields — keyed by project slug.
 *
 * To reorder the Dock: reorder the array in `src/content/projects.ts`.
 * To restyle a tile: edit the entry here. Unknown slugs (e.g. synthetic test
 * fixtures) fall back to values derived from the project itself, so the
 * component renders correctly for any `ProjectEntry`.
 *
 * @module sections/home/featuredProjectsPresentation
 */

import type { ProjectEntry } from '../../content/projects';
import { isPlaceholder, type Placeholder } from '../../utils/placeholder';

/** Lifecycle label shown beside the status dot in the featured panel. */
export type ProjectStatus = 'Production' | 'In Progress' | 'Archived';

/**
 * Per-project presentation metadata. Everything here is optional at the
 * call-site: missing fields are derived from the `ProjectEntry`.
 */
export interface ProjectPresentation {
  /** 2-letter identity monogram (e.g. "BV"). Derived from title if omitted. */
  monogram?: string;
  /** Tiny uppercase category shown on the tile (e.g. "SaaS Platform"). */
  category?: string;
  /** Longer one-line descriptor shown under the name in the panel. */
  tagline?: string;
  /**
   * Concise role label for the panel meta grid (e.g. "Founder & Lead
   * Engineer"). Overrides the content `role` for display only; when omitted
   * the resolved content role is used.
   */
  role?: string;
  /** Subtle accent hex — used only for hover / selection / focus. */
  accent?: string;
  /** Public live deployment URL. When absent, the Live Demo CTA is disabled. */
  liveUrl?: string | null;
  /** Engagement window, e.g. "Jan 2024 – Present". */
  duration?: string | null;
  /** Team size descriptor, e.g. "Solo" or "Team of 4". */
  teamSize?: string | null;
  /** Lifecycle status. Defaults from publication status. */
  status?: ProjectStatus;
}

/**
 * The fully-resolved view model the Dock renders. Produced by `toDockProject`.
 */
export interface DockProject {
  id: string;
  name: string;
  monogram: string;
  category: string;
  /** One-line descriptor under the name in the panel. */
  tagline: string;
  accent: string;
  role: string | null;
  duration: string | null;
  teamSize: string | null;
  status: ProjectStatus;
  /** Resolved description, or null when only a placeholder exists. */
  description: string | null;
  coverImage?: string;
  tech: string[];
  liveUrl: string | null;
  /** `/case-studies/<slug>` when a case study exists, else null. */
  caseStudyUrl: string | null;
}

/**
 * Presentation overrides keyed by project slug. Accents are intentionally
 * desaturated — only hints of color, never floods.
 */
export const PRESENTATION: Record<string, ProjectPresentation> = {
  bvisionr: {
    monogram: 'BV',
    category: 'SaaS Platform',
    tagline: 'Multi-tenant WhatsApp Cloud API SaaS',
    role: 'Primary engineer',
    accent: '#8B5CF6',
    liveUrl: 'https://connect.bvisionr.com/',
    duration: 'Oct 2025 – present',
    teamSize: null,
    status: 'Production',
  },
  'aurastack-crm': {
    monogram: 'AS',
    category: 'CRM',
    tagline: 'Multi-tenant CRM for real-estate developers',
    role: 'Primary engineer',
    accent: '#22C55E',
    liveUrl: 'https://crm.aurastack.in/',
    duration: 'Jul 2026 – present',
    teamSize: null,
    status: 'Production',
  },
  'future-fortune-hrms': {
    monogram: 'FF',
    category: 'HRTech',
    tagline: 'Attendance, payroll and HR across sites',
    role: 'Primary engineer',
    accent: '#F59E0B',
    liveUrl: 'https://hr.futureandfortune.in/',
    duration: 'Aug 2026 – present',
    teamSize: null,
    status: 'Production',
  },
  radioque: {
    monogram: 'RQ',
    category: 'HealthTech',
    tagline: 'Multi-centre teleradiology platform',
    role: 'Primary engineer',
    accent: '#6366F1',
    liveUrl: null,
    duration: 'Jan 2026 – present',
    teamSize: null,
    status: 'In Progress',
  },
  'aura-tech-platform': {
    monogram: 'AT',
    category: 'Commerce',
    tagline: 'Laptop rental, sales and buyback',
    role: 'Primary engineer',
    accent: '#A855F7',
    liveUrl: 'https://auratechservices.in',
    duration: 'Jan 2025 – present',
    teamSize: null,
    status: 'Production',
  },
  'bhagwati-group-website': {
    monogram: 'BG',
    category: 'Website + CMS',
    tagline: 'Company website with a CMS and admin',
    role: 'Primary engineer',
    accent: '#EC4899',
    liveUrl: null,
    duration: 'Jun 2026 – present',
    teamSize: null,
    status: 'In Progress',
  },
  stopsearch: {
    monogram: 'SS',
    category: 'Hiring Platform',
    tagline: '3-role hiring marketplace',
    role: 'Software Engineer',
    accent: '#38BDF8',
    liveUrl: 'https://stopsearch.co',
    duration: null,
    teamSize: null,
    status: 'Production',
  },
};

/**
 * Section-level proof metrics shown in the showcase intro column.
 * Edit here to retune the framing numbers; rendered verbatim, never derived.
 */
export interface ShowcaseMetric {
  value: string;
  label: string;
  /** Icon key resolved by the section to an inline glyph. */
  icon: 'systems' | 'industries' | 'users';
}

export const SHOWCASE_METRICS: ShowcaseMetric[] = [
  { value: '5', label: 'Production Platforms', icon: 'systems' },
  { value: '5+', label: 'Client Businesses', icon: 'users' },
  { value: '62K+', label: 'Webhook Events (BVisionr)', icon: 'industries' },
];

/** Neutral fallback accent — soft violet. */
const FALLBACK_ACCENT = '#8B5CF6';

/** Maximum technologies surfaced in the featured panel. */
export const MAX_TECH = 7;

/**
 * Build a 2-character monogram from a project title.
 * - Multi-word: initials of the first two words ("Aura Tech" → "AT").
 * - Single word: first two letters ("Radioque" → "RA").
 */
export function deriveMonogram(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '··';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Resolve a possibly-placeholder string field to a real string or null. */
function resolveText(value: string | Placeholder<string>): string | null {
  if (isPlaceholder(value)) return null;
  return value;
}

/**
 * Merge content (`ProjectEntry`) with presentation metadata into the
 * `DockProject` view model the showcase renders. Pure and deterministic.
 */
export function toDockProject(project: ProjectEntry): DockProject {
  const p = PRESENTATION[project.slug] ?? {};
  const status: ProjectStatus =
    p.status ?? (project.status === 'published' ? 'Production' : 'In Progress');

  return {
    id: project.slug,
    name: project.title,
    monogram: p.monogram ?? deriveMonogram(project.title),
    category: p.category ?? (project.tags[0] ?? 'Engineering'),
    tagline: p.tagline ?? p.category ?? (project.tags[0] ?? 'Engineering'),
    accent: p.accent ?? FALLBACK_ACCENT,
    role: p.role ?? resolveText(project.role),
    duration: p.duration ?? null,
    teamSize: p.teamSize ?? null,
    status,
    description: resolveText(project.summary),
    coverImage: project.thumbnail,
    tech: project.primaryTech.slice(0, MAX_TECH),
    liveUrl: p.liveUrl ?? project.liveUrl ?? null,
    caseStudyUrl:
      project.caseStudySlug !== null
        ? `/case-studies/${project.caseStudySlug}`
        : null,
  };
}
