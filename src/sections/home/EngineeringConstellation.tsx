/**
 * EngineeringConstellation
 *
 * Premium expertise section built on the "sticky visual + scrolling list"
 * pattern (à la a pinned showcase): the constellation of six engineering
 * domains stays pinned on the left while the domain panels scroll naturally on
 * the right. As each panel crosses the viewport centre it becomes the active
 * domain — the matching node expands ~5% and its connection line to the core
 * illuminates smoothly. Nothing snaps; content is fed in by the scroll itself,
 * the next domain rising from the bottom as the current one lifts away. Metrics
 * count upward when their domain reaches centre.
 *
 * Desktop: the left column is `position: sticky`; the right column is a tall
 *          natural scroll. No scroll-jacking.
 * Mobile/touch: single column — the constellation sits on top, panels stack
 *          below, tapping a node scrolls to its panel.
 *
 * One accent only (#8B5CF6), surfaced exclusively during interaction.
 */
import React, { useEffect, useRef, useState } from 'react';
import { scrollToY } from '../../utils/smoothScroll';
import './EngineeringConstellation.css';

// ─────────────────────────────────────────────────────────────────────────────
// Domain model
// ─────────────────────────────────────────────────────────────────────────────

interface Metric {
  value: string;
  label: string;
}

interface Domain {
  id: string;
  title: string;
  category: string;
  sentence: string;
  architecture: string[];
  technologies: string[];
  capabilities: string[];
  featured: string;
  featuredSub: string;
  metrics: Metric[];
  icon: React.ReactNode;
  pos: { x: number; y: number };
}

const CORE = { x: 50, y: 50 };

const DOMAINS: Domain[] = [
  {
    id: 'backend',
    title: 'Backend Engineering',
    category: 'Platform',
    sentence: 'Production-grade distributed platforms designed for scale.',
    architecture: ['Client', 'API', 'Queue', 'Workers', 'Redis', 'MongoDB'],
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'BullMQ', 'OCI'],
    capabilities: ['Queue Processing', 'Multi-Tenant SaaS', 'RBAC', 'Event Driven'],
    featured: 'BVISIONR',
    featuredSub: 'Multi-tenant messaging backend',
    metrics: [
      { value: '40+', label: 'API endpoints' },
      { value: 'Zero', label: 'message loss' },
      { value: '3+', label: 'business clients' },
    ],
    icon: <path d="M4 7a8 3 0 1 0 16 0A8 3 0 1 0 4 7m0 0v10a8 3 0 0 0 16 0V7M4 12a8 3 0 0 0 16 0" />,
    pos: { x: 16, y: 30 },
  },
  {
    id: 'ai',
    title: 'AI Automation',
    category: 'Intelligence',
    sentence: 'Intelligent automation pipelines that stay observable and explainable.',
    architecture: ['User', 'Automation', 'Template', 'Inbox'],
    technologies: ['AI Campaigns', 'No-Code Builder', 'Webhooks', 'Socket.IO', 'Node.js'],
    capabilities: ['No-Code Automations', 'RBAC Inbox', 'Webhook Handling', 'Observability'],
    featured: 'BVISIONR · Automations',
    featuredSub: 'AI campaigns & no-code automation',
    metrics: [
      { value: '30+', label: 'operators enabled' },
      { value: '1,000+', label: 'msgs / campaign' },
      { value: 'AI', label: 'campaign gen' },
    ],
    icon: <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />,
    pos: { x: 50, y: 14 },
  },
  {
    id: 'distributed',
    title: 'Distributed Systems',
    category: 'Scale',
    sentence: 'Event-driven systems engineered for high-throughput messaging.',
    architecture: ['Producer', 'Broker', 'Workers', 'Cache', 'Store'],
    technologies: ['BullMQ', 'Redis', 'Socket.IO', 'Webhooks', 'Meta Cloud API'],
    capabilities: ['Backpressure', 'Idempotency', 'DLQ Recovery', 'Real-Time Analytics'],
    featured: 'BVISIONR · Messaging',
    featuredSub: 'Queue-based delivery pipeline',
    metrics: [
      { value: '1,000+', label: 'msgs / campaign' },
      { value: 'Zero', label: 'message loss' },
      { value: 'DLQ', label: 'recovery' },
    ],
    icon: <path d="M12 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm-6 11a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm12 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM12 9v3m0 0-5 3m5-3 5 3" />,
    pos: { x: 84, y: 30 },
  },
  {
    id: 'devops',
    title: 'DevOps & Infrastructure',
    category: 'Delivery',
    sentence: 'Observable, automated delivery from commit to production.',
    architecture: ['Git', 'CI', 'Docker', 'Cloud', 'Monitoring'],
    technologies: ['Docker', 'GitHub Actions', 'CI/CD', 'AWS EC2', 'OCI'],
    capabilities: ['Zero-Downtime Deploys', 'CI/CD Pipelines', 'Alerting', 'Security Hardening'],
    featured: 'Aura · Cloud Ops',
    featuredSub: 'Docker + GitHub Actions CI/CD',
    metrics: [
      { value: '99%+', label: 'uptime' },
      { value: '60%', label: 'faster deploys' },
      { value: 'CI/CD', label: 'GitHub Actions' },
    ],
    icon: <path d="m12 2 2.4 2-.6 3 2.8 1.3L20 7.8l1.4 2.4-2.2 2.1 2.2 2.1L20 16.8l-3.4-.5L17.2 19.3 14.4 20.6 12 22l-2.4-1.4-3-.3.6-3-2.8-1.3L4 13.2l2.2-2.1L4 9 5.4 6.6l3.4.5L8.2 4.1 11 2.8 12 2Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />,
    pos: { x: 84, y: 70 },
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Engineering',
    category: 'Product',
    sentence: 'Complete product surfaces from schema to polished interface.',
    architecture: ['React', 'API', 'Services', 'Database'],
    technologies: ['Next.js', 'React', 'TypeScript', 'MongoDB', 'Socket.IO'],
    capabilities: ['AI Matching', 'Role-Based Flows', 'Real-Time Updates', 'OTP Auth'],
    featured: 'StopSearch',
    featuredSub: '3 independent user flows',
    metrics: [
      { value: '3', label: 'user flows' },
      { value: 'Gemini', label: 'AI matching' },
      { value: 'E2E', label: 'tested' },
    ],
    icon: <path d="M8 6 2 12l6 6m8-12 6 6-6 6M14 4l-4 16" />,
    pos: { x: 50, y: 86 },
  },
  {
    id: 'healthcare',
    title: 'Healthcare Systems',
    category: 'Compliance',
    sentence: 'Audit-compliant clinical workflows for sensitive imaging data.',
    architecture: ['PACS', 'DICOM', 'Review', 'Report', 'Archive'],
    technologies: ['DICOM', 'Orthanc', 'MongoDB', 'Workflow Engine', 'Audit Logs'],
    capabilities: ['DICOM Handling', 'Case Assignment', 'Audit Logging', 'Traceability'],
    featured: 'Radique',
    featuredSub: 'Radiology workflow platform',
    metrics: [
      { value: '50+', label: 'diagnostic cases' },
      { value: '3+', label: 'radiology centres' },
      { value: 'Full', label: 'audit trail' },
    ],
    icon: <path d="M12 8v8m-4-4h8M7.5 3h9L21 7.5v9L16.5 21h-9L3 16.5v-9L7.5 3Z" />,
    pos: { x: 16, y: 70 },
  },
];

