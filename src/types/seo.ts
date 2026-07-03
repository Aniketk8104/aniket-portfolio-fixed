/**
 * SEO type definitions for per-route metadata.
 *
 * Consumed by:
 * - src/app/SEO/seoConfig.ts  (config values)
 * - src/app/SEO/RouteSEO.tsx  (Helmet rendering)
 */

/** Open Graph metadata for a route */
export interface OgMeta {
  title: string;
  description: string;
  /** Fully-qualified URL, e.g. "https://example.com/og-image.png" */
  image?: string;
  type?: 'website' | 'article' | 'profile';
  url?: string;
}

/** Twitter Card metadata for a route */
export interface TwitterMeta {
  card: 'summary' | 'summary_large_image';
  title: string;
  description: string;
  image?: string;
  /** Twitter handle, e.g. "@handle" */
  site?: string;
}

/**
 * Structured data payload.
 * The value must be a valid JSON-LD object (typed as a plain record so callers
 * can pass any schema.org type without importing a heavy dependency).
 *
 * An array may be passed to emit multiple JSON-LD <script> blocks on a single
 * route (e.g. Person + Article on /writing/:slug).
 */
export type StructuredData = Record<string, unknown> | Record<string, unknown>[];

/** Full SEO config for a single route */
export interface RouteSeoConfig {
  title: string;
  description: string;
  /** Absolute canonical URL for the route */
  canonical: string;
  og: OgMeta;
  twitter: TwitterMeta;
  /** Optional JSON-LD structured data; rendered as application/ld+json */
  structuredData?: StructuredData;
}

/** Map keyed by SeoKey (matches routeTable.ts) */
export type SeoConfigMap = Record<string, RouteSeoConfig>;

/** Props accepted by RouteSEO component */
export interface RouteSEOProps {
  /** Must match a key in seoConfig */
  routeKey: string;
  /** Field-level overrides — merged shallowly onto the config entry */
  overrides?: Partial<RouteSeoConfig>;
}
