#!/usr/bin/env node

/**
 * Sitemap Generation Script
 *
 * Generates public/sitemap.xml containing:
 * - Every non-slug route from src/app/routeTable.ts
 * - Published case study slugs  (/case-studies/:slug)
 * - Published architecture topic slugs (/architecture/:slug)
 * - Published article slugs (/writing/:slug)
 *
 * A slug route is any route whose path contains ':slug'.
 * Only content entries with status === 'published' are included.
 * The script exits non-zero when a published entry is missing a required
 * slug field (the slug is falsy / empty).
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs    # Run manually
 *   npm run build                        # Runs automatically via prebuild hook
 *
 * Exit codes:
 * - 0: Sitemap written successfully
 * - 1: One or more required slugs are missing or the script encountered an error
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ─── Site configuration ───────────────────────────────────────────────────────
const SITE_URL = process.env.SITE_URL || 'https://aniketdev.tech';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

/**
 * TypeScript runner script that collects all sitemap data and returns JSON.
 * Uses the same tsx-based pattern as validate-content.mjs so that TS imports
 * work correctly without a separate build step.
 */
const RUNNER_SCRIPT = `
import { routeTable } from './src/app/routeTable';
import { caseStudies } from './src/content/caseStudies';
import { architectureTopics } from './src/content/architectureTopics';
import { articles } from './src/content/articles';

interface SitemapEntry {
  url: string;
  path: string;
}

interface RunnerOutput {
  entries: SitemapEntry[];
  errors: string[];
}

const siteUrl = process.env.SITE_URL || 'https://aniketdev.tech';
const now = new Date().toISOString();
const entries: SitemapEntry[] = [];
const errors: string[] = [];

// ── Static (non-slug) routes from routeTable ──────────────────────────────────
// Skip the catch-all '*' route and any route that contains a ':' (slug routes).
for (const route of routeTable) {
  if (route.path === '*') continue;
  if (route.path.includes(':')) continue;
  entries.push({ url: siteUrl + route.path, path: route.path });
}

// ── Helper: add published slug entries and validate ───────────────────────────
function addSlugEntries(
  collection: { slug: string; status: string }[],
  basePattern: string,
  collectionName: string,
): void {
  for (const entry of collection) {
    if (entry.status !== 'published') continue;

    if (!entry.slug || entry.slug.trim() === '') {
      errors.push(
        '[' + collectionName + '] A published entry is missing a required slug.'
      );
      continue;
    }

    const path = basePattern.replace(':slug', entry.slug);
    entries.push({ url: siteUrl + path, path });
  }
}

// ── Published content slugs ───────────────────────────────────────────────────
addSlugEntries(caseStudies as any[], '/case-studies/:slug', 'caseStudies');
addSlugEntries(architectureTopics as any[], '/architecture/:slug', 'architectureTopics');
addSlugEntries(articles as any[], '/writing/:slug', 'articles');

// ── Output ────────────────────────────────────────────────────────────────────
const output: RunnerOutput = { entries, errors };
process.stdout.write(JSON.stringify(output));
process.exit(errors.length > 0 ? 1 : 0);
`;

/**
 * Builds the XML string for a single <url> element.
 */
function buildUrlElement(url, priority, changefreq) {
  const today = new Date().toISOString().split('T')[0] + 'T00:00:00+00:00';
  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n');
}

/**
 * Determines priority and changefreq for a given path.
 */
function routeMeta(path) {
  if (path === '/') return { priority: 1.0, changefreq: 'weekly' };
  if (path === '/projects') return { priority: 0.9, changefreq: 'weekly' };
  if (path === '/architecture') return { priority: 0.8, changefreq: 'weekly' };
  if (path === '/case-studies') return { priority: 0.8, changefreq: 'weekly' };
  if (path === '/writing') return { priority: 0.8, changefreq: 'weekly' };
  // Slug pages
  if (path.startsWith('/case-studies/')) return { priority: 0.7, changefreq: 'monthly' };
  if (path.startsWith('/architecture/')) return { priority: 0.7, changefreq: 'monthly' };
  if (path.startsWith('/writing/')) return { priority: 0.7, changefreq: 'monthly' };
  return { priority: 0.5, changefreq: 'monthly' };
}

/**
 * Assembles the final sitemap XML.
 */
function buildSitemap(entries) {
  const urlElements = entries.map(({ url, path }) => {
    const { priority, changefreq } = routeMeta(path);
    return buildUrlElement(url, priority, changefreq);
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlElements,
    '</urlset>',
    '',
  ].join('\n');
}

async function main() {
  console.log(`${colors.cyan}🗺️  Generating sitemap...${colors.reset}\n`);

  // Write the TypeScript runner to a temporary file at the project root
  // so that relative imports (./src/...) resolve correctly.
  const tmpFile = join(rootDir, '.generate-sitemap-runner.ts');

  try {
    writeFileSync(tmpFile, RUNNER_SCRIPT, 'utf-8');

    let stdout;
    try {
      stdout = execSync(`npx tsx ${tmpFile}`, {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, SITE_URL },
      });
    } catch (execError) {
      // tsx may exit non-zero when errors array is non-empty but still
      // write valid JSON to stdout — try to parse it first.
      if (execError.stdout) {
        stdout = execError.stdout;
      } else {
        throw execError;
      }
    }

    const output = JSON.parse(stdout.trim());

    if (output.errors && output.errors.length > 0) {
      console.error(`${colors.red}❌ Sitemap generation FAILED — missing required slugs:${colors.reset}\n`);
      for (const err of output.errors) {
        console.error(`  ${colors.red}✗${colors.reset} ${err}`);
      }
      console.error('');
      cleanup(tmpFile);
      process.exit(1);
    }

    const xml = buildSitemap(output.entries);
    const outPath = join(rootDir, 'public', 'sitemap.xml');
    writeFileSync(outPath, xml, 'utf-8');

    console.log(`${colors.green}✅ Sitemap generated successfully${colors.reset}`);
    console.log(`   ${output.entries.length} URL(s) written to public/sitemap.xml\n`);

    // Log a summary
    for (const { url } of output.entries) {
      console.log(`   ${colors.cyan}→${colors.reset} ${url}`);
    }
    console.log('');

    cleanup(tmpFile);
    process.exit(0);
  } catch (error) {
    const stderr = error.stderr || error.message || String(error);
    console.error(`${colors.red}❌ Error during sitemap generation:${colors.reset}`);
    console.error(stderr);
    cleanup(tmpFile);
    process.exit(1);
  }
}

function cleanup(tmpFile) {
  try {
    unlinkSync(tmpFile);
  } catch {
    // Ignore cleanup errors
  }
}

main();
