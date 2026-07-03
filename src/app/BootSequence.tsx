/**
 * BootSequence — the cold-boot of ENGINEERING OS.
 *
 * Not a loading screen. A boot sequence: the engineering grid draws itself,
 * a status LED comes online, ENGINEERING OS resolves, runtime modules
 * initialize one by one, and the system reports "operational". On exit the
 * identity badge flies toward the navbar's position and the grid zooms out —
 * the boot UI becomes the interface rather than fading away.
 *
 * Rules honoured:
 *   - Total time 1.2–1.8s (full) / ~600ms (returning session). Never asset-gated.
 *   - Returning visitors in the same tab session see a short "Resuming session".
 *   - prefers-reduced-motion → skipped entirely (no punishment, no motion).
 *   - Randomised boot message each visit so it feels alive.
 *   - GPU transforms + opacity only.
 *
 * Rendered inside SiteShell's LazyMotion, so it uses the lightweight `m`
 * component rather than the full `motion` bundle.
 *
 * @module app/BootSequence
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import './BootSequence.css';

const SESSION_KEY = 'eos-booted';

/** Runtime modules that initialize during a cold boot. */
const MODULES = ['Mission Control', 'Projects', 'Architecture', 'UI Runtime', 'Animations'] as const;

/** One is chosen at random per visit — a small sign of life. */
const BOOT_MESSAGES = [
  'Recovering previous runtime…',
  'Checking distributed nodes…',
  'Loading event pipelines…',
  'Synchronizing runtime…',
  'Initializing AI routing…',
] as const;

type Stage = 'boot' | 'resume' | 'exit' | 'done';

const EASE = [0.2, 0, 0, 1] as const;

const BootSequence: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  // Decide the boot mode once, synchronously, before first paint.
  const initial = useMemo<Stage>(() => {
    if (reduced) return 'done';
    try {
      return sessionStorage.getItem(SESSION_KEY) ? 'resume' : 'boot';
    } catch {
      return 'boot';
    }
  }, [reduced]);

  const [stage, setStage] = useState<Stage>(initial);
  const [modulesUp, setModulesUp] = useState(0);
  const [exitTarget, setExitTarget] = useState({ x: 0, y: 0 });
  const message = useMemo(() => BOOT_MESSAGES[Math.floor(Math.random() * BOOT_MESSAGES.length)], []);
  const timers = useRef<number[]>([]);

  const push = (fn: () => void, delay: number) => {
    timers.current.push(window.setTimeout(fn, delay));
  };

  // On reduced-motion the session still needs marking so a later preference
  // change behaves consistently.
  useEffect(() => {
    if (stage !== 'done') return;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [stage]);

  // Compute where the identity badge should fly to (roughly the navbar brand).
  const computeExitTarget = () => {
    const padX = Math.max(24, Math.round(window.innerWidth * 0.05));
    const targetX = padX + 90; // ~centre of the navbar brand module
    const targetY = 34; // navbar vertical centre
    setExitTarget({ x: targetX - window.innerWidth / 2, y: targetY - window.innerHeight / 2 });
  };

  const finish = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setStage('done');
  };

  useEffect(() => {
    if (stage === 'done') return undefined;

    if (stage === 'resume') {
      push(() => setStage('exit'), 520);
      push(() => finish(), 520 + 360);
    } else if (stage === 'boot') {
      // Modules initialize in sequence.
      MODULES.forEach((_, i) => push(() => setModulesUp(i + 1), 430 + i * 150));
      const bootEnd = 430 + MODULES.length * 150 + 220; // ~1400ms
      push(() => {
        computeExitTarget();
        setStage('exit');
      }, bootEnd);
      push(() => finish(), bootEnd + 340);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  if (stage === 'done') return null;

  const exiting = stage === 'exit';
  const resuming = initial === 'resume';

  return (
    <AnimatePresence>
      <m.div
        className="boot"
        role="status"
        aria-label="Engineering OS booting"
        initial={{ opacity: 1 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: exiting ? 0.34 : 0, ease: EASE, delay: exiting ? 0.08 : 0 }}
      >
        {/* Engineering grid — draws in, then zooms outward on exit. */}
        <m.div
          className="boot__grid"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{
            opacity: exiting ? 0 : 0.5,
            scale: exiting ? 1.35 : 1,
          }}
          transition={{ duration: exiting ? 0.4 : 0.6, ease: EASE }}
          aria-hidden="true"
        />

        {/* Identity badge — flies toward the navbar on exit. */}
        <m.div
          className="boot__stack"
          animate={{
            x: exiting ? exitTarget.x : 0,
            y: exiting ? exitTarget.y : 0,
            scale: exiting ? 0.42 : 1,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        >
          <div className="boot__badge">
            <span className={`boot__led ${exiting || resuming ? 'is-operational' : ''}`} aria-hidden="true" />
            <div className="boot__id">
              <m.span
                className="boot__title"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
              >
                ENGINEERING OS
              </m.span>
              <m.span
                className="boot__status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.24 }}
              >
                {resuming ? 'Resuming session…' : exiting ? 'All systems operational' : 'Booting Production Runtime'}
              </m.span>
            </div>
          </div>

          {/* Module checklist — only during a full cold boot. */}
          {!resuming && (
            <m.ul
              className="boot__modules"
              initial={{ opacity: 0 }}
              animate={{ opacity: exiting ? 0 : 1 }}
              transition={{ duration: 0.3, delay: exiting ? 0 : 0.34 }}
              aria-hidden="true"
            >
              {MODULES.map((mod, i) => {
                const up = i < modulesUp;
                return (
                  <li key={mod} className={`boot__module ${up ? 'is-up' : ''}`}>
                    <span className="boot__module-check">{up ? '✓' : '·'}</span>
                    <span className="boot__module-name">{mod}</span>
                    <span className="boot__module-state">{up ? 'ready' : 'init'}</span>
                  </li>
                );
              })}
            </m.ul>
          )}

          {!resuming && (
            <m.span
              className="boot__message"
              initial={{ opacity: 0 }}
              animate={{ opacity: exiting ? 0 : 0.75 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              aria-hidden="true"
            >
              {message}
            </m.span>
          )}
        </m.div>
      </m.div>
    </AnimatePresence>
  );
};

export default BootSequence;