const N = DOMAINS.length;

// ─────────────────────────────────────────────────────────────────────────────
// Count-up — animates the leading number of a metric value, preserving suffix.
// ─────────────────────────────────────────────────────────────────────────────

const CountUp: React.FC<{ value: string; play: boolean }> = ({ value, play }) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value.trim());
    if (!match) {
      setDisplay(value);
      return undefined;
    }
    const suffix = match[2] ?? '';
    if (!play) {
      setDisplay(`0${suffix}`);
      return undefined;
    }
    const target = parseFloat(match[1]);
    const decimals = match[1].includes('.') ? 1 : 0;
    const duration = 900;
    let raf = 0;
    let start: number | null = null;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (start === null) start = now;
      const p = Math.min((now - start) / duration, 1);
      setDisplay(`${(target * easeOut(p)).toFixed(decimals)}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(`${target.toFixed(decimals)}${suffix}`);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, play]);

  return <span>{display}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// One domain panel (a tall block in the scrolling right column)
// ─────────────────────────────────────────────────────────────────────────────

interface PanelProps {
  domain: Domain;
  index: number;
  active: boolean;
  registerRef: (i: number, el: HTMLDivElement | null) => void;
}

const DomainPanel: React.FC<PanelProps> = ({ domain, index, active, registerRef }) => (
  <div
    className={`xc-panel ${active ? 'is-active' : ''}`}
    data-index={index}
    ref={(el) => registerRef(index, el)}
  >
    <div className="xc-panel__inner">
      <span className="xc-panel__index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="xc-panel__eyebrow">{domain.category}</span>
      <h3 className="xc-panel__title">{domain.title}</h3>
      <p className="xc-panel__sentence">{domain.sentence}</p>

      <div className="xc-panel__block xc-panel__block--arch">
        <span className="xc-panel__kicker">Architecture</span>
        <div className="xc-arch">
          {domain.architecture.map((step, i) => (
            <React.Fragment key={step}>
              {i > 0 && <span className="xc-arch__line" aria-hidden="true" />}
              <span className="xc-arch__step">
                <span className="xc-arch__dot" aria-hidden="true" />
                {step}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="xc-panel__block xc-panel__block--tech">
        <span className="xc-panel__kicker">Technologies</span>
        <div className="xc-chips">
          {domain.technologies.map((tech) => (
            <span key={tech} className="xc-chip">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="xc-panel__block xc-panel__block--caps">
        <span className="xc-panel__kicker">Capabilities</span>
        <ul className="xc-caps">
          {domain.capabilities.map((cap) => (
            <li key={cap} className="xc-cap">
              <span className="xc-cap__tick" aria-hidden="true" />
              {cap}
            </li>
          ))}
        </ul>
      </div>

      <div className="xc-panel__foot">
        <div className="xc-featured">
          <span className="xc-panel__kicker">Featured Project</span>
          <span className="xc-featured__name">{domain.featured}</span>
          <span className="xc-featured__sub">{domain.featuredSub}</span>
        </div>

        <div className="xc-metrics">
          {domain.metrics.map((metric) => (
            <div key={metric.label} className="xc-metric">
              <span className="xc-metric__value">
                <CountUp value={metric.value} play={active} />
              </span>
              <span className="xc-metric__label">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>

      <a className="xc-cta" href="/architecture">
        View Architecture
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Constellation (sticky left)
// ─────────────────────────────────────────────────────────────────────────────

const Constellation: React.FC<{
  activeIndex: number;
  onSelect: (i: number) => void;
}> = ({ activeIndex, onSelect }) => (
  <div className="xc-constellation">
    <svg className="xc-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {DOMAINS.map((d, i) => {
        const lit = i === activeIndex;
        const near = Math.abs(i - activeIndex) === 1 || Math.abs(i - activeIndex) === N - 1;
        return (
          <line
            key={d.id}
            className={`xc-line ${lit ? 'is-lit' : near ? 'is-near' : ''}`}
            x1={d.pos.x}
            y1={d.pos.y}
            x2={CORE.x}
            y2={CORE.y}
          />
        );
      })}
    </svg>

    <div className="xc-core" aria-hidden="true">
      <span className="xc-core__dot" />
    </div>

    {DOMAINS.map((d, i) => (
      <button
        key={d.id}
        type="button"
        className={`xc-node ${i === activeIndex ? 'is-active' : ''}`}
        style={{
          left: `${d.pos.x}%`,
          top: `${d.pos.y}%`,
          ['--xc-delay' as string]: `${(i % 3) * -2.3}s`,
        }}
        onClick={() => onSelect(i)}
        aria-pressed={i === activeIndex}
        aria-label={`${d.title} domain`}
      >
        <span className="xc-node__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {d.icon}
          </svg>
        </span>
        <span className="xc-node__title">{d.title}</span>
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Media query hook (SSR / jsdom safe)
// ─────────────────────────────────────────────────────────────────────────────

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────────────────────

export const EngineeringConstellation: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelEls = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  // Mobile-first: the constellation becomes a selector, a single compact panel
  // shows at a time, and the domains auto-advance with a slide.
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const registerRef = (i: number, el: HTMLDivElement | null) => {
    panelEls.current[i] = el;
  };

  // Track whether the section is on screen (gates mobile autoplay).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Mobile autoplay — gently cycle domains while the section is in view. The
  // dependency on activeIndex resets the timer after every change (including
  // taps), so a tap pauses the rotation for one full interval.
  useEffect(() => {
    if (!isMobile || reducedMotion || !inView) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % N);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isMobile, reducedMotion, inView, activeIndex]);

  // Desktop only: the active domain is whichever panel crosses the viewport
  // centre. On mobile there is one panel at a time, driven by taps / autoplay.
  useEffect(() => {
    if (isMobile) return undefined;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      // A zero-height band at the viewport centre — exactly one (contiguous)
      // panel intersects it at a time, so the active domain tracks the scroll.
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    const els = panelEls.current.filter((el): el is HTMLDivElement => el !== null);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isMobile]);

  // Node click — desktop scrolls the panel to centre; mobile just swaps it.
  const handleSelect = (i: number) => {
    setActiveIndex(i);
    if (isMobile) return;
    const el = panelEls.current[i];
    if (!el || typeof window === 'undefined') return;
    const rect = el.getBoundingClientRect();
    const y = rect.top + window.scrollY - (window.innerHeight - el.offsetHeight) / 2;
    if (!scrollToY(Math.max(0, y), { duration: 0.8 })) {
      window.scrollTo(0, Math.max(0, y));
    }
  };

  return (
    <section id="tech" className="xc" aria-labelledby="xc-heading" ref={sectionRef}>
      <div className="xc__inner">
        <div className="xc__layout">
          <div className="xc__left">
            <header className="xc__head">
              <span className="xc__eyebrow">
                <span className="xc__eyebrow-line" aria-hidden="true" />
                Engineering Expertise
              </span>
              <h2 id="xc-heading" className="xc__heading">
                An engineering constellation
              </h2>
            </header>

            <Constellation activeIndex={activeIndex} onSelect={handleSelect} />
            <div className="xc__rail" aria-hidden="true">
              {DOMAINS.map((d, i) => (
                <span key={d.id} className={`xc__rail-tick ${i === activeIndex ? 'is-active' : ''}`} />
              ))}
            </div>
          </div>

          <div className="xc__right">
            {isMobile ? (
              <DomainPanel
                key={`m-${activeIndex}`}
                domain={DOMAINS[activeIndex]}
                index={activeIndex}
                active
                registerRef={() => {}}
              />
            ) : (
              DOMAINS.map((d, i) => (
                <DomainPanel
                  key={d.id}
                  domain={d}
                  index={i}
                  active={i === activeIndex}
                  registerRef={registerRef}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineeringConstellation;
