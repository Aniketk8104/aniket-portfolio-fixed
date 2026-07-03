import { routeTable, type RouteEntry } from '../app/routeTable';

/**
 * Human-friendly route labels paired with canonical route table entries.
 *
 * Used by navigation components (Navbar, Footer) and any UI that needs
 * to display route names alongside their paths.
 */

export interface LabelledRoute {
  /** Display label for navigation and UI */
  label: string;
  /** Reference to the canonical route entry */
  route: RouteEntry;
}

/** Lookup a route entry by its unique key */
function findRoute(key: string): RouteEntry {
  const entry = routeTable.find((r) => r.key === key);
  if (!entry) {
    throw new Error(`Route with key "${key}" not found in routeTable`);
  }
  return entry;
}

/** All labelled routes for use in navigation and UI */
export const labelledRoutes: readonly LabelledRoute[] = [
  { label: 'Home', route: findRoute('home') },
  { label: 'Projects', route: findRoute('projects') },
  { label: 'Architecture', route: findRoute('architectureIndex') },
  { label: 'Case Studies', route: findRoute('caseStudiesIndex') },
  { label: 'Writing', route: findRoute('writingIndex') },
] as const;

/** Primary navigation routes (excludes detail/slug routes and 404) */
export const primaryNavRoutes: readonly LabelledRoute[] = labelledRoutes;

/** All routes including detail pages — useful for sitemap generation */
export const allLabelledRoutes: readonly LabelledRoute[] = [
  { label: 'Home', route: findRoute('home') },
  { label: 'Projects', route: findRoute('projects') },
  { label: 'Architecture', route: findRoute('architectureIndex') },
  { label: 'Architecture Topic', route: findRoute('architectureTopic') },
  { label: 'Case Studies', route: findRoute('caseStudiesIndex') },
  { label: 'Case Study', route: findRoute('caseStudy') },
  { label: 'Writing', route: findRoute('writingIndex') },
  { label: 'Article', route: findRoute('article') },
  { label: 'Not Found', route: findRoute('notFound') },
] as const;
