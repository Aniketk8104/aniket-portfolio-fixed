import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import auraCover from '../assets/aura.png';
import parallaxIMG from '../assets/1.png';
import Analytics from '../assets/analytics.jpg';
import Dessert from '../assets/Dessert.jpg';
import './Portfolio.css';

const projectShowcase = [
  {
    id: 'auratech',
    name: 'AuraTech Services',
    focus: 'Laptop Rental & Sales Platform',
    tagline: 'Laptop rentals and sales guided through one responsive hub.',
    blurb:
      'Unified ordering, payments, and ops so teams manage devices without friction.',
    details: [
      'Razorpay checkout with resilient fallbacks.',
      'WhatsApp quotes automated via Baileys.js.',
      'Admin console keeps catalog and pricing tidy.',
    ],
    impact: 'Cuts manual booking effort by 80% and keeps ops fast.',
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
    cover: auraCover,
    liveLink: 'https://auratechservices.in',
  },
  {
    id: 'market-intel',
    name: 'Market Intelligence & LeadAutomation',
    focus: 'Project Parallax™',
    tagline: 'AI radar that spots and nurtures live buying signals.',
    blurb:
      'Scrapes social chatter, scores intent, and triggers targeted outreach in one flow.',
    details: [
      'GPT-4o + HuggingFace grade sentiment and fit.',
      'RL engine tunes channel, copy, and cadence.',
      'React + Supabase console tracks cohorts at a glance.',
    ],
    impact: '3× lift in lead-to-demo conversions while avoiding API spend.',
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
    cover: parallaxIMG,
    liveLink: null,
  },
  {
    id: 'analytics-dashboard',
    name: 'Data Analytics Control Tower',
    focus: 'Operations Intelligence Hub',
    tagline: 'Operations cockpit for real-time KPIs and alerts.',
    blurb:
      'Streaming dashboards fuse cohorts, anomalies, and health signals for instant decisions.',
    details: [
      'JWT gateway safeguards every data stream.',
      'Adaptive charts ship with exportable snapshots.',
      'Live feeds keep teams on fresh numbers.',
    ],
    impact: 'Reporting cycles shrank 60% versus spreadsheet workflows.',
    stack: ['React', 'TypeScript', 'JWT Auth', 'REST APIs', 'MongoDB', 'Recharts'],
    cover: Analytics,
    liveLink: null,
  },
  {
    id: 'dessert-safari',
    name: 'DessertSafari',
    focus: 'D2C E-Commerce Launch',
    tagline: 'Conversion-first D2C storefront for dessert loyalists.',
    blurb:
      'Mobile merchandising paired with tuned checkout flows for every buyer type.',
    details: [
      'Guest, member, and subscription checkout journeys.',
      'Headless promos power bundles and drops.',
      'Passwordless, fraud-aware auth keeps trust high.',
    ],
    impact: 'Launched in four weeks with zero support escalations.',
    stack: ['React.js', 'REST APIs', 'MongoDB', 'Stripe', 'Cloudinary'],
    cover: Dessert,
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
          <span className="section-eyebrow">Projects · Built For Impact</span>
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
