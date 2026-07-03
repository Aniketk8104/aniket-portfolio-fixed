/**
 * WritingIndexPage — /writing route.
 *
 * Lists all articles with title, summary, topic tags, and estimated reading time.
 * Each entry links to its Article_Page slug.
 *
 * Validates: Requirements 7.1, 7.4
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { RouteSEO } from '../app/SEO/RouteSEO';
import { articles } from '../content/articles';
import { isPlaceholder } from '../utils/placeholder';
import { Placeholder } from '../sections/shared/Placeholder';
import {
  Container,
  Card,
  Tag,
  Stack,
} from '../components/ui';

// ---------------------------------------------------------------------------
// ReadingTime
// ---------------------------------------------------------------------------

interface ReadingTimeProps {
  minutes: number;
}

const ReadingTime: React.FC<ReadingTimeProps> = ({ minutes }) => {
  const label = minutes > 0 ? `${minutes} min read` : 'Reading time TBD';
  return (
    <span
      style={{
        fontSize: 'var(--font-size-caption)',
        lineHeight: 'var(--line-height-caption)',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {label}
    </span>
  );
};

// ---------------------------------------------------------------------------
// ArticleCard
// ---------------------------------------------------------------------------

interface ArticleCardProps {
  slug: string;
  title: string;
  summary: React.ReactNode;
  tags: string[];
  readingTimeMinutes: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  slug,
  title,
  summary,
  tags,
  readingTimeMinutes,
}) => (
  <Card
    variant="base"
    padding="6"
    style={{
      transition: 'box-shadow var(--duration-fast) var(--ease-standard)',
    }}
  >
    <Stack space="4">
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}

      <h2
        style={{
          margin: 0,
          fontSize: 'var(--font-size-h3)',
          lineHeight: 'var(--line-height-h3)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        <Link
          to={`/writing/${slug}`}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {title}
        </Link>
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-size-body)',
          lineHeight: 'var(--line-height-body)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {summary}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        <ReadingTime minutes={readingTimeMinutes} />
        <Link
          to={`/writing/${slug}`}
          style={{
            fontSize: 'var(--font-size-caption)',
            fontWeight: 500,
            color: 'var(--color-accent-primary)',
            textDecoration: 'none',
          }}
        >
          Read article →
        </Link>
      </div>
    </Stack>
  </Card>
);

// ---------------------------------------------------------------------------
// WritingIndexPage
// ---------------------------------------------------------------------------

const WritingIndexPage: React.FC = () => (
  <div className="route-page-main">
    <RouteSEO routeKey="writingIndex" />

    {/* Page hero */}
    <div className="page-hero">
      <div className="container">
        <span className="page-hero-eyebrow">Writing</span>
        <h1>Engineering Essays</h1>
        <p className="page-hero-subtitle">
          Long-form thinking on distributed systems, AI automation, SaaS patterns,
          event-driven architecture, and related topics.
        </p>
      </div>
    </div>

    {/* Article list */}
    <Container>
      <div style={{ paddingBottom: 'var(--space-16)' }}>
        <Stack space="6">
          {articles.map((article) => {
            const summaryNode = isPlaceholder(article.summary) ? (
              <Placeholder field={article.summary.__field} />
            ) : (
              article.summary
            );

            return (
              <ArticleCard
                key={article.slug}
                slug={article.slug}
                title={article.title}
                summary={summaryNode}
                tags={article.tags}
                readingTimeMinutes={article.readingTimeMinutes}
              />
            );
          })}
        </Stack>
      </div>
    </Container>
  </div>
);

export default WritingIndexPage;
