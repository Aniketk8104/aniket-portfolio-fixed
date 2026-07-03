/**
 * ArticlePage — /writing/:slug route.
 *
 * Renders an article's title, metadata (tags, reading time, published date),
 * an optional table of contents, and the prose body.
 *
 * - When `body` is a placeholder, renders <Placeholder> instead of fabricated content.
 * - When `toc` is present, renders a linked table of contents panel before the body.
 * - When the slug does not match any article entry, renders <NotFoundPage/>.
 *
 * Validates: Requirements 7.2, 7.3
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { RouteSEO } from '../app/SEO/RouteSEO';
import { articles } from '../content/articles';
import { isPlaceholder } from '../utils/placeholder';
import { Placeholder } from '../sections/shared/Placeholder';
import { Container, Tag, Stack, Divider } from '../components/ui';
import NotFoundPage from './NotFoundPage';
import type { RichText, RichTextNode, TocEntry } from '../types/content';

// ---------------------------------------------------------------------------
// RichTextRenderer — minimal renderer for RichText values
// ---------------------------------------------------------------------------

interface RichTextRendererProps {
  value: RichText;
}

const renderNode = (node: RichTextNode, index: number): React.ReactNode => {
  switch (node.type) {
    case 'paragraph':
      return (
        <p
          key={index}
          style={{
            margin: '0 0 var(--space-4)',
            fontSize: 'var(--font-size-body)',
            lineHeight: 'var(--line-height-body)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {node.content}
          {node.children?.map(renderNode)}
        </p>
      );
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2;
      const Tag = `h${Math.min(Math.max(level, 2), 6)}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const id = node.attrs?.id as string | undefined;
      return (
        <Tag
          key={index}
          id={id}
          style={{
            margin: 'var(--space-8) 0 var(--space-3)',
            fontSize: level === 2 ? 'var(--font-size-h2)' : 'var(--font-size-h3)',
            lineHeight: level === 2 ? 'var(--line-height-h2)' : 'var(--line-height-h3)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {node.content}
          {node.children?.map(renderNode)}
        </Tag>
      );
    }
    case 'list':
      return (
        <ul
          key={index}
          style={{
            margin: '0 0 var(--space-4)',
            paddingLeft: 'var(--space-6)',
            fontSize: 'var(--font-size-body)',
            lineHeight: 'var(--line-height-body)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {node.children?.map((child, i) => (
            <li key={i} style={{ marginBottom: 'var(--space-2)' }}>
              {child.content}
              {child.children?.map(renderNode)}
            </li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <pre
          key={index}
          style={{
            margin: '0 0 var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-caption)',
            overflowX: 'auto',
            color: 'var(--color-text-primary)',
          }}
        >
          <code>{node.content}</code>
        </pre>
      );
    case 'blockquote':
      return (
        <blockquote
          key={index}
          style={{
            margin: '0 0 var(--space-4)',
            paddingLeft: 'var(--space-6)',
            borderLeft: '3px solid var(--color-accent-primary)',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {node.content}
          {node.children?.map(renderNode)}
        </blockquote>
      );
    default:
      return node.content ? <p key={index}>{node.content}</p> : null;
  }
};

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ value }) => {
  if (typeof value === 'string') {
    return (
      <div
        style={{
          fontSize: 'var(--font-size-body)',
          lineHeight: 'var(--line-height-body)',
          color: 'var(--color-text-secondary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {value}
      </div>
    );
  }

  return <div>{value.map(renderNode)}</div>;
};

// ---------------------------------------------------------------------------
// TableOfContents — rendered when article.toc is present
// ---------------------------------------------------------------------------

interface TableOfContentsProps {
  entries: TocEntry[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ entries }) => (
  <nav
    aria-label="Table of contents"
    style={{
      padding: 'var(--space-6)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 'var(--space-8)',
    }}
  >
    <p
      style={{
        margin: '0 0 var(--space-4)',
        fontSize: 'var(--font-size-caption)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      Contents
    </p>
    <ol
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      {entries.map((entry) => (
        <li
          key={entry.id}
          style={{
            paddingLeft: entry.level === 3 ? 'var(--space-4)' : '0',
          }}
        >
          <a
            href={`#${entry.id}`}
            style={{
              fontSize: 'var(--font-size-caption)',
              lineHeight: 'var(--line-height-caption)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'color var(--duration-fast) var(--ease-standard)',
            }}
          >
            {entry.label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

// ---------------------------------------------------------------------------
// ArticleMetadata — tags, reading time, published date
// ---------------------------------------------------------------------------

interface ArticleMetadataProps {
  tags: string[];
  readingTimeMinutes: number;
  publishedAt?: string;
}

const ArticleMetadata: React.FC<ArticleMetadataProps> = ({
  tags,
  readingTimeMinutes,
  publishedAt,
}) => {
  const readingLabel = readingTimeMinutes > 0 ? `${readingTimeMinutes} min read` : 'Reading time TBD';

  const publishedLabel = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}
    >
      {/* Tags */}
      {tags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}

      {/* Separator */}
      {tags.length > 0 && (
        <span
          aria-hidden="true"
          style={{ color: 'var(--color-border)', userSelect: 'none' }}
        >
          ·
        </span>
      )}

      {/* Reading time */}
      <span
        style={{
          fontSize: 'var(--font-size-caption)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {readingLabel}
      </span>

      {/* Published date */}
      {publishedLabel && (
        <>
          <span
            aria-hidden="true"
            style={{ color: 'var(--color-border)', userSelect: 'none' }}
          >
            ·
          </span>
          <time
            dateTime={publishedAt}
            style={{
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {publishedLabel}
          </time>
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ArticlePage
// ---------------------------------------------------------------------------

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const article = articles.find((a) => a.slug === slug);

  // Unknown slug → render NotFoundPage
  if (!article) {
    return <NotFoundPage />;
  }

  const ORIGIN = 'https://aniketkushwaha.dev';

  // Build per-article SEO overrides
  const seoOverrides = {
    title: `${article.title} — Aniket Kushwaha`,
    description: isPlaceholder(article.summary)
      ? `An engineering essay by Aniket Kushwaha on ${article.title}.`
      : (article.summary as string),
    canonical: `${ORIGIN}/writing/${article.slug}`,
    og: {
      title: `${article.title} — Aniket Kushwaha`,
      description: isPlaceholder(article.summary)
        ? `An engineering essay by Aniket Kushwaha on ${article.title}.`
        : (article.summary as string),
      type: 'article' as const,
      url: `${ORIGIN}/writing/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${article.title} — Aniket Kushwaha`,
      description: isPlaceholder(article.summary)
        ? `An engineering essay by Aniket Kushwaha on ${article.title}.`
        : (article.summary as string),
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      url: `${ORIGIN}/writing/${article.slug}`,
      ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
      author: {
        '@type': 'Person',
        name: 'Aniket Kushwaha',
        url: ORIGIN,
      },
    },
  };

  // Determine body rendering
  const bodyContent = (() => {
    if (!article.body) {
      // body is undefined — placeholder for unset body
      return <Placeholder field="body" />;
    }
    if (isPlaceholder(article.body)) {
      return <Placeholder field={article.body.__field} />;
    }
    return <RichTextRenderer value={article.body} />;
  })();

  return (
    <>
      <RouteSEO routeKey="article" overrides={seoOverrides} />
      <div className="route-page-main">
        <Container>
          <article
            style={{
              maxWidth: '72ch',
              marginInline: 'auto',
              paddingBlock: 'var(--space-16)',
            }}
          >
            {/* Title */}
            <h1
              style={{
                margin: '0 0 var(--space-4)',
                fontSize: 'var(--font-size-h1)',
                lineHeight: 'var(--line-height-h1)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              {article.title}
            </h1>

            {/* Metadata */}
            <ArticleMetadata
              tags={article.tags}
              readingTimeMinutes={article.readingTimeMinutes}
              publishedAt={article.publishedAt}
            />

            <Divider />

            <Stack space="6" style={{ marginTop: 'var(--space-8)' }}>
              {/* Table of contents — rendered only when present */}
              {article.toc && article.toc.length > 0 && (
                <TableOfContents entries={article.toc} />
              )}

              {/* Prose body */}
              <div className="article-body">{bodyContent}</div>
            </Stack>
          </article>
        </Container>
      </div>
    </>
  );
};

export default ArticlePage;
