/**
 * Property 18: Per-Route SEO Metadata
 *
 * **Validates: Requirements 14.1**
 *
 * For every route in `routeTable.ts`, render `<RouteSEO>` inside a
 * `<HelmetProvider context={helmetContext}>` and assert that
 * `helmetContext.helmet` contains:
 *   - title matching `seoConfig[seoKey].title`
 *   - `<meta name="description">` matching `seoConfig[seoKey].description`
 *   - `<link rel="canonical">` matching `seoConfig[seoKey].canonical`
 *   - `<meta property="og:title">` matching `seoConfig[seoKey].og.title`
 *   - `<meta property="og:description">` matching `seoConfig[seoKey].og.description`
 *   - `<meta name="twitter:card">` matching `seoConfig[seoKey].twitter.card`
 *   - `<meta name="twitter:title">` matching `seoConfig[seoKey].twitter.title`
 *   - `<meta name="twitter:description">` matching `seoConfig[seoKey].twitter.description`
 *
 * Strategy:
 *   - Pass a context object to `<HelmetProvider context={ctx}>`. react-helmet-async
 *     v2 captures the rendered Helmet state in `ctx.helmet` synchronously during
 *     render (the SSR rendering path). This avoids all `document.head` DOM
 *     mutation and cross-test bleed, giving clean per-call isolation.
 *   - `ctx.helmet.title.toString()` returns the rendered `<title>` tag HTML;
 *     `ctx.helmet.meta.toComponent()` returns an array of meta React elements
 *     whose props we inspect directly.
 *   - This is the officially recommended approach for testing react-helmet-async.
 *   - fast-check samples indices from the route table; the deterministic
 *     `.each` suite guarantees 100% route coverage.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { HelmetProvider } from 'react-helmet-async';
import type { HelmetServerState } from 'react-helmet-async';

import { routeTable } from '../routeTable';
import { seoConfig } from './seoConfig';
import { RouteSEO } from './RouteSEO';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HelmetContext {
  helmet?: HelmetServerState;
}

// ---------------------------------------------------------------------------
// Core render helper
// ---------------------------------------------------------------------------

/**
 * Render `<RouteSEO>` for the given key inside a `<HelmetProvider>` that
 * captures its output into a plain context object.
 *
 * react-helmet-async v2 fills `ctx.helmet` synchronously during render ONLY
 * when `HelmetProvider.canUseDOM === false` (the SSR code path). In jsdom,
 * `canUseDOM` defaults to `true` and Helmet mutates `document.head` instead.
 *
 * We temporarily set `canUseDOM = false` before each render and restore it
 * after — this forces the SSR context capture path, giving us a clean,
 * isolated `HelmetServerState` to assert against without any DOM mutation or
 * cross-call bleed.
 */
function renderSEO(routeKey: string): HelmetServerState {
  // Force SSR mode so context.helmet is populated synchronously
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HelmetProvider as any).canUseDOM = false;

  const ctx: HelmetContext = {};

  const { unmount } = render(
    <HelmetProvider context={ctx}>
      <RouteSEO routeKey={routeKey} />
    </HelmetProvider>,
  );

  // Read context BEFORE unmount and BEFORE restoring canUseDOM
  const helmetState = ctx.helmet;

  unmount();

  // Restore DOM mode so other tests aren't affected
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HelmetProvider as any).canUseDOM = true;

  if (!helmetState) {
    throw new Error(
      `[perRouteSEO.pbt.test] HelmetProvider did not populate context.helmet for routeKey "${routeKey}". ` +
        'Ensure react-helmet-async v2+ is installed and <HelmetProvider context={ctx}> is used.',
    );
  }

  return helmetState;
}

// ---------------------------------------------------------------------------
// Assertion helpers that work on HelmetServerState
// ---------------------------------------------------------------------------

/**
 * Extract the raw title string from the Helmet state.
 * `helmet.title.toString()` returns the full `<title>…</title>` HTML string.
 * We parse the text content out.
 */
