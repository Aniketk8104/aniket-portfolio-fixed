import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import auraCoverWebp from '../assets/aura.webp';
import parallaxIMGWebp from '../assets/1.webp';
import AnalyticsWebp from '../assets/analytics.webp';
import DessertWebp from '../assets/Dessert.webp';
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
  cover: auraCoverWebp,
  coverWebp: auraCoverWebp,
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
  cover: parallaxIMGWebp,
  coverWebp: parallaxIMGWebp,
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
  cover: AnalyticsWebp,
  coverWebp: AnalyticsWebp,
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
  cover: DessertWebp,
  coverWebp: DessertWebp,
    liveLink: null,
  },
];

const Portfolio = () => {
  const [activeId, setActiveId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const panelsRef = useRef(null);
  const segmentRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');
    const handleChange = event => {
      setIsMobile(event.matches);
      setIsAutoPlaying(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    setIsAutoPlaying(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setActiveId(null);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !panelsRef.current) {
      return undefined;
    }

    const container = panelsRef.current;
    const calculateSegment = () => {
      const segment = container.scrollWidth / 3;
      segmentRef.current = Number.isFinite(segment) ? segment : 0;
    };

    const positionAtMiddle = () => {
      if (!segmentRef.current) {
        calculateSegment();
      }

      if (segmentRef.current) {
        container.scrollLeft = segmentRef.current;
      }
    };

    const rafId = requestAnimationFrame(positionAtMiddle);
    const timeoutId = window.setTimeout(positionAtMiddle, 120);

    const handleResize = () => {
      calculateSegment();
      requestAnimationFrame(positionAtMiddle);
    };

    calculateSegment();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !isAutoPlaying || !panelsRef.current) {
      return undefined;
    }

    const container = panelsRef.current;
    const speedPerMs = 0.075;

    const step = timestamp => {
      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = timestamp - lastTimestampRef.current;
      container.scrollLeft += delta * speedPerMs;

      const segment = segmentRef.current;
      if (segment > 0 && container.scrollLeft >= segment * 2) {
        container.scrollLeft -= segment;
      }

      lastTimestampRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [isMobile, isAutoPlaying]);

  useEffect(() => {
    if (!isMobile || isAutoPlaying || activeId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      lastTimestampRef.current = null;
      setIsAutoPlaying(true);
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isMobile, isAutoPlaying, activeId]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => {
      if (prev && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (prev && lastTimestampRef.current !== null) {
        lastTimestampRef.current = null;
      }

      return prev ? false : prev;
    });
  }, []);

  const handleLoopScrollBounds = useCallback(() => {
    if (!isMobile || !panelsRef.current) {
      return;
    }

    const container = panelsRef.current;
    const segment = segmentRef.current;

    if (!segment) {
      return;
    }

    if (container.scrollLeft >= segment * 2) {
      container.scrollLeft -= segment;
    } else if (container.scrollLeft <= segment * 0.05) {
      container.scrollLeft += segment;
    }
  }, [isMobile]);

  const scrollCardIntoView = useCallback(element => {
    if (!isMobile || !panelsRef.current || !element) {
      return;
    }

    const container = panelsRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const offset = elementRect.left - containerRect.left;
    const targetScroll =
      container.scrollLeft + offset - (containerRect.width - elementRect.width) / 2;

    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }, [isMobile]);

  const handlePanelToggle = useCallback(
    (projectId, element) => {
      if (isMobile) {
        pauseAutoPlay();
      }

      setActiveId(prev => {
        const next = prev === projectId ? null : projectId;
        if (isMobile && element) {
          scrollCardIntoView(element);
        }
        return next;
      });
    },
    [isMobile, pauseAutoPlay, scrollCardIntoView],
  );

  const renderedProjects = isMobile
    ? Array.from({ length: projectShowcase.length * 3 }, (_, index) => {
        const project = projectShowcase[index % projectShowcase.length];
        const isDuplicate =
          index < projectShowcase.length || index >= projectShowcase.length * 2;
        return {
          project,
          baseIndex: index % projectShowcase.length,
          renderIndex: index,
          isDuplicate,
        };
      })
    : projectShowcase.map((project, index) => ({
        project,
        baseIndex: index,
        renderIndex: index,
        isDuplicate: false,
      }));

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
        <div
          className={`portfolio-panels${isMobile ? ' is-mobile' : ''}${
            isMobile && !isAutoPlaying ? ' is-paused' : ''
          }`}
          ref={panelsRef}
          onScroll={isMobile ? handleLoopScrollBounds : undefined}
          onTouchStart={isMobile ? pauseAutoPlay : undefined}
          onMouseDown={isMobile ? pauseAutoPlay : undefined}
          onPointerDown={isMobile ? pauseAutoPlay : undefined}
          onWheel={isMobile ? pauseAutoPlay : undefined}
        >
          {renderedProjects.map(({ project, baseIndex, renderIndex, isDuplicate }) => {
            const projectData = project;
            const isActive = projectData.id === activeId;
            const isPanelActive = !isDuplicate && isActive;
            const PanelComponent = motion.div;
            const baseProps = isDuplicate
              ? {
                  role: 'presentation',
                  tabIndex: -1,
                  'aria-hidden': true,
                  inert: '',
                }
              : {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': `Toggle project details for ${projectData.name}`,
                  'aria-expanded': isPanelActive,
                };
            return (
              <PanelComponent
                key={`${projectData.id}-${renderIndex}`}
                className={`portfolio-panel ${isDuplicate ? 'is-duplicate' : ''} ${
                  isPanelActive ? 'is-active' : ''
                }`}
                onMouseEnter={!isMobile ? () => setActiveId(projectData.id) : undefined}
                onFocus={!isMobile ? () => setActiveId(projectData.id) : undefined}
                onClick={
                  isDuplicate
                    ? undefined
                    : event => handlePanelToggle(projectData.id, event.currentTarget)
                }
                onKeyDown={
                  isDuplicate
                    ? undefined
                    : event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handlePanelToggle(projectData.id, event.currentTarget);
                        }
                      }
                }
                onMouseLeave={!isMobile ? () => setActiveId(null) : undefined}
                onBlur={event => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setActiveId(null);
                  }
                }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: baseIndex * 0.04 }}
                {...baseProps}
              >
                <figure className="panel-cover">
                  <picture>
                    {projectData.coverWebp && (
                      <source type="image/webp" srcSet={projectData.coverWebp} />
                    )}
                    <img
                      src={projectData.cover}
                      alt={projectData.name}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </figure>

                <header className="panel-header">
                  <span className="panel-index">{String(baseIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{projectData.name}</h3>
                    <p>{projectData.focus}</p>
                  </div>
                </header>
                <p className="panel-tagline">{projectData.tagline}</p>

                <div className={`panel-details ${isPanelActive ? 'is-visible' : ''}`}>
                  <p className="panel-blurb">{projectData.blurb}</p>

                  <div className="panel-meta">
                    <ul className="panel-points">
                      {projectData.details.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="panel-impact">{projectData.impact}</p>
                  </div>

                  <footer className="panel-footer">
                    <div className="panel-stack">
                      {projectData.stack.slice(0, 6).map(tech => (
                        <span key={`${projectData.id}-${tech}`} className="panel-chip">
                          {tech}
                        </span>
                      ))}
                      {projectData.stack.length > 6 && <span className="panel-chip">+ more</span>}
                    </div>
                    {projectData.liveLink && (
                      <a
                        className="panel-link"
                        href={projectData.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Live
                      </a>
                    )}
                  </footer>
                </div>
              </PanelComponent>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
