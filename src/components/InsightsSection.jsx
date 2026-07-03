import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './InsightsSection.css';

const insights = [
  {
    slug: 'multi-tenant-saas-architecture',
    title: 'Multi-Tenant SaaS: Isolation, Billing, and Data Architecture',
    description:
      'How to design tenant isolation, billing integrations, and data boundaries for production SaaS platforms — from schema design to runtime enforcement.',
    readingTime: '8 min read',
    url: '/writing/multi-tenant-saas-architecture',
    tags: ['SaaS', 'Architecture', 'Backend'],
    published: 'Coming Soon',
  },
  {
    slug: 'distributed-messaging-pipelines',
    title: 'Distributed Messaging Pipelines at Scale',
    description:
      'Queue design, consumer concurrency, dead-letter handling, and observability patterns for distributed messaging systems under real production load.',
    readingTime: '7 min read',
    url: '/writing/distributed-messaging-pipelines',
    tags: ['Messaging', 'Distributed Systems', 'BullMQ'],
    published: 'Coming Soon',
  },
  {
    slug: 'queue-based-system-design',
    title: 'Queue-Based System Design for Lean Engineering Teams',
    description:
      'CI/CD, observability, and rollback patterns tailored to lean teams shipping reliable backend systems in production every week.',
    readingTime: '6 min read',
    url: '/writing/queue-based-system-design',
    tags: ['System Design', 'Queues', 'Reliability'],
    published: 'Coming Soon',
  },
];

const InsightsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section id="insights" className="insights" ref={ref}>
      <div className="section-container">
        <motion.div
          className="insights-headline"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="section-eyebrow">Writing & Insights</span>
          <h2 className="section-title">
            Engineering essays on systems, architecture, and backend design
          </h2>
          <p className="section-subtitle">
            Deep dives on distributed systems, platform engineering, and AI automation — written after shipping production work.
          </p>
        </motion.div>

        <motion.div
          className="insights-grid"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {insights.map((insight, index) => (
            <motion.article
              key={insight.slug}
              className={`insight-card ${index === 0 ? 'is-live' : ''}`}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <div className="insight-meta">
                <span>{insight.published}</span>
                <span>•</span>
                <span>{insight.readingTime}</span>
              </div>
              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
              <div className="insight-tags" aria-label="Insight topics">
                {insight.tags.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <motion.a
                href="/writing"
                className="insight-cta"
                whileHover={{ x: 4 }}
                whileTap={{ x: 0 }}
              >
                View all writing
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 5L19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default InsightsSection;
