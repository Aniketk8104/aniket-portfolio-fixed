/**
 * CaseStudyPage — `/case-studies/:slug` route.
 *
 * Resolves the :slug param against `caseStudies`. If found, renders a premium
 * "case study" layout: hero header with stat columns, a feature banner, key
 * metrics, an architecture diagram, a gallery, and the nine canonical content
 * sections (Overview, Context, Problem, Constraints, Architecture, Key
 * Decisions, Tradeoffs, Outcomes, Lessons). Each section renders authored
 * content when present or a <Placeholder/> when unset — never fabricated.
 *
 * Embeds the composed diagram (looked up by `entry.diagramId`) when the entry
 * references one. The diagram is wrapped in an inner ErrorBoundary so a
 * diagram crash does not break the rest of the page.
 *
 * Renders metric tiles when `entry.metrics` is set and non-empty.
 *
 * Unknown slugs render <NotFoundPage />.
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';

import { RouteSEO } from '../app/SEO/RouteSEO';
import { caseStudies } from '../content/caseStudies';
import { projects } from '../content/projects';
import { isPlaceholder } from '../utils/placeholder';
import { Placeholder } from '../sections/shared/Placeholder';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFoundPage from './NotFoundPage';
import { Tag, MetricTile } from '../components/ui';
import type { RichText, GalleryImage } from '../types/content';
import './CaseStudyPage.css';

// ---------------------------------------------------------------------------
// Diagram registry — maps diagramId → lazy React component (Req 6.5)
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
// Sub-components
// ---------------------------------------------------------------------------

/** Fallback rendered by the inner ErrorBoundary around the diagram. */
function DiagramErrorFallback() {
  return <Placeholder field="diagram" />;
}

/**
 * Renders a RichText value (string, RichTextNode[], or Placeholder).
 * Never fabricates content — falls back to <Placeholder> for unset fields.
 */
interface ProseFieldProps {
  value: RichText | { __field: string } | undefined;
  fieldName: string;
}

function ProseField({ value, fieldName }: ProseFieldProps) {
  if (value === undefined) {
    return <Placeholder field={fieldName} />;
  }
  if (isPlaceholder(value)) {
    return <Placeholder field={(value as { __field: string }).__field} />;
  }
  if (typeof value === 'string') {
    return <p className="csp-prose-body">{value}</p>;
  }
  if (Array.isArray(value)) {
    return (
      <>
        {(value as Array<{ type?: string; content?: string; children?: Array<{ content?: string }> }>).map(
          (node, i) => {
            const text = node.content ?? (node.children?.map((c) => c.content ?? '').join('') ?? '');
            return (
              <p key={i} className="csp-prose-body">
                {text}
              </p>
            );
          },
        )}
      </>
    );
  }
  return <Placeholder field={fieldName} />;
}

/** Renders a single case study content section with a heading and prose. */
interface CaseSectionProps {
  id: string;
  heading: string;
  value: RichText | { __field: string } | undefined;
  fieldName: string;
}

