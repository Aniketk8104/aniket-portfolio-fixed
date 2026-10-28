#!/usr/bin/env node

/**
 * Static SEO prerender (runs after `vite build`).
 *
 * The site is a client-rendered SPA, so crawlers that don't run JavaScript
 * (LinkedIn, WhatsApp, X, Slack, Bing, AI crawlers) only ever saw the home
 * page's tags. This writes one HTML file per sitemap URL, each with that
 * page's <title>, description, canonical, Open Graph, Twitter and JSON-LD,
 * taken from the same builders the app uses (src/app/SEO).
 *
 *   /                        → dist/index.html
 *   /case-studies/bvisionr   → dist/case-studies/bvisionr.html  (vercel.json cleanUrls)
 *   unknown URLs             → dist/404.html (served with a real 404 status)
 *
 * Tags carry data-rh="true" so react-helmet-async replaces them on mount
 * instead of duplicating them.
 *
 * Exit codes: 0 on success, 1 if the template markers or any page is missing.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const START = '<!-- seo:start -->';
const END = '<!-- seo:end -->';

const RUNNER = `
import { routeTable } from './src/app/routeTable';
import { seoConfig } from './src/app/SEO/seoConfig';
import { caseStudyMeta, articleMeta, architectureTopicMeta } from './src/app/SEO/routeMeta';
import { caseStudies } from './src/content/caseStudies';
import { articles } from './src/content/articles';
import { architectureTopics } from './src/content/architectureTopics';

const pages: Array<{ path: string; meta: unknown; noindex?: boolean }> = [];
for (const r of routeTable) {
  if (r.path === '*' || r.path.includes(':')) continue;
  pages.push({ path: r.path, meta: seoConfig[r.seoKey] });
}
const pub = <T extends { status: string }>(l: T[]) => l.filter((e) => e.status === 'published');
for (const e of pub(caseStudies)) pages.push({ path: '/case-studies/' + e.slug, meta: caseStudyMeta(e) });
for (const t of pub(architectureTopics)) pages.push({ path: '/architecture/' + t.slug, meta: architectureTopicMeta(t) });
for (const a of pub(articles)) pages.push({ path: '/writing/' + a.slug, meta: articleMeta(a) });
pages.push({ path: '/404', meta: seoConfig.notFound, noindex: true });
process.stdout.write(JSON.stringify(pages));
`;

const esc = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Mirrors the tag set rendered by src/app/SEO/RouteSEO.tsx. */
function renderHead(meta, noindex, ogExtras) {
  const { title, description, canonical, og, twitter, structuredData } = meta;
  const tags = [`<title>${esc(title)}</title>`];
  const m = (attr, key, content) =>
    content != null && tags.push(`<meta data-rh="true" ${attr}="${key}" content="${esc(content)}" />`);
  m('name', 'description', description);
  m('name', 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1');
  if (!noindex) tags.push(`<link data-rh="true" rel="canonical" href="${esc(canonical)}" />`);
  m('property', 'og:title', og.title);
  m('property', 'og:description', og.description);
  m('property', 'og:type', og.type ?? 'website');
  m('property', 'og:url', og.url);
  m('property', 'og:image', og.image);
  if (og.image === ogExtras.defaultImage) {
    m('property', 'og:image:width', ogExtras.width);
    m('property', 'og:image:height', ogExtras.height);
  }
  if (og.image) m('property', 'og:image:alt', ogExtras.alt);
  m('property', 'og:site_name', ogExtras.siteName);
  m('property', 'og:locale', 'en_IN');
  m('name', 'twitter:card', twitter.card);
  m('name', 'twitter:title', twitter.title);
  m('name', 'twitter:description', twitter.description);
  m('name', 'twitter:site', twitter.site);
  m('name', 'twitter:image', twitter.image);
  if (structuredData) {
    for (const block of Array.isArray(structuredData) ? structuredData : [structuredData]) {
      // Escape "<" so content can never close the script element.
      const json = JSON.stringify(block).replace(/</g, '\\u003c');
      tags.push(`<script data-rh="true" type="application/ld+json">${json}</script>`);
    }
  }
  return tags.join('\n    ');
}

const SHELL_START = '<!-- shell:start -->';
const SHELL_END = '<!-- shell:end -->';
const NAV = [
  ['Home', '/'],
  ['Projects', '/projects'],
  ['Case Studies', '/case-studies'],
  ['Architecture', '/architecture'],
  ['Writing', '/writing'],
];

/** Visible H1 + summary + nav inside the loading shell; React replaces it on mount. */
function renderShell(meta) {
  const h1 = meta.title.replace(/\s[—·]\s(Architecture\s·\s)?Aniket Kushwaha$/, '');
  const links = NAV.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
  return `<h1>${esc(h1)}</h1>\n          <p>${esc(meta.description)}</p>\n          <nav aria-label="Site">${links}</nav>`;
}

/** Bing flags descriptions outside ~25–160 characters. */
const DESC_MIN = 50;
const DESC_MAX = 160;

function outFile(path) {
  if (path === '/') return join(distDir, 'index.html');
  return join(distDir, `${path.slice(1)}.html`);
}

function main() {
  const template = readFileSync(join(distDir, 'index.html'), 'utf-8');
  const a = template.indexOf(START);
  const b = template.indexOf(END);
  if (a < 0 || b < a) {
    console.error('❌ prerender-seo: seo markers not found in dist/index.html');
    process.exit(1);
  }

  const tmp = join(rootDir, '.prerender-seo-runner.ts');
  let pages;
  try {
    writeFileSync(tmp, RUNNER, 'utf-8');
    pages = JSON.parse(execSync(`npx tsx ${tmp}`, { cwd: rootDir, encoding: 'utf-8' }).trim());
  } finally {
    try { unlinkSync(tmp); } catch { /* ignore */ }
  }

  const ident = JSON.parse(
    execSync(
      `npx tsx -e "import * as s from './src/app/siteIdentity'; process.stdout.write(JSON.stringify(s))"`,
      { cwd: rootDir, encoding: 'utf-8' },
    ).trim(),
  );
  const ogExtras = {
    defaultImage: ident.DEFAULT_OG_IMAGE,
    width: ident.OG_IMAGE_WIDTH,
    height: ident.OG_IMAGE_HEIGHT,
    alt: ident.OG_IMAGE_ALT,
    siteName: ident.SITE_NAME,
  };

  const sa = template.indexOf(SHELL_START);
  const sb = template.indexOf(SHELL_END);
  if (sa < 0 || sb < sa) {
    console.error('❌ prerender-seo: shell markers not found in dist/index.html');
    process.exit(1);
  }

  let written = 0;
  const problems = [];
  for (const { path, meta, noindex } of pages) {
    if (!meta) {
      console.error(`❌ prerender-seo: no SEO config for ${path}`);
      process.exit(1);
    }
    const len = meta.description.length;
    if (!noindex && (len < DESC_MIN || len > DESC_MAX)) {
      problems.push(`${path}: description is ${len} chars (want ${DESC_MIN}–${DESC_MAX})`);
    }
    const html =
      template.slice(0, a) + START + '\n    ' + renderHead(meta, noindex, ogExtras) + '\n    ' +
      template.slice(b, sa) + SHELL_START + '\n          ' + renderShell(meta) + '\n          ' +
      template.slice(sb);
    const file = outFile(path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html, 'utf-8');
    written += 1;
  }
  if (problems.length) {
    console.error(`❌ prerender-seo: fix these descriptions:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`✅ prerender-seo: wrote ${written} HTML files with per-page SEO tags`);
}

main();
