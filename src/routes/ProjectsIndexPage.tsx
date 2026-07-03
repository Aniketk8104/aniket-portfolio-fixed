/**
 * ProjectsIndexPage — `/projects` route.
 *
 * Full listing of every project with all required fields (title, role,
 * summary, tags) and the case-study link / "coming soon" affordance.
 * The home page uses the one-at-a-time Featured Work showcase; this index
 * lists the complete set as large, alternating Bhagwati-inspired project rows.
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 14.1
 */
import React from 'react';
import { motion } from 'framer-motion';
import { RouteSEO } from '../app/SEO/RouteSEO';
import { Tag, Badge } from '../components/ui';
import { Placeholder } from '../sections/shared/Placeholder';
import { isPlaceholder } from '../utils/placeholder';
import { projects } from '../content/projects';
import { fadeUp } from '../design-system/motionVariants';
import type { ProjectEntry } from '../content/projects';
import './ProjectsIndexPage.css';

const DOMAIN_LABEL: Record<string, string> = {
  bvisionr: 'SaaS · AI Messaging',
  radique: 'Healthcare · Workflow',
  'aura-tech-platform': 'Platform · Payments',
  stopsearch: 'Hiring · Dashboards',
  'labour-link': 'HRTech · Workforce',
};

/** Fallback cover used when a project has no thumbnail authored. */
const FALLBACK_COVER = '/projects/img/g2.png';

const ArrowIcon: React.FC = () => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 14 14" fill="none">
    <path
      d="M2.333 7h9.334M7.583 3.5 11.083 7l-3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProjectRow: React.FC<{ project: ProjectEntry; index: number }> = ({
  project,
  index,
}) => {
  const hasCaseStudy = project.caseStudySlug !== null;
  const reverse = index % 2 === 1;
  const cover = project.thumbnail ?? FALLBACK_COVER;

  return (
    <motion.article
      className={`pix-row${reverse ? ' pix-row--reverse' : ''}`}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="pix-row__media" data-cursor="view">
        <img
          className="pix-row__img"
          src={cover}
          alt={`${project.title} cover`}
          loading="lazy"
        />
        <span className="pix-row__scrim" aria-hidden="true" />
        {project.status === 'draft' && (
          <span className="pix-row__media-badge">
            <Badge variant="warning">In Progress</Badge>
          </span>
        )}
      </div>

      <div className="pix-row__body">
        <span className="pix-row__domain">
          {String(index + 1).padStart(2, '0')} ·{' '}
          {DOMAIN_LABEL[project.slug] ?? 'Engineering'}
        </span>

        <h2 className="pix-row__title">{project.title}</h2>

        <div className="pix-row__role">
          {isPlaceholder(project.role) ? (
            <Placeholder field={project.role.__field} />
          ) : (
            project.role
          )}
        </div>

        <p className="pix-row__summary">
          {isPlaceholder(project.summary) ? (
            <Placeholder field={project.summary.__field} />
          ) : (
            project.summary
          )}
        </p>

        {project.primaryTech.length > 0 && (
          <div className="pix-row__tags">
            {project.primaryTech.map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
        )}

        <footer className="pix-row__footer">
          {hasCaseStudy ? (
            <a
              href={`/case-studies/${project.caseStudySlug}`}
              className="pix-row__cta"
              aria-label={`Read case study for ${project.title}`}
            >
              View case study
              <ArrowIcon />
            </a>
          ) : (
            <span className="pix-row__soon">Case study coming soon</span>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              className="pix-row__live"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit the live ${project.title} site (opens in a new tab)`}
            >
              Visit live site
              <ArrowIcon />
            </a>
          )}
        </footer>
      </div>
    </motion.article>
  );
};

const ProjectsIndexPage: React.FC = () => (
  <div className="route-page-main">
    <RouteSEO routeKey="projects" />
    <div className="page-hero">
      <div className="container">
        <span className="page-hero-eyebrow">Portfolio</span>
        <h1>Engineering Projects</h1>
        <p className="page-hero-subtitle">
          Real-world systems built for scale, reliability, and business impact.
        </p>
      </div>
    </div>

    <div className="pix-list">
      {projects.map((project, index) => (
        <ProjectRow key={project.slug} project={project} index={index} />
      ))}
    </div>
  </div>
);

export default ProjectsIndexPage;
