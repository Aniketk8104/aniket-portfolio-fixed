/**
 * Production Trust — review data (single source of truth).
 *
 * Each review is *evidence attached to real work*: it links to one of the
 * featured projects, carries that project's accent, and surfaces concrete
 * engineering impact rather than generic praise.
 *
 * INTEGRITY NOTE: only add entries here for reviews a real client actually
 * gave (with permission to publish). The section renders 1–3 reviews; the
 * carousel controls appear only when more than one genuine review exists.
 *
 * @module sections/home/reviews
 */

export interface Review {
  id: string;
  /** Reviewer name (e.g. "Arun K."). */
  name: string;
  /** Reviewer role/title. */
  role: string;
  /** Reviewer company. */
  company: string;
  /** Optional avatar image; falls back to initials. */
  avatar?: string;
  /** Editorial quote (~4–5 lines). */
  quote: string;
  /** Related project label. */
  project: string;
  /** Link to the related project / case study. */
  projectHref: string;
  /** Industry/domain label. */
  industry: string;
  /** Engagement length, or null when not disclosed. */
  engagementLength: string | null;
  /** Concrete engineering outcomes (checkmark list). */
  impact: string[];
  /** Lifecycle status shown with a green dot. */
  status: string;
  /** Whether to show the subtle "Long-term Partnership" badge. */
  partnership: boolean;
  /** Project accent (matches the project's identity). */
  accent: string;
}

/**
 * Reviews shown in the Production Trust carousel (max 3).
 *
 * Only quotes from a real person (not a relative or co-founder) who agreed to
 * be published belong here. The section renders nothing while this is empty.
 * Pending: Manisha Rathod's comment on the Oct 19 LinkedIn post, once she
 * approves it.
 */
export const reviews: Review[] = [];

// ─── Aggregate trust signals (verifiable, non-attributed stats) ────────────────

export interface TrustSignal {
  icon: 'delivery' | 'rating' | 'shipped' | 'industries';
  value: string;
  label: string;
  desc: string;
}

export const TRUST_SIGNALS: TrustSignal[] = [
  { icon: 'shipped', value: '5', label: 'Production Platforms', desc: 'As primary engineer at Aura Tech Services.' },
  { icon: 'delivery', value: '5+', label: 'Client Businesses', desc: 'Including Bhagwati Group and a US-based teleradiology company.' },
  { icon: 'industries', value: '62K+', label: 'Webhook Events', desc: 'Handled by BVisionr since May 2026.' },
  { icon: 'rating', value: '82', label: 'Employees on the HRMS', desc: 'Across 25 Bhagwati Group sites.' },
];