function extractTitle(helmet: HelmetServerState): string {
  // toString() returns something like: <title data-rh="true">My Title</title>
  const html = helmet.title.toString();
  const match = html.match(/<title[^>]*>(.*?)<\/title>/s);
  return match ? match[1] : '';
}

/**
 * Extract the meta tags as an array of attribute maps from the Helmet state.
 * `helmet.meta.toComponent()` returns React elements — we inspect their props.
 */
function extractMetaTags(helmet: HelmetServerState): Record<string, string>[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const components = helmet.meta.toComponent() as unknown as any[];
  if (!Array.isArray(components)) return [];

  return components.map((el) => {
    // Each element is a React element with props like { name, content, property, … }
    const props: Record<string, string> = {};
    if (el && el.props) {
      for (const [k, v] of Object.entries(el.props as Record<string, unknown>)) {
        if (typeof v === 'string') props[k] = v;
      }
    }
    return props;
  });
}

/**
 * Extract link tags as an array of attribute maps.
 */
function extractLinkTags(helmet: HelmetServerState): Record<string, string>[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const components = helmet.link.toComponent() as unknown as any[];
  if (!Array.isArray(components)) return [];

  return components.map((el) => {
    const props: Record<string, string> = {};
    if (el && el.props) {
      for (const [k, v] of Object.entries(el.props as Record<string, unknown>)) {
        if (typeof v === 'string') props[k] = v;
      }
    }
    return props;
  });
}

/**
 * Find a meta tag by a single attribute key=value filter.
 */
function findMeta(
  metas: Record<string, string>[],
  key: string,
  value: string,
): Record<string, string> | undefined {
  return metas.find((m) => m[key] === value);
}

/**
 * Find a link tag by rel value.
 */
function findLink(
  links: Record<string, string>[],
  rel: string,
): Record<string, string> | undefined {
  return links.find((l) => l.rel === rel);
}

// ---------------------------------------------------------------------------
// Ensure DOM is clean between tests
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Core full-assertion helper
// ---------------------------------------------------------------------------

