/**
 * ArchitectureTopicPage — /architecture/:slug route.
 *
 * Resolves the :slug param against `architectureTopics`. If found, renders
 * the composed diagram (looked up by `diagramId`) wrapped in an inner
 * ErrorBoundary, plus user-authored prose sections.
 *
 * Renders the "Related case studies" block only when
 * `relatedCaseStudySlugs.length > 0`.
 *
 * Unknown slugs render <NotFoundPage />.
 *
 * Validates: Requirements 1.4, 5.1, 5.2, 5.3, 5.4, 10.6
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { RouteSEO } from '../app/SEO/RouteSEO';
import { architectureTopics } from '../content/architectureTopics';
import { caseStudies } from '../content/caseStudies';
import { isPlaceholder } from '../utils/placeholder';
import { Placeholder } from '../sections/shared/Placeholder';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFoundPage from './NotFoundPage';

// ---------------------------------------------------------------------------
// Diagram registry — maps diagramId → lazy React component
// ---------------------------------------------------------------------------

const diagramRegistry: Record<string, React.LazyExoticComponent<React.FC>> = {
  'distributed-messaging': React.lazy(
    () =>
      import('../components/diagrams/composed/DistributedMessagingDiagram').then(
        (m) => ({ default: m.DistributedMessagingDiagram }),
      ),
  ),
  'ai-routing': React.lazy(
    () =>
      import('../components/diagrams/composed/AIRoutingDiagram').then(
        (m) => ({ default: m.AIRoutingDiagram }),
      ),
  ),
  'multi-tenant-saas': React.lazy(
    () =>
      import('../components/diagrams/composed/MultiTenantSaaSDiagram').then(
        (m) => ({ default: m.MultiTenantSaaSDiagram }),
      ),
  ),
  'whatsapp-infrastructure': React.lazy(
    () =>
      import('../components/diagrams/composed/WhatsAppInfrastructureDiagram').then(
        (m) => ({ default: m.WhatsAppInfrastructureDiagram }),
      ),
  ),
  'healthcare-workflow': React.lazy(
    () =>
      import('../components/diagrams/composed/HealthcareWorkflowDiagram').then(
        (m) => ({ default: m.HealthcareWorkflowDiagram }),
      ),
  ),
  'deployment-infrastructure': React.lazy(
    () =>
      import('../components/diagrams/composed/DeploymentInfrastructureDiagram').then(
        (m) => ({ default: m.DeploymentInfrastructureDiagram }),
      ),
  ),
};

// ---------------------------------------------------------------------------
// Diagram fallback rendered by the inner ErrorBoundary
// ---------------------------------------------------------------------------

function DiagramErrorFallback() {
  return <Placeholder field="diagram" />;
}

// ---------------------------------------------------------------------------
// RichText renderer — renders string content or a Placeholder
// ---------------------------------------------------------------------------

interface ProseFieldProps {
  value: unknown;
  fieldName: string;
}

function ProseField({ value, fieldName }: ProseFieldProps) {
  if (isPlaceholder(value)) {
    return <Placeholder field={(value as { __field: string }).__field} />;
  }
  if (typeof value === 'string') {
    return <p>{value}</p>;
  }
  if (Array.isArray(value)) {
    // RichTextNode[] — render each node's text
    return (
      <>
        {(value as Array<{ text?: string }>).map((node, i) => (
          <p key={i}>{node.text ?? ''}</p>
        ))}
      </>
    );
  }
  return <Placeholder field={fieldName} />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ArchitectureTopicPage() {
  const { slug } = useParams<{ slug: string }>();

  const topic = architectureTopics.find((t) => t.slug === slug);

  // Unknown slug → 404
  if (!topic) {
    return <NotFoundPage />;
  }

  // Resolve diagram component from registry
  const DiagramComponent = topic.diagramId ? diagramRegistry[topic.diagramId] : null;

  // Resolve related case study entries
  const relatedCaseStudies = topic.relatedCaseStudySlugs
    .map((csSlug) => caseStudies.find((cs) => cs.slug === csSlug))
    .filter((cs): cs is NonNullable<typeof cs> => cs !== undefined);

  return (
    <div className="route-page-main">
      <RouteSEO
        routeKey="architectureTopic"
        overrides={{
          title: `${topic.title} — Architecture · Aniket Kushwaha`,
          canonical: `https://aniketkushwaha.dev/architecture/${topic.slug}`,
          og: {
            title: `${topic.title} — Architecture · Aniket Kushwaha`,
            description: isPlaceholder(topic.summary)
              ? 'An in-depth architecture topic with custom diagrams.'
              : (topic.summary as string),
            image: 'https://aniketkushwaha.dev/favicon-512.png',
            type: 'article',
            url: `https://aniketkushwaha.dev/architecture/${topic.slug}`,
          },
          twitter: {
            card: 'summary_large_image',
            title: `${topic.title} — Architecture · Aniket Kushwaha`,
            description: isPlaceholder(topic.summary)
              ? 'An in-depth architecture topic with custom diagrams.'
              : (topic.summary as string),
            image: 'https://aniketkushwaha.dev/favicon-512.png',
            site: '@aniketkushwaha',
          },
        }}
      />

      <section aria-labelledby="topic-heading">
        <div className="container">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/architecture">Architecture</Link>
              </li>
              <li aria-current="page">{topic.title}</li>
            </ol>
          </nav>

          {/* Heading */}
          <h1 id="topic-heading">{topic.title}</h1>

          {/* Summary */}
          <p className="lead architecture-topic-summary">
            {isPlaceholder(topic.summary) ? (
              <Placeholder field={topic.summary.__field} />
            ) : (
              (topic.summary as string)
            )}
          </p>

          {/* Tags */}
          {topic.tags.length > 0 && (
            <ul className="tag-list" aria-label="Tags">
              {topic.tags.map((tag) => (
                <li key={tag} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Diagram — wrapped in inner ErrorBoundary */}
      <section aria-label="Architecture diagram" className="architecture-diagram-section">
        <div className="container">
          <ErrorBoundary fallback={<DiagramErrorFallback />}>
            {DiagramComponent ? (
              <React.Suspense fallback={<Placeholder field="diagram" />}>
                <DiagramComponent />
              </React.Suspense>
            ) : (
              <Placeholder field="diagram" />
            )}
          </ErrorBoundary>
        </div>
      </section>

      {/* Prose */}
      <section aria-labelledby="prose-heading" className="architecture-prose-section">
        <div className="container">
          <h2 id="prose-heading">About this architecture</h2>
          <div className="architecture-prose">
            {topic.prose !== undefined ? (
              <ProseField value={topic.prose} fieldName="prose" />
            ) : (
              <Placeholder field="prose" />
            )}
          </div>
        </div>
      </section>

      {/* Related case studies — rendered only when slugs exist */}
      {relatedCaseStudySlugs(topic).length > 0 && (
        <section
          aria-labelledby="related-case-studies-heading"
          className="related-case-studies-section"
        >
          <div className="container">
            <h2 id="related-case-studies-heading">Related case studies</h2>
            <ul className="related-case-studies-list">
              {relatedCaseStudies.map((cs) => (
                <li key={cs.slug} className="related-case-study-item">
                  <Link to={`/case-studies/${cs.slug}`}>
                    {isPlaceholder(cs.title) ? cs.slug : cs.title as string}
                  </Link>
                </li>
              ))}
              {/* Render slugs that had no matching case study entry as plain text */}
              {topic.relatedCaseStudySlugs
                .filter((s) => !caseStudies.find((cs) => cs.slug === s))
                .map((missingSlug) => (
                  <li key={missingSlug} className="related-case-study-item">
                    <Link to={`/case-studies/${missingSlug}`}>{missingSlug}</Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper — returns the effective related slugs from the topic
// ---------------------------------------------------------------------------
function relatedCaseStudySlugs(
  topic: (typeof architectureTopics)[number],
): string[] {
  return topic.relatedCaseStudySlugs;
}