function CaseSection({ id, heading, value, fieldName }: CaseSectionProps) {
  return (
    <section aria-labelledby={id} className="csp-content-section">
      <h2 id={id} className="csp-content-section__title">
        {heading}
      </h2>
      <ProseField value={value} fieldName={fieldName} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();

  const entry = caseStudies.find((cs) => cs.slug === slug);

  // Unknown slug → 404 (Req 1.4)
  if (!entry) {
    return <NotFoundPage />;
  }

  // Resolve diagram component from registry iff diagramId is set (Req 6.5)
  const DiagramComponent =
    entry.diagramId != null ? diagramRegistry[entry.diagramId] ?? null : null;

  // Resolve display values, handling Placeholder<T> transparently
  const displayTitle = entry.title;
  const displaySummary = isPlaceholder(entry.summary)
    ? 'A detailed engineering case study.'
    : (entry.summary as string);

  // Gallery: authored images only — no demo/fallback filler.
  const galleryImages: GalleryImage[] = entry.gallery ?? [];

  // Feature banner uses the associated project's cover thumbnail when set,
  // so the hero image stays the canonical cover — not a gallery screenshot.
  const coverProject = projects.find((p) => p.slug === entry.projectSlug);
  const bannerImage: GalleryImage | undefined = coverProject?.thumbnail
    ? { src: coverProject.thumbnail, alt: `${entry.title} — cover` }
    : galleryImages[0];

  const ORIGIN = 'https://aniketkushwaha.dev';

  const stats: Array<{ label: string; node: React.ReactNode }> = [
    { label: 'Project', node: entry.projectSlug },
    {
      label: 'Role',
      node: isPlaceholder(entry.role) ? (
        <Placeholder field={entry.role.__field} />
      ) : (
        (entry.role as string)
      ),
    },
    {
      label: 'Duration',
      node: isPlaceholder(entry.duration) ? (
        <Placeholder field={entry.duration.__field} />
      ) : (
        (entry.duration as string)
      ),
    },
  ];

  return (
    <div className="route-page-main csp-page">
      {/* Per-route SEO with per-entry overrides (Req 14.1) */}
      <RouteSEO
        routeKey="caseStudy"
        overrides={{
          title: `${displayTitle} — Case Study · Aniket Kushwaha`,
          canonical: `${ORIGIN}/case-studies/${entry.slug}`,
          og: {
            title: `${displayTitle} — Case Study · Aniket Kushwaha`,
            description: displaySummary,
            image: `${ORIGIN}/favicon-512.png`,
            type: 'article',
            url: `${ORIGIN}/case-studies/${entry.slug}`,
          },
          twitter: {
            card: 'summary_large_image',
            title: `${displayTitle} — Case Study · Aniket Kushwaha`,
            description: displaySummary,
            image: `${ORIGIN}/favicon-512.png`,
            site: '@aniketkushwaha',
          },
        }}
      />

      <div className="csp-shell">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="csp-breadcrumb">
          <ol>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li aria-hidden="true" className="csp-sep">
              /
            </li>
            <li>
              <Link to="/case-studies">Case Studies</Link>
            </li>
            <li aria-hidden="true" className="csp-sep">
              /
            </li>
            <li aria-current="page">{displayTitle}</li>
          </ol>
        </nav>

        {/* Hero / header */}
        <header className="csp-hero">
          <span className="csp-eyebrow">Case Study</span>

          <h1 className="csp-title">{displayTitle}</h1>

          <p className="csp-summary">{displaySummary}</p>

          {/* Stat columns with hairline dividers */}
          <div className="csp-stats">
            {stats.map((stat) => (
              <div className="csp-stat" key={stat.label}>
                <span className="csp-stat__label">{stat.label}</span>
                <p className="csp-stat__value">{stat.node}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="csp-tags" aria-label="Case study tags">
              {entry.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}

          {/* Live site link (when the associated project has one) */}
          {coverProject?.liveUrl && (
            <a
              className="csp-live"
              href={coverProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit the live ${displayTitle} site (opens in a new tab)`}
            >
              Visit live site
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.333 7h9.334M7.583 3.5 11.083 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </header>

        {/* Feature banner — only when a cover image exists */}
        {bannerImage && (
          <div className="csp-banner">
            <img
              className="csp-banner__img"
              src={bannerImage.src}
              alt={bannerImage.alt}
              loading="lazy"
            />
            <span className="csp-banner__scrim" aria-hidden="true" />
          </div>
        )}

        {/* Metrics — rendered only when supplied; never fabricated (Req 6.4) */}
        {entry.metrics && entry.metrics.length > 0 && (
          <section aria-labelledby="metrics-heading" className="csp-section">
            <div className="csp-section__head">
              <span className="csp-section__index" aria-hidden="true">
                01
              </span>
              <h2 id="metrics-heading" className="csp-section__title">
                Key Metrics
              </h2>
            </div>
            <div className="csp-metrics-grid">
              {entry.metrics.map((metric, idx) => (
                <MetricTile
                  key={idx}
                  label={metric.label}
                  value={metric.value}
                  unit={metric.unit}
                  tone={metric.tone ?? 'neutral'}
                />
              ))}
            </div>
          </section>
        )}

        {/* Diagram — iff entry.diagramId != null (Req 6.5) */}
        {DiagramComponent !== null && (
          <section aria-labelledby="diagram-heading" className="csp-section">
            <div className="csp-section__head">
              <span className="csp-section__index" aria-hidden="true">
                02
              </span>
              <h2 id="diagram-heading" className="csp-section__title">
                Architecture Diagram
              </h2>
            </div>
            <div className="csp-diagram">
              <ErrorBoundary fallback={<DiagramErrorFallback />}>
                <React.Suspense fallback={<Placeholder field="diagram" />}>
                  <DiagramComponent />
                </React.Suspense>
              </ErrorBoundary>
            </div>
          </section>
        )}

        {/* Gallery — authored images only (no demo/fallback filler) */}
        {galleryImages.length > 0 && (
          <section aria-labelledby="gallery-heading" className="csp-section">
            <div className="csp-section__head">
              <span className="csp-section__index" aria-hidden="true">
                03
              </span>
              <h2 id="gallery-heading" className="csp-section__title">
                Gallery
              </h2>
            </div>
            <div className="csp-gallery-grid">
              {galleryImages.map((image, idx) => (
                <figure key={idx} className="csp-gallery__item">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="csp-gallery__img"
                  />
                  {image.caption && (
                    <figcaption className="csp-gallery__caption">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Nine canonical case study sections (Req 6.2, 6.3) */}
        <div className="csp-prose">
          <div className="csp-prose__column">
            <CaseSection
              id="overview-heading"
              heading="Overview"
              value={entry.sections.overview}
              fieldName="overview"
            />
            <CaseSection
              id="context-heading"
              heading="Context"
              value={entry.sections.context}
              fieldName="context"
            />
            <CaseSection
              id="problem-heading"
              heading="Problem"
              value={entry.sections.problem}
              fieldName="problem"
            />
            <CaseSection
              id="constraints-heading"
              heading="Constraints"
              value={entry.sections.constraints}
              fieldName="constraints"
            />
            <CaseSection
              id="architecture-heading"
              heading="Architecture"
              value={entry.sections.architecture}
              fieldName="architecture"
            />
            <CaseSection
              id="decisions-heading"
              heading="Key Decisions"
              value={entry.sections.decisions}
              fieldName="decisions"
            />
            <CaseSection
              id="tradeoffs-heading"
              heading="Tradeoffs"
              value={entry.sections.tradeoffs}
              fieldName="tradeoffs"
            />
            <CaseSection
              id="outcomes-heading"
              heading="Outcomes"
              value={entry.sections.outcomes}
              fieldName="outcomes"
            />
            <CaseSection
              id="lessons-heading"
              heading="Lessons"
              value={entry.sections.lessons}
              fieldName="lessons"
            />
          </div>
        </div>

        {/* Back navigation */}
        <div className="csp-back">
          <Link to="/case-studies">← Back to Case Studies</Link>
        </div>
      </div>
    </div>
  );
}
