/**
 * ArchitectureIndexPage — /architecture route.
 *
 * Lists every Architecture Topic with premium card styling.
 *
 * Validates: Requirements 1.4, 5.1, 14.1
 */

import { Link } from 'react-router-dom';
import { RouteSEO } from '../app/SEO/RouteSEO';
import { architectureTopics } from '../content/architectureTopics';
import { isPlaceholder } from '../utils/placeholder';
import { Placeholder } from '../sections/shared/Placeholder';

export default function ArchitectureIndexPage() {
  return (
    <div className="route-page-main">
      <RouteSEO routeKey="architectureIndex" />

      {/* Page hero */}
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-eyebrow">Architecture</span>
          <h1>System Design &amp; Architecture</h1>
          <p className="page-hero-subtitle">
            Custom diagrams and in-depth write-ups exploring distributed systems,
            AI routing, multi-tenant SaaS, and more.
          </p>
        </div>
      </div>

      {/* Topic cards */}
      <section aria-labelledby="architecture-topics-heading">
        <div className="container">
          <h2 id="architecture-topics-heading" className="sr-only">Architecture Topics</h2>
          <ul
            className="architecture-index-list"
            aria-label="Architecture topics"
            style={{ marginTop: 0 }}
          >
            {architectureTopics.map((topic) => (
              <li key={topic.slug} className="architecture-index-item">
                <article aria-labelledby={`topic-title-${topic.slug}`}>
                  <h2 id={`topic-title-${topic.slug}`}>
                    <Link to={`/architecture/${topic.slug}`}>{topic.title}</Link>
                  </h2>

                  <p className="architecture-index-summary">
                    {isPlaceholder(topic.summary) ? (
                      <Placeholder field={topic.summary.__field} />
                    ) : (
                      topic.summary
                    )}
                  </p>

                  {topic.tags.length > 0 && (
                    <ul className="tag-list" aria-label="Tags">
                      {topic.tags.map((tag) => (
                        <li key={tag}>
                          <span className="tag-chip">{tag}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    to={`/architecture/${topic.slug}`}
                    className="architecture-index-link"
                    aria-label={`View ${topic.title} architecture topic`}
                  >
                    Explore →
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
