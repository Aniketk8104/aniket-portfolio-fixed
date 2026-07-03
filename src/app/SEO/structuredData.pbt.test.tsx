/**
 * Property 19: Structured Data Type
 *
 * **Validates: Requirements 14.2**
 *
 * - On `/`, the emitted JSON-LD parses to `"@type": "Person"`.
 * - On `/writing/:slug`, an `"@type": "Article"` block has `headline` and
 *   `url` matching the article entry.
 *
 * Testing strategy
 * ─────────────────
 * `react-helmet-async` writes `<script type="application/ld+json">` tags into
 * `document.head` when rendered inside a `HelmetProvider`.  Because Vitest
 * runs in jsdom (a real DOM), we can query `document.head` after rendering
 * (while the component is still mounted) to find those script tags and parse
 * their JSON payload.
 *
 * `ArticlePage` uses `useParams` from `react-router-dom`, so every render is
 * wrapped in `MemoryRouter` with the correct initial entry.
 *
 * The property-based layer (fast-check) samples article slugs from the
 * canonical `articles` array to cover all seven Writing Topics.
 *
 * @vitest-environment jsdom
 */

import React, { Suspense } from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as fc from 'fast-check';

// ── Mocks ────────────────────────────────────────────────────────────────────
// Stub framer-motion so jsdom doesn't choke on animation rendering.
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  const React = await import('react');

  const makePassthrough =
    (tag: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ children, ...props }: any) => {
      const {
        variants: _v, initial: _i, animate: _a, exit: _e, transition: _t,
        whileHover: _wh, whileTap: _wt, whileFocus: _wf, whileInView: _wiv,
        viewport: _vp,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...domProps
      } = props;
      return React.createElement(tag, domProps, children);
    };

  const animatedProxy = new Proxy(
    {},
    { get: (_target, prop: string) => makePassthrough(prop) },
  );

  return {
    ...actual,
    m: animatedProxy,
    motion: animatedProxy,
    LazyMotion: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    domAnimation: {},
  };
});

// Stub motionVariants to prevent matchMedia errors in jsdom
vi.mock('../../design-system/motionVariants', () => ({
  fadeIn:  { hidden: { opacity: 1 },        visible: { opacity: 1 } },
  fadeUp:  { hidden: { opacity: 1, y: 0 },  visible: { opacity: 1, y: 0 } },
  scaleIn: { hidden: { opacity: 1, scale: 1 }, visible: { opacity: 1, scale: 1 } },
}));

