/**
 * AboutConstellation — a compact "engineering operating system" visual.
 *
 * Replaces avatars / illustrations in the About section. A soft glowing core
 * (the engineer's monogram) sits at the centre while five engineering-domain
 * nodes orbit around it on thin monoline connectors. Two faint orbit rings
 * rotate almost imperceptibly; nodes breathe gently. Hovering / focusing a node
 * grows it, brightens its connector, and reveals a tooltip.
 *
 * Fully data-driven: edit `DOMAINS` (or pass `domains`) to change the system.
 * Node positions are derived from the array length — no magic coordinates.
 *
 * @module sections/home/AboutConstellation
 */
import React, { useState } from 'react';
import './AboutConstellation.css';

export interface ConstellationDomain {
  id: string;
  /** Tiny title shown beneath the node icon. */
  title: string;
  /** One-word category surfaced in the hover tooltip. */
  category: string;
  /** SVG inner markup (24×24 viewBox, stroke = currentColor). */
  icon: React.ReactNode;
}

export interface AboutConstellationProps {
  /** Centre label (monogram). */
  core?: string;
  /** Orbiting engineering domains. Defaults to the five canonical ones. */
  domains?: ConstellationDomain[];
}

/** Canonical engineering domains — the identity, not a skill list. */
const DOMAINS: ConstellationDomain[] = [
  {
    id: 'backend',
    title: 'Backend Systems',
    category: 'Platform',
    icon: (
      <path d="M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2Zm0 0v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2" />
    ),
  },
  {
    id: 'platform',
    title: 'Platform Engineering',
    category: 'Infra',
    icon: <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Zm8 9.5L12 17l-8-4.5M20 17l-8 4.5L4 17" />,
  },
  {
    id: 'ai',
    title: 'AI Automation',
    category: 'Intelligence',
    icon: (
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m2.6-6.4 2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z" />
    ),
  },
  {
    id: 'product',
    title: 'Product Thinking',
    category: 'Mindset',
    icon: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z" />,
  },
  {
    id: 'scale',
    title: 'Scale & Reliability',
    category: 'Resilience',
    icon: <path d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4" />,
  },
];

const CORE = { x: 50, y: 50 };
const RADIUS = 37;

interface Positioned extends ConstellationDomain {
  x: number;
  y: number;
}

/** Evenly distribute domains on a circle, first node at the top. */
function layout(domains: ConstellationDomain[]): Positioned[] {
  return domains.map((d, i) => {
    const angle = ((-90 + (i * 360) / domains.length) * Math.PI) / 180;
    return {
      ...d,
      x: CORE.x + RADIUS * Math.cos(angle),
      y: CORE.y + RADIUS * Math.sin(angle),
    };
  });
}

export const AboutConstellation: React.FC<AboutConstellationProps> = ({
  core = 'AK',
  domains = DOMAINS,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const nodes = layout(domains);

  return (
    <div className="ac" role="img" aria-label={`Engineering domains orbiting ${core}`}>
      <div className="ac__stage">
        {/* Slowly rotating orbit rings (decorative, near-imperceptible). */}
        <span className="ac__orbit ac__orbit--outer" aria-hidden="true" />
        <span className="ac__orbit ac__orbit--inner" aria-hidden="true" />

        {/* Monoline connectors core → node. */}
        <svg className="ac__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {nodes.map((n) => (
            <line
              key={n.id}
              className={`ac__line${activeId === n.id ? ' is-lit' : ''}`}
              x1={CORE.x}
              y1={CORE.y}
              x2={n.x}
              y2={n.y}
            />
          ))}
        </svg>

        {/* Glowing core. */}
        <span className="ac__core" aria-hidden="true">
          <span className="ac__core-label">{core}</span>
        </span>

        {/* Orbiting domain nodes. */}
        {nodes.map((n, i) => (
          <button
            key={n.id}
            type="button"
            className={`ac__node${activeId === n.id ? ' is-active' : ''}`}
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              ['--ac-delay' as string]: `${(i % nodes.length) * -1.4}s`,
            }}
            onMouseEnter={() => setActiveId(n.id)}
            onMouseLeave={() => setActiveId((cur) => (cur === n.id ? null : cur))}
            onFocus={() => setActiveId(n.id)}
            onBlur={() => setActiveId((cur) => (cur === n.id ? null : cur))}
            onClick={() => setActiveId((cur) => (cur === n.id ? null : n.id))}
            aria-label={`${n.title} — ${n.category}`}
          >
            <span className="ac__node-glow" aria-hidden="true" />
            <span className="ac__node-icon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {n.icon}
              </svg>
            </span>
            <span className="ac__node-title">{n.title}</span>
            <span className="ac__node-tip" role="tooltip">
              {n.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AboutConstellation;
