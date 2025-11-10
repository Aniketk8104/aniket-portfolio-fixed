import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './InsightsSection.css';

const insights = [
  {
    slug: 'hire-mern-stack-developer-checklist',
    title: 'Checklist: Hire a Freelance MERN Stack Developer Who Ships Revenue',
    description:
      '10 questions founders should ask before signing a contract—covering architecture, delivery, security, and post-launch support.',
    readingTime: '6 min read',
    url: '/blog/hire-mern-stack-developer-checklist.html',
    tags: ['MERN', 'Freelance', 'Playbook'],
    published: 'Nov 2025',
  },
  {
    slug: 'mern-performance-playbook',
    title: 'Coming Soon: MERN Performance Playbook for Core Web Vitals 100s',
    description:
      'Step-by-step guide to squeeze the last millisecond from your React + Node stack while keeping DX joyful.',
    readingTime: 'Guide in progress',
    url: '#contact',
    tags: ['Performance', 'Core Web Vitals'],
    published: 'Join the waitlist',
  },
  {
    slug: 'scaleup-devops-automation',
    title: 'Coming Soon: DevOps Automation Blueprint for Scaleups',
    description:
      'CI/CD, observability, and rollback patterns tailored to lean teams shipping weekly in production.',
    readingTime: 'Guide in progress',
    url: '#contact',
    tags: ['DevOps', 'Automation'],
    published: 'Join the waitlist',
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
          <span className="section-eyebrow">Insights & Playbooks</span>
          <h2 className="section-title">
            Actionable guides for founders hiring MERN and full-stack talent
          </h2>
          <p className="section-subtitle">
            Subscribe to stay ahead of architecture, performance, and delivery best practices.
            Each guide is written after shipping production work with real clients.
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
                href={insight.url}
                className="insight-cta"
                whileHover={{ x: 4 }}
                whileTap={{ x: 0 }}
              >
                {index === 0 ? 'Read the guide' : 'Join the early access list'}
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