// ── Browser API stubs ────────────────────────────────────────────────────────
beforeAll(() => {
  if (typeof window.matchMedia === 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  if (typeof window.IntersectionObserver === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (typeof window.ResizeObserver === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // Inject CSS tokens so token-consuming components don't break
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --color-background: #0a0a0f;
      --color-surface: #12121a;
      --color-surface-elevated: #1a1a28;
      --color-border: #2a2a40;
      --color-text-primary: #f0f0ff;
      --color-text-secondary: #a0a0c0;
      --color-text-muted: #606080;
      --color-accent-primary: #6366f1;
      --color-accent-secondary: #8b5cf6;
      --color-success: #10b981;
      --color-warning: #f59e0b;
      --color-danger: #ef4444;
      --font-sans: Inter, system-ui, sans-serif;
      --font-mono: "JetBrains Mono", monospace;
      --font-size-display: 4rem;
      --font-size-h1: 2.5rem;
      --font-size-h2: 2rem;
      --font-size-h3: 1.5rem;
      --font-size-h4: 1.25rem;
      --font-size-body: 1rem;
      --font-size-caption: 0.875rem;
      --line-height-display: 1.1;
      --line-height-h1: 1.2;
      --line-height-h2: 1.3;
      --line-height-h3: 1.4;
      --line-height-h4: 1.4;
      --line-height-body: 1.6;
      --line-height-caption: 1.5;
      --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
      --space-5: 20px; --space-6: 24px; --space-8: 32px;
      --space-12: 48px; --space-16: 64px; --space-24: 96px;
      --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px;
      --radius-xl: 24px; --radius-full: 9999px;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
      --shadow-lg: 0 12px 32px rgba(0,0,0,0.5);
      --glass-surface: rgba(18,18,26,0.8);
      --duration-instant: 80ms; --duration-fast: 150ms;
      --duration-base: 240ms; --duration-slow: 400ms; --duration-page: 600ms;
      --ease-standard: cubic-bezier(0.2, 0, 0, 1);
      --ease-emphasized: cubic-bezier(0.2, 0, 0, 1.2);
      --ease-exit: cubic-bezier(0.4, 0, 1, 1);
      --distance-sm: 4px; --distance-md: 8px; --distance-lg: 12px;
    }
  `;
  document.head.appendChild(style);
});

afterEach(() => {
  // Remove any JSON-LD script tags injected by Helmet between tests so they
  // don't bleed through.
  document
    .head
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((el) => el.remove());
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Collect all JSON-LD payloads from `document.head` and parse them.
 * Returns an array of parsed objects (one per `<script type="application/ld+json">` tag).
 */
function getHeadJsonLdBlocks(): Record<string, unknown>[] {
  const scripts = document.head.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  const result: Record<string, unknown>[] = [];
  scripts.forEach((el) => {
    try {
      result.push(JSON.parse(el.textContent ?? ''));
    } catch {
      // ignore malformed blocks
    }
  });
  return result;
}

// ── Imports ───────────────────────────────────────────────────────────────────
// Import eagerly (bypassing React.lazy) so Suspense resolves synchronously.
// @ts-ignore — default export
import HomePageDefault from '../../routes/HomePage';
// @ts-ignore
import ArticlePageDefault from '../../routes/ArticlePage';

import { articles } from '../../content/articles';

// ── Mount helpers ─────────────────────────────────────────────────────────────

/**
 * Render the component tree and wait until HelmetProvider flushes JSON-LD
 * script tags to `document.head`.  Returns both the parsed blocks and an
 * unmount function so the caller controls teardown.
 *
 * The blocks are read BEFORE unmounting because react-helmet-async cleans up
 * its tags when the provider unmounts.
 */
async function renderAndGetJsonLd(
  element: React.ReactElement,
): Promise<{ blocks: Record<string, unknown>[]; unmount: () => void }> {
  const result = render(element);

  // Wait until at least one JSON-LD block appears in document.head
  await waitFor(
    () => {
      const blocks = getHeadJsonLdBlocks();
      expect(blocks.length).toBeGreaterThan(0);
    },
    { timeout: 5000 },
  );

  // Snapshot the blocks BEFORE unmounting (unmount removes the script tags)
  const blocks = getHeadJsonLdBlocks();

  result.unmount();

  return { blocks, unmount: result.unmount };
}

/**
 * Build the React tree for the home page (`/`).
 */
function buildHomeTree(): React.ReactElement {
  return (
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<div />}>
                <HomePageDefault />
              </Suspense>
            }
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

/**
 * Build the React tree for an article page (`/writing/:slug`).
 */
function buildArticleTree(slug: string): React.ReactElement {
  const path = `/writing/${slug}`;
  return (
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/writing/:slug"
            element={
              <Suspense fallback={<div />}>
                <ArticlePageDefault />
              </Suspense>
            }
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 19: Structured Data Type', () => {
  // ── P19-a: Home page emits a Person JSON-LD block ─────────────────────────

  /**
   * P19-a (deterministic): On `/`, document.head contains a
   * `<script type="application/ld+json">` block whose `@type` is `"Person"`.
   */
  it('P19-a: / emits a JSON-LD block with @type "Person"', async () => {
    const { blocks } = await renderAndGetJsonLd(buildHomeTree());

    expect(blocks.length, '/ must emit ≥1 JSON-LD block').toBeGreaterThan(0);

    const personBlock = blocks.find((b) => b['@type'] === 'Person');
    expect(
      personBlock,
      `document.head must contain a JSON-LD block with "@type": "Person". Found blocks: ${JSON.stringify(blocks)}`,
    ).toBeDefined();
  });

  // ── P19-b: Home page Person block has required schema.org fields ──────────

  /**
   * P19-b: The Person JSON-LD on `/` includes `@context`, `name`, and `url`.
   */
  it('P19-b: / Person block includes @context, name, and url', async () => {
    const { blocks } = await renderAndGetJsonLd(buildHomeTree());

    const personBlock = blocks.find((b) => b['@type'] === 'Person');
    expect(personBlock).toBeDefined();

    expect(personBlock!['@context']).toBe('https://schema.org');
    expect(typeof personBlock!['name']).toBe('string');
    expect((personBlock!['name'] as string).length).toBeGreaterThan(0);
    expect(typeof personBlock!['url']).toBe('string');
    expect((personBlock!['url'] as string).startsWith('https://')).toBe(true);
  });

  // ── P19-c: Article pages emit an Article JSON-LD block ────────────────────

  /**
   * P19-c (deterministic): For each article slug, `/writing/:slug` emits a
   * JSON-LD block with `@type: "Article"` whose `headline` equals the article
   * title and whose `url` contains the slug.
   */
  it.each(articles)(
    'P19-c: /writing/$slug emits Article JSON-LD with matching headline and url',
    async ({ slug, title }) => {
      const { blocks } = await renderAndGetJsonLd(buildArticleTree(slug));

      expect(
        blocks.length,
        `/writing/${slug} must emit ≥1 JSON-LD block`,
      ).toBeGreaterThan(0);

      const articleBlock = blocks.find((b) => b['@type'] === 'Article');
      expect(
        articleBlock,
        `/writing/${slug} must emit a JSON-LD block with "@type": "Article". Found: ${JSON.stringify(blocks)}`,
      ).toBeDefined();

      // headline matches the article title
      expect(
        articleBlock!['headline'],
        `headline must match the article title for slug "${slug}"`,
      ).toBe(title);

      // url contains the slug
      expect(typeof articleBlock!['url']).toBe('string');
      expect(
        (articleBlock!['url'] as string).includes(slug),
        `url must contain the slug "${slug}"; got "${articleBlock!['url']}"`,
      ).toBe(true);
    },
  );

  // ── P19-d: Article JSON-LD has valid url format ───────────────────────────

  /**
   * P19-d: Every article's JSON-LD url is a fully-qualified HTTPS URL.
   */
  it.each(articles)(
    'P19-d: /writing/$slug — Article JSON-LD url is a fully-qualified HTTPS URL',
    async ({ slug }) => {
      const { blocks } = await renderAndGetJsonLd(buildArticleTree(slug));

      const articleBlock = blocks.find((b) => b['@type'] === 'Article');
      expect(articleBlock).toBeDefined();

      const url = articleBlock!['url'] as string;
      expect(url.startsWith('https://'), `url must start with https:// for slug "${slug}"`).toBe(true);
      expect(url.endsWith(slug), `url must end with the slug "${slug}"`).toBe(true);
    },
  );

  // ── P19-e: Property-based — sampled article slugs emit Article JSON-LD ────

  /**
   * P19-e (PBT): For any article sampled from the canonical `articles` array,
   * `/writing/:slug` emits an Article JSON-LD block whose `headline` and `url`
   * match the entry.
   *
   * fast-check samples article entries; numRuns > articles.length ensures
   * every entry is covered multiple times.
   */
  it('P19-e: PBT — for any sampled article, /writing/:slug emits Article JSON-LD with matching headline and url', async () => {
    const articleArb = fc.constantFrom(...articles);

    await fc.assert(
      fc.asyncProperty(articleArb, async ({ slug, title }) => {
        const { blocks } = await renderAndGetJsonLd(buildArticleTree(slug));

        // Must have ≥1 JSON-LD block
        expect(blocks.length).toBeGreaterThan(0);

        // Must have an Article block
        const articleBlock = blocks.find((b) => b['@type'] === 'Article');
        expect(
          articleBlock,
          `No Article block found for slug "${slug}". Blocks: ${JSON.stringify(blocks)}`,
        ).toBeDefined();

        // headline must match title
        expect(articleBlock!['headline']).toBe(title);

        // url must contain slug
        expect(typeof articleBlock!['url']).toBe('string');
        expect((articleBlock!['url'] as string).includes(slug)).toBe(true);
      }),
      { numRuns: Math.max(articles.length * 3, 21) },
    );
  });

  // ── P19-f: Article JSON-LD has author block ───────────────────────────────

  /**
   * P19-f: The Article JSON-LD block on any article page includes an `author`
   * sub-object with `@type: "Person"`.
   */
  it('P19-f: PBT — Article JSON-LD author block has @type "Person"', async () => {
    const articleArb = fc.constantFrom(...articles);

    await fc.assert(
      fc.asyncProperty(articleArb, async ({ slug }) => {
        const { blocks } = await renderAndGetJsonLd(buildArticleTree(slug));

        const articleBlock = blocks.find((b) => b['@type'] === 'Article');
        expect(articleBlock).toBeDefined();

        const author = articleBlock!['author'] as Record<string, unknown> | undefined;
        expect(
          author,
          `Article block for "${slug}" must have an author field`,
        ).toBeDefined();
        expect(author!['@type']).toBe('Person');
      }),
      { numRuns: Math.max(articles.length * 2, 14) },
    );
  });

  // ── P19-g: Home page does NOT emit Article type ───────────────────────────

  /**
   * P19-g: On `/`, no JSON-LD block has `@type: "Article"`.
   * The home page is a Person page, not an article page.
   */
  it('P19-g: / does not emit an Article JSON-LD block', async () => {
    const { blocks } = await renderAndGetJsonLd(buildHomeTree());

    const articleBlock = blocks.find((b) => b['@type'] === 'Article');
    expect(
      articleBlock,
      `/ must NOT emit an Article JSON-LD block but found: ${JSON.stringify(articleBlock)}`,
    ).toBeUndefined();
  });
});
