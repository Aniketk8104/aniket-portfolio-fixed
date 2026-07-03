/**
 * EngineeringPhilosophySection — "Principles as Git Commits".
 *
 * Engineering principles presented as a vertical Git-commit timeline. Left
 * column holds only the heading + subtitle; the right column is the timeline.
 * Each principle is a commit row (index · hash · title · timestamp · chevron)
 * that expands to reveal one concise philosophy and up to three "Applied in"
 * project chips. Exactly one commit is active (glowing); earlier commits read
 * as muted history, later ones stay inactive.
 *
 * Collapsed rows show the title inline after the hash; the active commit becomes
 * a soft card with the title on its own line, the philosophy below, a hairline
 * divider, then the applied-in chips — mirroring a real Git client.
 */
import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import './EngineeringPhilosophySection.css';

// Kept for backwards-compatible imports; the section is now self-contained.
export interface Principle {
  title: string;
  description: string;
  icon?: string;
}

interface Commit {
  hash: string;
  title: string;
  timestamp: string;
  philosophy: string;
  appliedIn: string[];
}

const COMMITS: Commit[] = [
  {
    hash: '9f8d1c2',
    title: 'Systems over Features',
    timestamp: '2 weeks ago',
    philosophy:
      'I optimise for the system behind the feature — clear boundaries, predictable data flow, and interfaces that stay stable as requirements change.',
    appliedIn: ['BVISIONR', 'Aura', 'StopSearch'],
  },
  {
    hash: '7ab23d1',
    title: 'Correctness before Optimisation',
    timestamp: '3 weeks ago',
    philosophy:
      'Make it correct, then make it fast. I prove behaviour with types and tests before chasing performance that may not move the needle.',
    appliedIn: ['Radique', 'StopSearch', 'BVISIONR'],
  },
  {
    hash: '5cd891a',
    title: 'Observability by Default',
    timestamp: '1 month ago',
    philosophy:
      'Logs, metrics, and traces are part of the design, not an afterthought. If I cannot see it in production, I have not finished building it.',
    appliedIn: ['BVISIONR', 'Aura', 'Radique'],
  },
  {
    hash: '3ef721c',
    title: 'Ship Small, Learn Fast',
    timestamp: '1 month ago',
    philosophy:
      'Small, reversible changes beat big-bang releases. Tight feedback loops surface problems while they are still cheap to fix.',
    appliedIn: ['StopSearch', 'Aura', 'BVISIONR'],
  },
  {
    hash: '2ab98de',
    title: 'Design for Failure',
    timestamp: '2 months ago',
    philosophy:
      'Networks drop, queues back up, dependencies fail. I build retries, idempotency, and graceful degradation in from the start.',
    appliedIn: ['BVISIONR', 'Radique', 'Aura'],
  },
  {
    hash: '14ac09f',
    title: 'Documentation as Code',
    timestamp: '2 months ago',
    philosophy:
      'Decisions live next to the code that implements them. Readable docs and ADRs keep systems maintainable long after the context fades.',
    appliedIn: ['BVISIONR', 'Radique', 'StopSearch'],
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const Chevron: React.FC = () => (
  <svg
    className="phil-commit__chevron"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

interface CommitRowProps {
  commit: Commit;
  index: number;
  active: number;
  onToggle: (i: number) => void;
}

const CommitRow: React.FC<CommitRowProps> = ({ commit, index, active, onToggle }) => {
  const isActive = index === active;
  const state = active < 0 ? 'future' : index < active ? 'past' : index > active ? 'future' : 'active';

  return (
    <li className={`phil-commit is-${state}${isActive ? ' is-open' : ''}`}>
      <button
        type="button"
        className="phil-commit__head"
        onClick={() => onToggle(index)}
        aria-expanded={isActive}
      >
        <span className="phil-commit__dot" aria-hidden="true" />
        <span className="phil-commit__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="phil-commit__content">
          <span className="phil-commit__hash">{commit.hash}</span>
          <span className="phil-commit__title">{commit.title}</span>
        </span>
        <span className="phil-commit__time">{commit.timestamp}</span>
        <Chevron />
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <m.div
            className="phil-commit__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
          >
            <m.div
              className="phil-commit__panel-inner"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.22, ease, delay: 0.04 }}
            >
              <h3 className="phil-commit__open-title">{commit.title}</h3>
              <p className="phil-commit__philosophy">{commit.philosophy}</p>
              <div className="phil-commit__divider" aria-hidden="true" />
              <div className="phil-commit__applied">
                <span className="phil-commit__applied-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                  </svg>
                  Applied in
                </span>
                <div className="phil-commit__chips">
                  {commit.appliedIn.slice(0, 3).map((project) => (
                    <span key={project} className="phil-chip">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export const EngineeringPhilosophySection: React.FC = () => {
  const [active, setActive] = useState(0);
  const toggle = (i: number) => setActive((prev) => (prev === i ? -1 : i));

  return (
    <section id="philosophy" className="phil" aria-labelledby="phil-title">
      <div className="phil__inner">
        <div className="phil__grid">
          <div className="phil__intro">
            <span className="phil__eyebrow">Philosophy</span>
            <h2 id="phil-title" className="phil__heading">
              Principles as
              <br />
              Git Commits
            </h2>
            <p className="phil__sub">
              Engineering is a series of decisions. These are the principles I commit to in
              every system I build.
            </p>
          </div>

          <ol className="phil__timeline">
            {COMMITS.map((commit, i) => (
              <CommitRow key={commit.hash} commit={commit} index={i} active={active} onToggle={toggle} />
            ))}
          </ol>
        </div>

        <footer className="phil__quote">
          <span className="phil__quote-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7.5 6C5 6 3 8 3 10.5S5 15 7.5 15c.3 0 .6 0 .9-.1C7.8 16.7 6.3 18 4.5 18.3c-.4.1-.6.5-.5.9.1.4.5.6.9.5C8.6 19 11 16 11 11.5 11 8.5 9.4 6 7.5 6Zm9 0C14 6 12 8 12 10.5S14 15 16.5 15c.3 0 .6 0 .9-.1-.6 1.8-2.1 3.1-3.9 3.4-.4.1-.6.5-.5.9.1.4.5.6.9.5C17.6 19 20 16 20 11.5 20 8.5 18.4 6 16.5 6Z" />
            </svg>
          </span>
          <p className="phil__quote-text">
            Good systems make the hard things easy.{' '}
            <span className="phil__quote-accent">Great systems make the easy things possible.</span>
          </p>
          <span className="phil__quote-prompt" aria-hidden="true">{'>_'}</span>
        </footer>
      </div>
    </section>
  );
};

export default EngineeringPhilosophySection;
