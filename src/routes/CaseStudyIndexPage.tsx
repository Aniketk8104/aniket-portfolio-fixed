/**
 * CaseStudyIndexPage — `/case-studies` route.
 *
 * Lists each case study with title, project, role, duration, and primary tags
 * sourced from `src/content/caseStudies.ts`.
 *
 * Validates: Requirements 6.1, 14.1
 */
import React from 'react';
import { Link } from 'react-router-dom';

import { RouteSEO } from '../app/SEO/RouteSEO';
import { caseStudies } from '../content/caseStudies';
import { isPlaceholder } from '../utils/placeholder';
import {
  Section,
  Container,
  Card,
  Tag,
  Stack,
  Eyebrow,
} from '../components/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render a string value or a placeholder marker inline. */
function renderStringField(
  value: string | { __field: string },
  fieldName: string,
): React.ReactNode {
  if (isPlaceholder(value)) {
    return (
      <span
        role="note"
        aria-label={`Author content required for ${fieldName}`}
        style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', opacity: 0.7 }}
      >
        {`TODO: ${fieldName}`}
      </span>
    );
  }
  return value as string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CaseStudyIndexPage — `/case-studies` listing page.
 *
 * Renders every case study entry from the typed content module.
 * Per Requirement 6.1 each card shows: title, associated project,
 * role, duration, and primary tags.
 */
const CaseStudyIndexPage: React.FC = () => {
  return (
    <div className="route-page-main">
      {/* Per-route SEO metadata (Req 14.1) */}
      <RouteSEO routeKey="caseStudiesIndex" />

      {/* Page hero */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-eyebrow">Case Studies</span>
          <h1>Engineering Case Studies</h1>
          <p className="page-hero-subtitle">
            A structured look at the engineering decisions, constraints, tradeoffs,
            and outcomes behind each project.
          </p>
        </div>
      </div>

      <Section
        eyebrow=""
        title=""
        lead=""
        style={{ paddingInline: 0, paddingTop: 0 }}
      >
        <Container size="xl">
          {caseStudies.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>
              No case studies available yet.
            </p>
          ) : (
            <Stack
              as="ul"
              space="6"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {caseStudies.map((entry) => (
                <li key={entry.slug}>
                  <Card
                    variant="base"
                    padding="6"
                    style={{
                      transition: 'border-color var(--duration-fast) var(--ease-standard)',
                    }}
                  >
                    {/* Title — links to detail page */}
                    <Link
                      to={`/case-studies/${entry.slug}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                      }}
                      aria-label={`View case study: ${entry.title}`}
                    >
                      <h2
                        style={{
                          fontSize: 'var(--font-size-h3)',
                          lineHeight: 'var(--line-height-h3)',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)',
                          margin: 0,
                          marginBottom: 'var(--space-4)',
                        }}
                      >
                        {entry.title}
                      </h2>
                    </Link>

                    {/* Meta row: project · role · duration */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-4)',
                      }}
                    >
                      {/* Project */}
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <Eyebrow
                          style={{
                            display: 'inline',
                            fontSize: 'var(--font-size-caption)',
                          }}
                        >
                          Project
                        </Eyebrow>
                        <span>{entry.projectSlug}</span>
                      </span>

                      {/* Role */}
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <Eyebrow
                          style={{
                            display: 'inline',
                            fontSize: 'var(--font-size-caption)',
                          }}
                        >
                          Role
                        </Eyebrow>
                        <span>{renderStringField(entry.role, 'role')}</span>
                      </span>

                      {/* Duration */}
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <Eyebrow
                          style={{
                            display: 'inline',
                            fontSize: 'var(--font-size-caption)',
                          }}
                        >
                          Duration
                        </Eyebrow>
                        <span>{renderStringField(entry.duration, 'duration')}</span>
                      </span>
                    </div>

                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 'var(--space-2)',
                        }}
                        aria-label="Case study tags"
                      >
                        {entry.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </Stack>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default CaseStudyIndexPage;
