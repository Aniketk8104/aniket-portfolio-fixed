/**
 * Per-route SEO configuration.
 *
 * Keys mirror the `SeoKey` union in `src/app/routeTable.ts`.
 * Every entry ships `title`, `description`, `canonical`, `og`, `twitter`,
 * and an optional `structuredData` JSON-LD payload.
 *
 * The `canonical` values use the production origin; override them via the
 * `overrides` prop on `<RouteSEO>` when deploying to staging.
 */

import type { SeoConfigMap } from '../../types/seo';
import {
  DEFAULT_OG_IMAGE,
  EMAIL,
  JOB_TITLE,
  PERSON_NAME,
  SAME_AS,
  SITE_NAME,
  SITE_ORIGIN as ORIGIN,
} from '../siteIdentity';

const HOME_TITLE = `${PERSON_NAME} — ${JOB_TITLE}`;
const HOME_DESCRIPTION =
  'Aniket Kushwaha, Backend / Full-Stack Engineer in Navi Mumbai. Primary engineer on 5 production platforms used by 5+ client businesses.';

export const seoConfig: SeoConfigMap = {
  home: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonical: ORIGIN,
    og: {
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      image: DEFAULT_OG_IMAGE,
      type: 'profile',
      url: ORIGIN,
    },
    twitter: {
      card: 'summary_large_image',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      image: DEFAULT_OG_IMAGE,
    },
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${ORIGIN}/#person`,
        name: PERSON_NAME,
        url: ORIGIN,
        image: DEFAULT_OG_IMAGE,
        jobTitle: JOB_TITLE,
        description: HOME_DESCRIPTION,
        email: `mailto:${EMAIL}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Navi Mumbai',
          addressRegion: 'Maharashtra',
          addressCountry: 'IN',
        },
        worksFor: { '@type': 'Organization', name: 'Aura Tech Services', url: 'https://auratechservices.in' },
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'CKT ACS College, New Panvel',
        },
        knowsAbout: [
          'Backend engineering',
          'Full-stack development',
          'Multi-tenant SaaS',
          'Node.js',
          'TypeScript',
          'PostgreSQL',
          'MongoDB',
          'Redis',
          'BullMQ',
          'Next.js',
          'React',
          'Docker',
          'WhatsApp Cloud API',
          'DICOM',
        ],
        sameAs: [...SAME_AS],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${ORIGIN}/#website`,
        name: SITE_NAME,
        url: ORIGIN,
        inLanguage: 'en',
        author: { '@id': `${ORIGIN}/#person` },
      },
    ],
  },

  projects: {
    title: 'Projects — Aniket Kushwaha',
    description:
      'A curated set of engineering projects covering distributed systems, AI automation, SaaS platforms, and real-time infrastructure.',
    canonical: `${ORIGIN}/projects`,
    og: {
      title: 'Projects — Aniket Kushwaha',
      description:
        'A curated set of engineering projects covering distributed systems, AI automation, SaaS platforms, and real-time infrastructure.',
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      url: `${ORIGIN}/projects`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Projects — Aniket Kushwaha',
      description:
        'A curated set of engineering projects covering distributed systems, AI automation, SaaS platforms, and real-time infrastructure.',
      image: DEFAULT_OG_IMAGE,
    },
  },

  architectureIndex: {
    title: 'Architecture — Aniket Kushwaha',
    description:
      'Custom diagrams and engineering write-ups on distributed messaging, AI routing, multi-tenant SaaS, and more.',
    canonical: `${ORIGIN}/architecture`,
    og: {
      title: 'Architecture — Aniket Kushwaha',
      description:
        'Custom diagrams and engineering write-ups on distributed messaging, AI routing, multi-tenant SaaS, and more.',
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      url: `${ORIGIN}/architecture`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Architecture — Aniket Kushwaha',
      description:
        'Custom diagrams and engineering write-ups on distributed messaging, AI routing, multi-tenant SaaS, and more.',
      image: DEFAULT_OG_IMAGE,
    },
  },

  architectureTopic: {
    title: 'Architecture Topic — Aniket Kushwaha',
    description:
      'An in-depth look at a system architecture topic — diagrams and annotated engineering decision notes.',
    canonical: `${ORIGIN}/architecture`,
    og: {
      title: 'Architecture Topic — Aniket Kushwaha',
      description:
        'An in-depth look at a system architecture topic — diagrams and annotated engineering decision notes.',
      image: DEFAULT_OG_IMAGE,
      type: 'article',
      url: `${ORIGIN}/architecture`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Architecture Topic — Aniket Kushwaha',
      description:
        'An in-depth look at a system architecture topic — diagrams and annotated engineering decision notes.',
      image: DEFAULT_OG_IMAGE,
    },
  },

  caseStudiesIndex: {
    title: 'Case Studies — Aniket Kushwaha',
    description:
      'Engineering case studies covering context, problem, constraints, architecture decisions, tradeoffs, and measurable outcomes.',
    canonical: `${ORIGIN}/case-studies`,
    og: {
      title: 'Case Studies — Aniket Kushwaha',
      description:
        'Engineering case studies covering context, problem, constraints, architecture decisions, tradeoffs, and measurable outcomes.',
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      url: `${ORIGIN}/case-studies`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Case Studies — Aniket Kushwaha',
      description:
        'Engineering case studies covering context, problem, constraints, architecture decisions, tradeoffs, and measurable outcomes.',
      image: DEFAULT_OG_IMAGE,
    },
  },

  caseStudy: {
    title: 'Case Study — Aniket Kushwaha',
    description:
      'A detailed engineering case study — context, problem definition, architecture decisions, tradeoffs, and outcomes.',
    canonical: `${ORIGIN}/case-studies`,
    og: {
      title: 'Case Study — Aniket Kushwaha',
      description:
        'A detailed engineering case study — context, problem definition, architecture decisions, tradeoffs, and outcomes.',
      image: DEFAULT_OG_IMAGE,
      type: 'article',
      url: `${ORIGIN}/case-studies`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Case Study — Aniket Kushwaha',
      description:
        'A detailed engineering case study — context, problem definition, architecture decisions, tradeoffs, and outcomes.',
      image: DEFAULT_OG_IMAGE,
    },
  },

  writingIndex: {
    title: 'Writing — Aniket Kushwaha',
    description:
      'Engineering essays on distributed systems, AI automation, SaaS patterns, event-driven architecture, and more.',
    canonical: `${ORIGIN}/writing`,
    og: {
      title: 'Writing — Aniket Kushwaha',
      description:
        'Engineering essays on distributed systems, AI automation, SaaS patterns, event-driven architecture, and more.',
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      url: `${ORIGIN}/writing`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Writing — Aniket Kushwaha',
      description:
        'Engineering essays on distributed systems, AI automation, SaaS patterns, event-driven architecture, and more.',
      image: DEFAULT_OG_IMAGE,
    },
  },

  article: {
    title: 'Article — Aniket Kushwaha',
    description: 'An engineering essay by Aniket Kushwaha.',
    canonical: `${ORIGIN}/writing`,
    og: {
      title: 'Article — Aniket Kushwaha',
      description: 'An engineering essay by Aniket Kushwaha.',
      image: DEFAULT_OG_IMAGE,
      type: 'article',
      url: `${ORIGIN}/writing`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Article — Aniket Kushwaha',
      description: 'An engineering essay by Aniket Kushwaha.',
      image: DEFAULT_OG_IMAGE,
    },
    /**
     * Article JSON-LD template. Per-article pages override `structuredData`
     * via the `overrides` prop on <RouteSEO> to inject the correct `headline`
     * and `url`. The `author` block mirrors the `Person` payload on home.
     */
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Article — Aniket Kushwaha',
      url: `${ORIGIN}/writing`,
      author: {
        '@type': 'Person',
        name: 'Aniket Kushwaha',
        url: ORIGIN,
      },
    },
  },

  notFound: {
    title: '404 — Page Not Found · Aniket Kushwaha',
    description: 'The page you are looking for does not exist.',
    canonical: ORIGIN,
    og: {
      title: '404 — Page Not Found · Aniket Kushwaha',
      description: 'The page you are looking for does not exist.',
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      url: ORIGIN,
    },
    twitter: {
      card: 'summary',
      title: '404 — Page Not Found · Aniket Kushwaha',
      description: 'The page you are looking for does not exist.',
    },
  },
} satisfies SeoConfigMap;
