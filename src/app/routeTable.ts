import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Canonical route table — single source of truth for all application routes.
 *
 * Consumed by:
 * - App.tsx (register routes with React Router)
 * - scripts/generate-sitemap.mjs (emit sitemap.xml)
 * - RouteSEO (per-route metadata lookup)
 * - Tests (enumerate all routes for property tests)
 */

/** SEO keys used to look up per-route metadata in seoConfig */
export type SeoKey =
  | 'home'
  | 'projects'
  | 'architectureIndex'
  | 'architectureTopic'
  | 'caseStudiesIndex'
  | 'caseStudy'
  | 'writingIndex'
  | 'article'
  | 'notFound';

export interface RouteEntry {
  /** URL path pattern (react-router-dom v6 syntax) */
  path: string;
  /** Unique identifier for this route */
  key: string;
  /** Lazy-loaded route component factory */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: LazyExoticComponent<ComponentType<any>>;
  /** Key into the SEO config map */
  seoKey: SeoKey;
}

export const routeTable: readonly RouteEntry[] = [
  {
    path: '/',
    key: 'home',
    component: lazy(() => import('../routes/HomePage')),
    seoKey: 'home',
  },
  {
    path: '/projects',
    key: 'projects',
    component: lazy(() => import('../routes/ProjectsIndexPage')),
    seoKey: 'projects',
  },
  {
    path: '/architecture',
    key: 'architectureIndex',
    component: lazy(() => import('../routes/ArchitectureIndexPage')),
    seoKey: 'architectureIndex',
  },
  {
    path: '/architecture/:slug',
    key: 'architectureTopic',
    component: lazy(() => import('../routes/ArchitectureTopicPage')),
    seoKey: 'architectureTopic',
  },
  {
    path: '/case-studies',
    key: 'caseStudiesIndex',
    component: lazy(() => import('../routes/CaseStudyIndexPage')),
    seoKey: 'caseStudiesIndex',
  },
  {
    path: '/case-studies/:slug',
    key: 'caseStudy',
    component: lazy(() => import('../routes/CaseStudyPage')),
    seoKey: 'caseStudy',
  },
  {
    path: '/writing',
    key: 'writingIndex',
    component: lazy(() => import('../routes/WritingIndexPage')),
    seoKey: 'writingIndex',
  },
  {
    path: '/writing/:slug',
    key: 'article',
    component: lazy(() => import('../routes/ArticlePage')),
    seoKey: 'article',
  },
  {
    path: '*',
    key: 'notFound',
    component: lazy(() => import('../routes/NotFoundPage')),
    seoKey: 'notFound',
  },
] as const;