function assertSEOForKey(seoKey: string, label: string): void {
  const config = seoConfig[seoKey];
  if (!config) {
    throw new Error(
      `[perRouteSEO.pbt.test] No seoConfig entry found for seoKey "${seoKey}" (route: ${label})`,
    );
  }

  const helmet = renderSEO(seoKey);
  const metas = extractMetaTags(helmet);
  const links = extractLinkTags(helmet);

  // 1. <title>
  expect(
    extractTitle(helmet),
    `${label} → <title> must match seoConfig.title`,
  ).toBe(config.title);

  // 2. <meta name="description">
  const descMeta = findMeta(metas, 'name', 'description');
  expect(descMeta, `${label} → <meta name="description"> must be present`).toBeDefined();
  expect(
    descMeta?.content,
    `${label} → <meta name="description"> content must match seoConfig.description`,
  ).toBe(config.description);

  // 3. <link rel="canonical">
  const canonicalLink = findLink(links, 'canonical');
  expect(canonicalLink, `${label} → <link rel="canonical"> must be present`).toBeDefined();
  expect(
    canonicalLink?.href,
    `${label} → <link rel="canonical"> href must match seoConfig.canonical`,
  ).toBe(config.canonical);

  // 4. OG title
  const ogTitle = findMeta(metas, 'property', 'og:title');
  expect(ogTitle, `${label} → <meta property="og:title"> must be present`).toBeDefined();
  expect(
    ogTitle?.content,
    `${label} → <meta property="og:title"> content must match seoConfig.og.title`,
  ).toBe(config.og.title);

  // 5. OG description
  const ogDesc = findMeta(metas, 'property', 'og:description');
  expect(ogDesc, `${label} → <meta property="og:description"> must be present`).toBeDefined();
  expect(
    ogDesc?.content,
    `${label} → <meta property="og:description"> content must match seoConfig.og.description`,
  ).toBe(config.og.description);

  // 6. Twitter card
  const twitterCard = findMeta(metas, 'name', 'twitter:card');
  expect(twitterCard, `${label} → <meta name="twitter:card"> must be present`).toBeDefined();
  expect(
    twitterCard?.content,
    `${label} → <meta name="twitter:card"> content must match seoConfig.twitter.card`,
  ).toBe(config.twitter.card);

  // 7. Twitter title
  const twitterTitle = findMeta(metas, 'name', 'twitter:title');
  expect(twitterTitle, `${label} → <meta name="twitter:title"> must be present`).toBeDefined();
  expect(
    twitterTitle?.content,
    `${label} → <meta name="twitter:title"> content must match seoConfig.twitter.title`,
  ).toBe(config.twitter.title);

  // 8. Twitter description
  const twitterDesc = findMeta(metas, 'name', 'twitter:description');
  expect(twitterDesc, `${label} → <meta name="twitter:description"> must be present`).toBeDefined();
  expect(
    twitterDesc?.content,
    `${label} → <meta name="twitter:description"> content must match seoConfig.twitter.description`,
  ).toBe(config.twitter.description);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 18: Per-Route SEO Metadata', () => {
  /**
   * P18-a: Every route in the route table has a corresponding seoConfig entry.
   */
  it('P18-a: every route seoKey resolves to a seoConfig entry', () => {
    for (const entry of routeTable) {
      expect(
        seoConfig[entry.seoKey],
        `Route "${entry.key}" (path: "${entry.path}") seoKey="${entry.seoKey}" not found in seoConfig`,
      ).toBeDefined();
    }
  });

  /**
   * P18-b (PBT): For a randomly sampled route, rendering RouteSEO produces
   * the correct title in the Helmet state.
   */
  it('P18-b (PBT): sampled route → title matches seoConfig', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: routeTable.length - 1 }),
        (index) => {
          const entry = routeTable[index];
          const config = seoConfig[entry.seoKey];
          if (!config) return;

          const helmet = renderSEO(entry.seoKey);
          expect(extractTitle(helmet)).toBe(config.title);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * P18-c (PBT): For a randomly sampled route, rendering RouteSEO produces
   * a `meta[name="description"]` matching seoConfig.
   */
  it('P18-c (PBT): sampled route → meta description matches seoConfig', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: routeTable.length - 1 }),
        (index) => {
          const entry = routeTable[index];
          const config = seoConfig[entry.seoKey];
          if (!config) return;

          const helmet = renderSEO(entry.seoKey);
          const metas = extractMetaTags(helmet);
          const descMeta = findMeta(metas, 'name', 'description');
          expect(descMeta).toBeDefined();
          expect(descMeta?.content).toBe(config.description);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * P18-d (PBT): For a randomly sampled route, rendering RouteSEO produces
   * a canonical link whose href matches seoConfig.
   */
  it('P18-d (PBT): sampled route → canonical href matches seoConfig', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: routeTable.length - 1 }),
        (index) => {
          const entry = routeTable[index];
          const config = seoConfig[entry.seoKey];
          if (!config) return;

          const helmet = renderSEO(entry.seoKey);
          const links = extractLinkTags(helmet);
          const canonicalLink = findLink(links, 'canonical');
          expect(canonicalLink).toBeDefined();
          expect(canonicalLink?.href).toBe(config.canonical);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * P18-e (PBT): For a randomly sampled route, rendering RouteSEO produces
   * OG tags matching seoConfig.
   */
  it('P18-e (PBT): sampled route → OG tags match seoConfig', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: routeTable.length - 1 }),
        (index) => {
          const entry = routeTable[index];
          const config = seoConfig[entry.seoKey];
          if (!config) return;

          const helmet = renderSEO(entry.seoKey);
          const metas = extractMetaTags(helmet);

          const ogTitle = findMeta(metas, 'property', 'og:title');
          expect(ogTitle?.content).toBe(config.og.title);

          const ogDesc = findMeta(metas, 'property', 'og:description');
          expect(ogDesc?.content).toBe(config.og.description);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * P18-f (PBT): For a randomly sampled route, rendering RouteSEO produces
   * Twitter Card tags matching seoConfig.
   */
  it('P18-f (PBT): sampled route → Twitter Card tags match seoConfig', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: routeTable.length - 1 }),
        (index) => {
          const entry = routeTable[index];
          const config = seoConfig[entry.seoKey];
          if (!config) return;

          const helmet = renderSEO(entry.seoKey);
          const metas = extractMetaTags(helmet);

          const twitterCard = findMeta(metas, 'name', 'twitter:card');
          expect(twitterCard?.content).toBe(config.twitter.card);

          const twitterTitle = findMeta(metas, 'name', 'twitter:title');
          expect(twitterTitle?.content).toBe(config.twitter.title);

          const twitterDesc = findMeta(metas, 'name', 'twitter:description');
          expect(twitterDesc?.content).toBe(config.twitter.description);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * P18-g (deterministic): For EVERY route in the table, exercise the full
   * suite of assertions. Failures here unambiguously identify the offending route.
   */
  it.each(
    routeTable.map((entry) => ({
      key: entry.key,
      path: entry.path,
      seoKey: entry.seoKey,
    })),
  )(
    'P18-g: route "$key" (path: "$path") → all SEO tags match seoConfig["$seoKey"]',
    ({ key, path, seoKey }) => {
      assertSEOForKey(seoKey, `route "${key}" (path: "${path}")`);
    },
  );

  /**
   * P18-h: Every rendered RouteSEO emits a non-empty title.
   */
  it('P18-h: every route produces a non-empty title', () => {
    for (const entry of routeTable) {
      const helmet = renderSEO(entry.seoKey);
      expect(
        extractTitle(helmet).trim().length,
        `Route "${entry.key}" must produce a non-empty title`,
      ).toBeGreaterThan(0);
    }
  });

  /**
   * P18-i: Every rendered RouteSEO emits a non-empty canonical href.
   */
  it('P18-i: every route produces a non-empty canonical href', () => {
    for (const entry of routeTable) {
      const helmet = renderSEO(entry.seoKey);
      const links = extractLinkTags(helmet);
      const canonicalLink = findLink(links, 'canonical');
      expect(
        canonicalLink,
        `Route "${entry.key}" must produce a canonical link`,
      ).toBeDefined();
      expect(
        (canonicalLink?.href ?? '').trim().length,
        `Route "${entry.key}" canonical link href must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  /**
   * P18-j: Canonical URLs are absolute (start with https://).
   */
  it('P18-j: every canonical URL is absolute (starts with https://)', () => {
    for (const entry of routeTable) {
      const config = seoConfig[entry.seoKey];
      if (!config) continue;
      expect(
        config.canonical.startsWith('https://'),
        `Route "${entry.key}" canonical "${config.canonical}" must start with https://`,
      ).toBe(true);
    }
  });

  /**
   * P18-k: No SEO config entry contains prohibited strings.
   * Validates Requirement 14.4 at the SEO layer.
   */
  it('P18-k: no seoConfig entry contains prohibited freelance strings', () => {
    const PROHIBITED = ['Freelance MERN', 'MERN Stack Developer', 'Hire MERN'];

    for (const entry of routeTable) {
      const config = seoConfig[entry.seoKey];
      if (!config) continue;

      const serialised = JSON.stringify(config);

      for (const prohibited of PROHIBITED) {
        expect(
          serialised.includes(prohibited),
          `Route "${entry.key}" seoConfig contains prohibited string "${prohibited}"`,
        ).toBe(false);
      }
    }
  });
});
