/**
 * RouteSEO — per-route SEO head tags via react-helmet-async.
 *
 * Usage:
 *   <RouteSEO routeKey="home" />
 *   <RouteSEO routeKey="article" overrides={{ title: article.title, canonical: articleUrl }} />
 *
 * The component merges `overrides` shallowly onto the seoConfig entry for the
 * given key, then writes <title>, <meta>, canonical <link>, OG tags, Twitter
 * Card tags, and an optional JSON-LD <script> via react-helmet-async.
 *
 * All Helmet calls are wrapped in a try/catch so a misconfigured entry can
 * never hard-crash the application:
 *   - Development: logs a warning to the console.
 *   - Production: fails silently.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

import { seoConfig } from './seoConfig';
import type { RouteSEOProps, RouteSeoConfig, StructuredData } from '../../types/seo';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isDev = import.meta.env.DEV;

function warnInDev(message: string, error?: unknown): void {
  if (isDev) {
    console.warn(`[RouteSEO] ${message}`, error ?? '');
  }
}

function buildConfig(
  routeKey: string,
  overrides?: Partial<RouteSeoConfig>,
): RouteSeoConfig | null {
  try {
    const base = seoConfig[routeKey];
    if (!base) {
      warnInDev(`No seoConfig entry found for routeKey "${routeKey}".`);
      return null;
    }
    if (!overrides) return base;
    // Shallow merge — deep nested objects (og, twitter, structuredData) from
    // overrides replace the base object entirely when provided.
    return { ...base, ...overrides };
  } catch (err) {
    warnInDev('Failed to build SEO config.', err);
    return null;
  }
}

function serializeStructuredData(data: StructuredData): string | null {
  try {
    return JSON.stringify(data);
  } catch (err) {
    warnInDev('Failed to serialize structuredData JSON-LD.', err);
    return null;
  }
}

/**
 * Normalise the structuredData field to an array so we can render one
 * <script> tag per entry.  This supports emitting multiple JSON-LD payloads
 * on a single route (e.g. Article + Person on /writing/:slug).
 */
function normaliseStructuredData(
  data: StructuredData,
): Record<string, unknown>[] {
  return Array.isArray(data) ? data : [data];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const RouteSEO: React.FC<RouteSEOProps> = ({ routeKey, overrides }) => {
  let helmetContent: React.ReactNode = null;

  try {
    const config = buildConfig(routeKey, overrides);
    if (!config) {
      return null;
    }

    const { title, description, canonical, og, twitter, structuredData } = config;

    // Normalise to an array; each entry becomes one <script type="application/ld+json">.
    const jsonLdBlocks = structuredData
      ? normaliseStructuredData(structuredData)
          .map(serializeStructuredData)
          .filter((s): s is string => s !== null)
      : [];

    helmetContent = (
      <Helmet>
        {/* Basic */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />

        {/* Open Graph */}
        <meta property="og:title" content={og.title} />
        <meta property="og:description" content={og.description} />
        <meta property="og:type" content={og.type ?? 'website'} />
        {og.url && <meta property="og:url" content={og.url} />}
        {og.image && <meta property="og:image" content={og.image} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content={twitter.card} />
        <meta name="twitter:title" content={twitter.title} />
        <meta name="twitter:description" content={twitter.description} />
        {twitter.site && <meta name="twitter:site" content={twitter.site} />}
        {twitter.image && <meta name="twitter:image" content={twitter.image} />}

        {/* JSON-LD structured data — one <script> per entry */}
        {jsonLdBlocks.map((jsonLd, index) => (
          <script key={index} type="application/ld+json">
            {jsonLd}
          </script>
        ))}
      </Helmet>
    );
  } catch (err) {
    warnInDev('Unexpected error while rendering SEO tags.', err);
    return null;
  }

  return <>{helmetContent}</>;
};

export default RouteSEO;
