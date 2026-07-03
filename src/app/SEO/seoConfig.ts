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

const ORIGIN = 'https://aniketkushwaha.dev';
const DEFAULT_OG_IMAGE = `${ORIGIN}/favicon-512.png`;
const TWITTER_HANDLE = '@aniketkushwaha';

export const seoConfig: SeoConfigMap = {
  home: {
    title: 'Aniket Kushwaha — Software Engineer · Backend · Platform · AI Automation',
    description:
      'Engineering portfolio of Aniket Kushwaha — Software Engineer specialising in backend systems, platform engineering, and AI automation.',
    canonical: ORIGIN,
    og: {
      title: 'Aniket Kushwaha — Software Engineer · Backend · Platform · AI Automation',
      description:
        'Engineering portfolio of Aniket Kushwaha — Software Engineer specialising in backend systems, platform engineering, and AI automation.',
      image: DEFAULT_OG_IMAGE,
      type: 'profile',
      url: ORIGIN,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Aniket Kushwaha — Software Engineer · Backend · Platform · AI Automation',
      description:
        'Engineering portfolio of Aniket Kushwaha — Software Engineer specialising in backend systems, platform engineering, and AI automation.',
      image: DEFAULT_OG_IMAGE,
      site: TWITTER_HANDLE,
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Aniket Kushwaha',
      url: ORIGIN,
      jobTitle: [
        'Software Engineer',
        'Backend Engineer',
        'Platform Engineer',
        'AI Automation Builder',
      ],
      sameAs: [
        'https://github.com/aniketkushwaha',
        'https://linkedin.com/in/aniketkushwaha',
      ],
    },
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
      site: TWITTER_HANDLE,
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
      site: TWITTER_HANDLE,
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
      site: TWITTER_HANDLE,
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
      site: TWITTER_HANDLE,
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
      site: TWITTER_HANDLE,
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
      site: TWITTER_HANDLE,
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
      site: TWITTER_HANDLE,
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
      site: TWITTER_HANDLE,
    },
  },
} satisfies SeoConfigMap;
