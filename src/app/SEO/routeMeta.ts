/**
 * Per-page SEO builders, shared by the route components (via <RouteSEO
 * overrides>) and scripts/prerender-seo.mjs, which writes the same tags into
 * static HTML so crawlers that don't run JavaScript (LinkedIn, WhatsApp, X,
 * Bing, AI crawlers) see the right title, description, canonical and preview.
 *
 * @module app/SEO/routeMeta
 */

import type { RouteSeoConfig, StructuredData } from '../../types/seo';
import type { CaseStudyEntry } from '../../content/caseStudies';
import type { ArticleEntry } from '../../content/articles';
import type { ArchitectureTopicEntry } from '../../content/architectureTopics';
import { isPlaceholder } from '../../utils/placeholder';
import { DEFAULT_OG_IMAGE, PERSON_NAME, SITE_ORIGIN as ORIGIN } from '../siteIdentity';

const AUTHOR = { '@type': 'Person', name: PERSON_NAME, url: ORIGIN } as const;

/** Search engines show ~155 characters; Bing flags descriptions over 160. */
export const MAX_DESCRIPTION = 155;

function text(value: unknown, fallback: string): string {
  return isPlaceholder(value) || typeof value !== 'string' ? fallback : value;
}

/** First sentence if it fits, otherwise cut at a word boundary. */
export function clipDescription(summary: string): string {
  const first = summary.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? summary;
  if (first.length >= 50 && first.length <= MAX_DESCRIPTION) return first;
  if (summary.length <= MAX_DESCRIPTION) return summary;
  const cut = summary.slice(0, MAX_DESCRIPTION - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '')}…`;
}

function breadcrumbs(items: Array<[name: string, path: string]>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${ORIGIN}${path}`,
    })),
  };
}

function page(
  title: string,
  description: string,
  path: string,
  structuredData: StructuredData,
): RouteSeoConfig {
  const url = `${ORIGIN}${path}`;
  return {
    title,
    description,
    canonical: url,
    og: { title, description, image: DEFAULT_OG_IMAGE, type: 'article', url },
    twitter: { card: 'summary_large_image', title, description, image: DEFAULT_OG_IMAGE },
    structuredData,
  };
}

export function caseStudyMeta(entry: CaseStudyEntry): RouteSeoConfig {
  const path = `/case-studies/${entry.slug}`;
  const title = `${entry.title} — Aniket Kushwaha`;
  const description = clipDescription(text(entry.summary, 'A detailed engineering case study.'));
  return page(title, description, path, [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: entry.title,
      description,
      url: `${ORIGIN}${path}`,
      image: DEFAULT_OG_IMAGE,
      keywords: entry.tags.join(', '),
      author: AUTHOR,
    },
    breadcrumbs([
      ['Home', '/'],
      ['Case Studies', '/case-studies'],
      [entry.title, path],
    ]),
  ]);
}

export function articleMeta(article: ArticleEntry): RouteSeoConfig {
  const path = `/writing/${article.slug}`;
  const title = `${article.title} — Aniket Kushwaha`;
  const description = clipDescription(text(
    article.summary,
    `An engineering essay by Aniket Kushwaha on ${article.title}.`,
  ));
  return page(title, description, path, [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      url: `${ORIGIN}${path}`,
      image: DEFAULT_OG_IMAGE,
      ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
      author: AUTHOR,
    },
    breadcrumbs([
      ['Home', '/'],
      ['Writing', '/writing'],
      [article.title, path],
    ]),
  ]);
}

export function architectureTopicMeta(topic: ArchitectureTopicEntry): RouteSeoConfig {
  const path = `/architecture/${topic.slug}`;
  const title = `${topic.title} — Architecture · Aniket Kushwaha`;
  const description = clipDescription(text(topic.summary, 'An in-depth architecture topic with custom diagrams.'));
  return page(title, description, path, [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: topic.title,
      description,
      url: `${ORIGIN}${path}`,
      image: DEFAULT_OG_IMAGE,
      author: AUTHOR,
    },
    breadcrumbs([
      ['Home', '/'],
      ['Architecture', '/architecture'],
      [topic.title, path],
    ]),
  ]);
}

