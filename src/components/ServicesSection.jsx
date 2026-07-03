/**
 * ServicesSection — Engineering Expertise
 *
 * Rebranded for engineering positioning per Requirements 2.1, 14.4.
 * All legacy freelance copy has been replaced with engineering-expertise
 * descriptions covering backend, platform, AI automation, and distributed systems.
 *
 * NOTE: This file remains .jsx per Requirements 12.3. The new TSX
 * CoreExpertiseSection is the canonical design-system version; this file
 * provides the legacy scroll-page integration point. It will be superseded
 * when App.jsx is migrated to use HomePage.tsx (Phase 8 completion).
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './ServicesSection.css';

const services = [
  {
    id: 'backend-platform',
    title: 'Backend & Platform Engineering',
    description:
      'Design and build production-grade backend services, APIs, and platform infrastructure. From database schema and auth layers to event-driven microservices, I architect systems that handle real load with operational clarity.',
    deliverables: [
      'REST / GraphQL APIs with rate-limiting, auth, and observability',
      'Event-driven architecture using queues, pub/sub, and workers',
      'Multi-environment deployments on AWS, Railway, Fly.io, or Render',
    ],
    cta: {
      label: 'Discuss your system',
      link: '#contact',
    },
  },
  {
    id: 'distributed-systems',
    title: 'Distributed Systems & Infrastructure',
    description:
      'Architect multi-tenant SaaS platforms, distributed messaging pipelines, and deployment infrastructure. I identify the failure modes early and design for resilience, scalability, and maintainability from the start.',
    deliverables: [
      'Distributed messaging, queue-based, and event-driven system design',
      'Multi-tenant isolation strategies and RBAC patterns',
      'CI/CD pipelines, IaC, and rollout safeguards',
    ],
    cta: {
      label: 'Talk architecture',
      link: '#contact',
    },
  },
  {
    id: 'ai-automation',
    title: 'AI Automation & Integration',
    description:
      'Build reliable AI automation pipelines, LLM integrations, and agentic workflows. I focus on production reliability — deterministic fallbacks, observability, and cost-aware routing — so AI features ship with confidence.',
    deliverables: [
      'LLM routing, prompt engineering, and inference pipelines',
      'Workflow automation with reliable retry / fallback handling',
      'Third-party AI/data integrations with monitoring and alerting',
    ],
    cta: {
      label: 'Explore automation',
      link: '#contact',
    },
  },
  {
    id: 'performance-reliability',
    title: 'Performance, Security & Reliability',
    description:
      'Keep mission-critical platforms fast, secure, and auditable. I implement Core Web Vitals optimizations, security hardening, and observability so your engineering team can focus on shipping features.',
    deliverables: [
      'Core Web Vitals optimization and bundle-size audits',
      'Security reviews, access policies, and compliance-ready logging',
      'Incident response, observability stack, and on-call runbooks',
    ],
    cta: {
      label: 'Book a strategy call',
      link: '#contact',
    },
  },
];

const ServicesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  return (
    <section id="services" className="services" ref={ref}>
      <div className="section-container">
        <motion.div
          className="services-headline"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="section-eyebrow">Engineering Expertise</span>
          <h2 className="section-title">
            Backend depth, platform thinking, and AI automation
          </h2>
          <p className="section-subtitle">
            Every engagement starts with understanding the system&apos;s constraints
            and growth trajectory. I own the engineering roadmap from design
            through to production — with a focus on reliability and maintainability.
          </p>
        </motion.div>

        <motion.div
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {services.map(service => (
            <motion.article
              key={service.id}
              className="service-card"
              variants={cardVariants}
              whileHover={{
                translateY: -6,
                boxShadow: '0 24px 48px rgba(10, 15, 35, 0.35)',
              }}
            >
              <div className="service-card-body">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.deliverables.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <motion.a
                href={service.cta.link}
                className="service-cta"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {service.cta.label}
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

export default ServicesSection;
