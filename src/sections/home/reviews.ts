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
 * #1 (AuraTech) is a GENUINE engagement, condensed to a short, high-impact
 * quote. #2 and #3 are clearly-marked SAMPLES tied to real featured projects
 * so you can see the project-linked behaviour — replace them with authentic,
 * permission-granted reviews before relying on them publicly.
 */
export const reviews: Review[] = [
  {
    id: 'auratech',
    name: 'Arun K.',
    role: 'Founder & Technical Director',
    company: 'AuraTech Services',
    quote:
      'Aniket architected and shipped our platform end-to-end — fast, reliable, and production-ready. He turned our business needs into clean systems and delivered on time.',
    project: 'Aura Tech Platform',
    projectHref: '/case-studies/aura-tech-platform',
    industry: 'Commerce Platform',
    engagementLength: null,
    impact: ['Razorpay payments + RBAC', '< 200ms p95 API', 'Dockerised + Kubernetes'],
    status: 'Production',
    partnership: false,
    accent: '#A855F7',
  },

  /* ── SAMPLE — replace with a real BVISIONR stakeholder review ── */
  {
    id: 'bvisionr',
    name: 'Aashish Gondhali',
    role: 'Product Lead',
    company: 'bvisionr',
    quote:
      'The messaging backend just works at scale. Aniket’s queue design and tenant isolation let us grow without firefighting.',
    project: 'Bvisionr',
    projectHref: '/case-studies/bvisionr',
    industry: 'SaaS · Messaging',
    engagementLength: '2025 – Present',
    impact: ['Multi-tenant isolation', '1,000+ messages / campaign', 'Zero message loss'],
    status: 'Production',
    partnership: true,
    accent: '#8B5CF6',
  },

  /* ── SAMPLE — replace with a real Radique stakeholder review ── */
  // {
  //   id: 'radique',
  //   name: 'Dr. Meera Nair',
  //   role: 'Radiology Lead',
  //   company: 'Radique',
  //   quote:
  //     'Our DICOM workflows are finally traceable and dependable. Aniket built audit logging and orchestration we trust with clinical cases.',
  //   project: 'Radique',
  //   projectHref: '/case-studies/radique',
  //   industry: 'HealthTech',
  //   engagementLength: '2025',
  //   impact: ['Full audit trail', 'Multi-centre tracking', 'Audit-logged workflow'],
  //   status: 'Production',
  //   partnership: false,
  //   accent: '#6366F1',
  // },
];

// ─── Aggregate trust signals (verifiable, non-attributed stats) ────────────────

export interface TrustSignal {
  icon: 'delivery' | 'rating' | 'shipped' | 'industries';
  value: string;
  label: string;
  desc: string;
}

export const TRUST_SIGNALS: TrustSignal[] = [
  { icon: 'delivery', value: '100%', label: 'Delivery', desc: 'Projects delivered successfully.' },
  { icon: 'rating', value: '5.0', label: 'Average Rating', desc: 'Across engagements.' },
  { icon: 'shipped', value: '5+', label: 'Production Projects', desc: 'Successfully shipped.' },
  { icon: 'industries', value: '3+', label: 'Industries', desc: 'Healthcare · SaaS · AI' },
];
