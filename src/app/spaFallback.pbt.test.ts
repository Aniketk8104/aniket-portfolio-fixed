/**
 * Property 21: SPA Fallback Static Asset Exclusion
 *
 * **Validates: Requirements 17.3**
 *
 * Parse `netlify.toml` and `public/_redirects`; assert no rule rewrites
 * `/sitemap.xml`, `/robots.txt`, `/manifest.json`, `/favicon.ico`, or
 * `/assets/<any>` to `/index.html`.
 *
 * @module app/spaFallback.pbt.test
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');

const NETLIFY_TOML_PATH = path.join(REPO_ROOT, 'netlify.toml');
const REDIRECTS_PATH = path.join(REPO_ROOT, 'public', '_redirects');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RedirectRule {
  /** The source pattern, e.g. "/*" or "/assets/*" */
  from: string;
  /** The destination, e.g. "/index.html" */
  to: string;
  /** HTTP status code */
  status: number;
  /** Whether force is set (only relevant for netlify.toml) */
  force?: boolean;
  /** Origin config file for diagnostics */
  source: 'netlify.toml' | '_redirects';
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/**
 * Parses `netlify.toml` redirect blocks into a normalized list of rules.
 * Only reads `[[redirects]]` entries. Ignores headers, build config, etc.
 */
function parseNetlifyToml(content: string): RedirectRule[] {
  const rules: RedirectRule[] = [];

  // Split on [[redirects]] sections — each section ends at the next [[ or end of file
  const sections = content.split(/\[\[redirects\]\]/);
  // First element is the preamble before the first [[redirects]]
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];

    // Extract key = "value" pairs; stop if we hit a new [[ block
    const sectionBody = section.split(/\[\[/)[0];

    const fromMatch = sectionBody.match(/^\s*from\s*=\s*["']([^"']+)["']/m);
    const toMatch = sectionBody.match(/^\s*to\s*=\s*["']([^"']+)["']/m);
    const statusMatch = sectionBody.match(/^\s*status\s*=\s*(\d+)/m);
    const forceMatch = sectionBody.match(/^\s*force\s*=\s*(true|false)/m);

    if (fromMatch && toMatch) {
      rules.push({
        from: fromMatch[1],
        to: toMatch[1],
        status: statusMatch ? parseInt(statusMatch[1], 10) : 200,
        force: forceMatch ? forceMatch[1] === 'true' : false,
        source: 'netlify.toml',
      });
    }
  }

  return rules;
}

/**
 * Parses `public/_redirects` lines into a normalized list of rules.
 * Ignores comment lines (starting with #) and blank lines.
 *
 * Format: `<from>  <to>  [status][!]`
 */
function parseRedirectsFile(content: string): RedirectRule[] {
  const rules: RedirectRule[] = [];

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    // Skip comments and blank lines
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;

    const from = parts[0];
    const to = parts[1];
    const statusRaw = parts[2] ?? '200';
    const status = parseInt(statusRaw.replace('!', ''), 10);

    rules.push({ from, to, status, source: '_redirects' });
  }

  return rules;
}

// ---------------------------------------------------------------------------
// Matching helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if a Netlify `from` pattern matches the given concrete path.
 *
 * Supported patterns:
 *   - Exact match: `/sitemap.xml` matches `/sitemap.xml`
 *   - Splat: `/assets/*` matches `/assets/anything` and `/assets/sub/path`
 *   - Catch-all: `/*` matches anything
 */
function patternMatches(pattern: string, testPath: string): boolean {
  if (pattern === testPath) return true;

  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2); // strip "/*"
    if (testPath === prefix) return true; // exact prefix match
    if (testPath.startsWith(prefix + '/')) return true;
    return false;
  }

  // Generic splat: replace * with a wildcard regex segment
  if (pattern.includes('*')) {
    // Escape everything except the splat, then convert * to .*
    const regexStr = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escape regex metacharacters
      .replace(/\*/g, '.*'); // turn * into .*
    const re = new RegExp(`^${regexStr}$`);
    return re.test(testPath);
  }

  return false;
}

/**
 * Returns the first rule (in declaration order) whose `from` pattern matches
 * the given path, or undefined if nothing matches.
 */
function firstMatchingRule(
  rules: RedirectRule[],
  testPath: string,
): RedirectRule | undefined {
  return rules.find((rule) => patternMatches(rule.from, testPath));
}

// ---------------------------------------------------------------------------
// Protected static asset paths
// ---------------------------------------------------------------------------

/** Exact paths that must never be rewritten to /index.html */
const PROTECTED_EXACT_PATHS = [
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.json',
  '/favicon.ico',
] as const;

