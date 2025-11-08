import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Portfolio.css';

const projectShowcase = [
  {
    id: 'auratech',
    name: 'AuraTech Services',
    focus: 'Laptop Rental & Sales Platform',
    tagline: 'Unified storefront and ops layer for device rentals and purchases.',
    blurb:
      'Commerce stack covering instant quotes, bookings, and secure checkout for rentals and sales.',
    details: [
      'Razorpay payments across UPI, cards, and EMI with guarded fallbacks.',
      'WhatsApp quote automation using Baileys.js.',
      'Admin console with catalog and pricing controls.',
    ],
    impact:
      '80% of manual booking work removed, keeping ops teams responsive and consistent.',
    stack: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'Razorpay',
      'Baileys.js',
      'JWT',
      'Google OAuth',
      'AWS EC2',
      'Netlify',
      'GitHub Actions',
    ],
    cover:
      "import newImg from '../assets/aura.png';",
    liveLink: 'https://auratechservices.in',
  },
  {
    id: 'market-intel',
    name: 'Market Intelligence & LeadAutomation',
    focus: 'Project Parallax™',
    tagline: 'AI-first lead intelligence across LinkedIn, Reddit, Twitter, and Quora.',
    blurb:
      'LLM-powered lead radar that scrapes conversations, scores intent, and launches outreach.',
    details: [
      'GPT-4o and HuggingFace blend rate intent and sentiment.',
      'RL experiments tune channel, copy, and cadence automatically.',
      'React + Supabase console tracks cohorts and engagement.',
    ],
    impact:
      '3× lift in lead-to-demo conversions while staying API-fee free (saving $850+/month).',
    stack: [
      'React.js',
      'Supabase',
      'Node.js',
      'Python',
      'GPT-4o',
      'HuggingFace',
      'WhatsApp Automation',
      'Reinforcement Learning',
    ],
    cover:
      'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1200&q=80',
    liveLink: null,
  },
  {
    id: 'analytics-dashboard',
    name: 'Data Analytics Control Tower',
    focus: 'Operations Intelligence Hub',
    tagline: 'Real-time dashboards, drill-down charts, and anomaly alerts.',
    blurb:
      'Live dashboards that merge KPIs, cohorts, and health signals for quick decisions.',
    details: [
      'JWT-secured gateway for APIs and event streams.',
      'Adaptive chart packs with export-ready snapshots.',
      'Streaming updates keep ops teams on live numbers.',
    ],
    impact:
      'Reporting cycles dropped 60% by trading spreadsheets for live insights.',
    stack: ['React', 'TypeScript', 'JWT Auth', 'REST APIs', 'MongoDB', 'Recharts'],
    cover:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    liveLink: null,
  },
  {
    id: 'dessert-safari',
    name: 'DessertSafari',
    focus: 'D2C E-Commerce Launch',
    tagline: 'Mobile-first storefront with conversion-tuned flows for dessert fans.',
    blurb:
      'Dessert storefront with mobile-first merchandising and checkout journeys.',
    details: [
      'Guest, registered, and subscription checkout paths.',
      'Headless content layer for bundles and promos.',
      'Fraud-aware auth with passwordless recovery.',
    ],
    impact:
      'Production launch in four weeks with zero support escalations through month one.',
    stack: ['React.js', 'REST APIs', 'MongoDB', 'Stripe', 'Cloudinary'],
    cover:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    liveLink: null,
  },
];

const Portfolio = () => {
  const [activeId, setActiveId] = useState(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section id="portfolio" className="portfolio" ref={ref}>
      <div className="section-container">
        <motion.div
          className="portfolio-intro"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="portfolio-eyebrow">Projects · Built For Impact</span>
          <h2 className="section-title">Product Engineering That Ships Outcomes</h2>
          <p className="section-subtitle">
            Each build blends research, design, and resilient engineering so teams can
            launch faster and operate smarter.
          </p>
        </motion.div>

        <div className="portfolio-panels">
          {projectShowcase.map((project, index) => {
            const isActive = project.id === activeId;
            return (
              <motion.article
                key={project.id}
                className={`portfolio-panel ${isActive ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveId(project.id)}
                onFocus={() => setActiveId(project.id)}
                onMouseLeave={() => setActiveId(null)}
                onBlur={event => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setActiveId(null);
                  }
                }}
                tabIndex={0}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <figure className="panel-cover">
                  <img src={project.cover} alt={project.name} loading="lazy" />
                </figure>

                <header className="panel-header">
                  <span className="panel-index">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.focus}</p>
                  </div>
                </header>
                <p className="panel-tagline">{project.tagline}</p>

                <div className={`panel-details ${isActive ? 'is-visible' : ''}`}>
                  <p className="panel-blurb">{project.blurb}</p>

                  <div className="panel-meta">
                    <ul className="panel-points">
                      {project.details.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="panel-impact">{project.impact}</p>
                  </div>

                  <footer className="panel-footer">
                    <div className="panel-stack">
                      {project.stack.slice(0, 6).map(tech => (
                        <span key={`${project.id}-${tech}`} className="panel-chip">
                          {tech}
                        </span>
                      ))}
                      {project.stack.length > 6 && <span className="panel-chip">+ more</span>}
                    </div>
                    {project.liveLink && (
                      <a
                        className="panel-link"
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Live
                      </a>
                    )}
                  </footer>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
