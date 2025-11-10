import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './ServicesSection.css';

const services = [
  {
    id: 'mern-products',
    title: 'End-to-End MERN Product Development',
    description:
      'Design, build, and launch full-stack products with React, Node.js, Express, and MongoDB. I partner as your technical co-founder, shipping pixel-perfect UI, resilient APIs, and automated CI/CD so you can scale faster.',
    deliverables: [
      'Architecture, component library, and design systems',
      'Secure REST/GraphQL APIs with automated testing',
      'Multi-environment deployments on AWS, Render, or Netlify',
    ],
    cta: {
      label: 'Plan your build',
      link: '#contact',
    },
  },
  {
    id: 'modernization',
    title: 'Full-Stack Modernization & Migration',
    description:
      'Refactor legacy stacks into modern MERN applications. I untangle monoliths, migrate data, and deliver performance-focused frontends without interrupting business-critical traffic.',
    deliverables: [
      'Audit of codebase, DX, and infrastructure bottlenecks',
      'Incremental migration strategies that avoid downtime',
      'Advanced caching, observability, and rollout safeguards',
    ],
    cta: {
      label: 'Request an audit',
      link: '#contact',
    },
  },
  {
    id: 'api-integrations',
    title: 'API Engineering & Third-Party Integrations',
    description:
      'Ship battle-tested Express and serverless APIs, or integrate critical platforms (Stripe, Razorpay, WhatsApp, Supabase). I own schema design, auth, monitoring, and documentation.',
    deliverables: [
      'REST/GraphQL services with rate limiting and security hardening',
      'Webhook, payment, CRM, and analytics integrations',
      'Developer-first documentation and post-deployment support',
    ],
    cta: {
      label: 'Secure your ecosystem',
      link: '#contact',
    },
  },
  {
    id: 'performance-scale',
    title: 'Performance, Security & DevOps Retainers',
    description:
      'Keep mission-critical MERN platforms fast and secure. I implement Core Web Vitals wins, introduce observability, and automate releases so your team focuses on growth.',
    deliverables: [
      'Core Web Vitals optimization and Lighthouse 100s',
      'Security reviews, access policies, and compliance-ready logging',
      'CI/CD pipelines, backup strategies, and on-call response',
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
          <span className="section-eyebrow">Services & Engagements</span>
          <h2 className="section-title">
            Full-stack MERN expertise tailored to founders, scaleups, and agencies
          </h2>
          <p className="section-subtitle">
            Every engagement pairs product strategy with production-ready engineering.
            Choose the track that aligns with your roadmap and I will own discovery,
            delivery, and long-term support.
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