/** Generator for arbitrary asset paths under /assets/ */
const assetPathArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 30 }).filter((s) => /^[\w.-]+$/.test(s)),
    fc.array(
      fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[\w.-]+$/.test(s)),
      { minLength: 0, maxLength: 3 },
    ),
  )
  .map(([filename, dirs]) => {
    const dirPath = dirs.length > 0 ? '/' + dirs.join('/') : '';
    return `/assets${dirPath}/${filename}`;
  });

// ---------------------------------------------------------------------------
// Load and parse the config files (once, outside test bodies)
// ---------------------------------------------------------------------------

const netlifyTomlContent = fs.readFileSync(NETLIFY_TOML_PATH, 'utf-8');
const redirectsContent = fs.readFileSync(REDIRECTS_PATH, 'utf-8');

const netlifyRules = parseNetlifyToml(netlifyTomlContent);
const redirectsRules = parseRedirectsFile(redirectsContent);

// ---------------------------------------------------------------------------
// Tests — netlify.toml
// ---------------------------------------------------------------------------

describe('Property 21: SPA Fallback Static Asset Exclusion — netlify.toml', () => {
  /**
   * P21-a: The catch-all "/*" rule exists in netlify.toml and routes to /index.html
   */
  it('P21-a: netlify.toml has a catch-all /* → /index.html rule', () => {
    const catchAll = netlifyRules.find(
      (r) => r.from === '/*' && r.to === '/index.html',
    );
    expect(
      catchAll,
      'Expected a [[redirects]] rule with from="/*" and to="/index.html" in netlify.toml',
    ).toBeDefined();
  });

  /**
   * P21-b: For each exact protected path, the first matching rule in netlify.toml
   * does NOT redirect to /index.html.
   */
  it('P21-b: netlify.toml does not rewrite exact protected paths to /index.html', () => {
    for (const protectedPath of PROTECTED_EXACT_PATHS) {
      const matched = firstMatchingRule(netlifyRules, protectedPath);
      if (matched) {
        expect(
          matched.to,
          `netlify.toml rule matching "${protectedPath}" rewrites to "${matched.to}" — expected NOT to be /index.html`,
        ).not.toBe('/index.html');
      }
      // If no rule matches at all, that is also fine — Netlify serves the file directly.
    }
  });

  /**
   * P21-c: For any arbitrary /assets/* path, the first matching rule in
   * netlify.toml does NOT redirect to /index.html (property-based).
   */
  it('P21-c (PBT): netlify.toml does not rewrite /assets/<any> to /index.html', () => {
    fc.assert(
      fc.property(assetPathArb, (assetPath) => {
        const matched = firstMatchingRule(netlifyRules, assetPath);
        if (matched) {
          expect(matched.to).not.toBe('/index.html');
        }
        // If nothing matches the /assets/* pattern before the catch-all the
        // dedicated pass-through rule must exist to ensure assets are served.
        // We check that separately in P21-d.
        return true;
      }),
      { numRuns: 200 },
    );
  });

  /**
   * P21-d: A dedicated /assets/* pass-through rule exists before the catch-all
   * in netlify.toml, ensuring it short-circuits the /* rule.
   */
  it('P21-d: netlify.toml has a /assets/* pass-through rule before the catch-all', () => {
    const assetsRuleIdx = netlifyRules.findIndex(
      (r) => r.from === '/assets/*' && r.to !== '/index.html',
    );
    const catchAllIdx = netlifyRules.findIndex(
      (r) => r.from === '/*' && r.to === '/index.html',
    );
    expect(assetsRuleIdx).toBeGreaterThanOrEqual(0);
    expect(catchAllIdx).toBeGreaterThanOrEqual(0);
    expect(assetsRuleIdx).toBeLessThan(catchAllIdx);
  });

  /**
   * P21-e: Each protected exact path has its own explicit pass-through rule
   * that appears before the catch-all.
   */
  it('P21-e: each protected path has a pass-through rule before the catch-all', () => {
    const catchAllIdx = netlifyRules.findIndex(
      (r) => r.from === '/*' && r.to === '/index.html',
    );
    expect(catchAllIdx).toBeGreaterThanOrEqual(0);

    for (const protectedPath of PROTECTED_EXACT_PATHS) {
      const ruleIdx = netlifyRules.findIndex(
        (r) => r.from === protectedPath && r.to !== '/index.html',
      );
      expect(
        ruleIdx,
        `Expected a pass-through rule for "${protectedPath}" in netlify.toml`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        ruleIdx,
        `Pass-through rule for "${protectedPath}" must appear before the catch-all`,
      ).toBeLessThan(catchAllIdx);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — public/_redirects
// ---------------------------------------------------------------------------

describe('Property 21: SPA Fallback Static Asset Exclusion — public/_redirects', () => {
  /**
   * P21-f: The catch-all "/*" rule exists in _redirects and routes to /index.html
   */
  it('P21-f: _redirects has a catch-all /* → /index.html rule', () => {
    const catchAll = redirectsRules.find(
      (r) => r.from === '/*' && r.to === '/index.html',
    );
    expect(
      catchAll,
      'Expected a rule with "/* /index.html 200" in public/_redirects',
    ).toBeDefined();
  });

  /**
   * P21-g: For each exact protected path, the first matching rule in _redirects
   * does NOT redirect to /index.html.
   */
  it('P21-g: _redirects does not rewrite exact protected paths to /index.html', () => {
    for (const protectedPath of PROTECTED_EXACT_PATHS) {
      const matched = firstMatchingRule(redirectsRules, protectedPath);
      if (matched) {
        expect(
          matched.to,
          `_redirects rule matching "${protectedPath}" rewrites to "${matched.to}" — expected NOT to be /index.html`,
        ).not.toBe('/index.html');
      }
    }
  });

  /**
   * P21-h: For any arbitrary /assets/* path, the first matching rule in
   * _redirects does NOT redirect to /index.html (property-based).
   */
  it('P21-h (PBT): _redirects does not rewrite /assets/<any> to /index.html', () => {
    fc.assert(
      fc.property(assetPathArb, (assetPath) => {
        const matched = firstMatchingRule(redirectsRules, assetPath);
        if (matched) {
          expect(matched.to).not.toBe('/index.html');
        }
        return true;
      }),
      { numRuns: 200 },
    );
  });

  /**
   * P21-i: A dedicated /assets/* pass-through rule exists before the catch-all
   * in _redirects.
   */
  it('P21-i: _redirects has a /assets/* pass-through rule before the catch-all', () => {
    const assetsRuleIdx = redirectsRules.findIndex(
      (r) => r.from === '/assets/*' && r.to !== '/index.html',
    );
    const catchAllIdx = redirectsRules.findIndex(
      (r) => r.from === '/*' && r.to === '/index.html',
    );
    expect(assetsRuleIdx).toBeGreaterThanOrEqual(0);
    expect(catchAllIdx).toBeGreaterThanOrEqual(0);
    expect(assetsRuleIdx).toBeLessThan(catchAllIdx);
  });

  /**
   * P21-j: Each protected exact path has its own explicit pass-through rule
   * in _redirects that appears before the catch-all.
   */
  it('P21-j: each protected path has a pass-through rule before the catch-all in _redirects', () => {
    const catchAllIdx = redirectsRules.findIndex(
      (r) => r.from === '/*' && r.to === '/index.html',
    );
    expect(catchAllIdx).toBeGreaterThanOrEqual(0);

    for (const protectedPath of PROTECTED_EXACT_PATHS) {
      const ruleIdx = redirectsRules.findIndex(
        (r) => r.from === protectedPath && r.to !== '/index.html',
      );
      expect(
        ruleIdx,
        `Expected a pass-through rule for "${protectedPath}" in public/_redirects`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        ruleIdx,
        `Pass-through rule for "${protectedPath}" must appear before the catch-all`,
      ).toBeLessThan(catchAllIdx);
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-file consistency
// ---------------------------------------------------------------------------

describe('Property 21: SPA Fallback Static Asset Exclusion — cross-file consistency', () => {
  /**
   * P21-k: Both netlify.toml and _redirects protect the same set of exact paths.
   * Neither file can protect a path that the other leaves exposed.
   */
  it('P21-k: both config files protect the same exact static asset paths', () => {
    for (const protectedPath of PROTECTED_EXACT_PATHS) {
      const tomlRule = netlifyRules.find(
        (r) => r.from === protectedPath && r.to !== '/index.html',
      );
      const redirectsRule = redirectsRules.find(
        (r) => r.from === protectedPath && r.to !== '/index.html',
      );

      expect(
        tomlRule,
        `netlify.toml is missing a pass-through rule for "${protectedPath}"`,
      ).toBeDefined();
      expect(
        redirectsRule,
        `public/_redirects is missing a pass-through rule for "${protectedPath}"`,
      ).toBeDefined();
    }
  });

  /**
   * P21-l: Both config files have an /assets/* pass-through rule.
   */
  it('P21-l: both config files have an /assets/* pass-through rule', () => {
    const tomlAssets = netlifyRules.find(
      (r) => r.from === '/assets/*' && r.to !== '/index.html',
    );
    const redirectsAssets = redirectsRules.find(
      (r) => r.from === '/assets/*' && r.to !== '/index.html',
    );
    expect(
      tomlAssets,
      'netlify.toml is missing an /assets/* pass-through rule',
    ).toBeDefined();
    expect(
      redirectsAssets,
      'public/_redirects is missing an /assets/* pass-through rule',
    ).toBeDefined();
  });
});
