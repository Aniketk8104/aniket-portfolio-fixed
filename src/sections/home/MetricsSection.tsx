/**
 * MetricsSection — a single premium "stat band" sitting directly under the hero.
 *
 * Renders one horizontal row of stats separated by thin vertical gradient hairline
 * dividers (2-column wrap on mobile). Each stat shows a large brand-gradient number
 * with a muted mono caption beneath. Numbers count up on scroll-into-view; values
 * are otherwise rendered VERBATIM from the `metrics` prop and never fabricated.
 *
 * Respects prefers-reduced-motion: reduced users see final values immediately.
 *
 * Validates: Requirements 2.1, 6.4
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { Metric } from '../../types/content';
import './MetricsSection.css';

export interface MetricsSectionProps {
  /** Metrics to display. Values rendered verbatim from content; never derived. */
  metrics: Metric[];
}

/** Parsed representation of a metric value for count-up animation. */
interface ParsedValue {
  /** Leading integer if present, else null (render verbatim). */
  target: number | null;
  /** Non-numeric suffix to re-append after the animated number (e.g. "+"). */
  suffix: string;
}

/**
 * Parse the leading integer from a value string.
 * "10+" -> { target: 10, suffix: "+" }, "Worldwide" -> { target: null, suffix: "" }.
 */
function parseValue(value: string): ParsedValue {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  if (!match) return { target: null, suffix: '' };
  return { target: Number(match[1]), suffix: match[2] };
}

const COUNT_DURATION_MS = 1200;

/**
 * Animated count-up number. Counts from 0 to `target` over ~1.2s once `play` is true.
 * Falls back to the verbatim string when there is no leading integer or motion is reduced.
 */
const CountUp: React.FC<{ value: string; play: boolean; reduced: boolean }> = ({
  value,
  play,
  reduced,
}) => {
  const { target, suffix } = parseValue(value);
  const [display, setDisplay] = useState<number>(target ?? 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // No animation path: render verbatim immediately.
    if (target === null || reduced || !play || typeof window === 'undefined') {
      if (target !== null) setDisplay(target);
      return;
    }

    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
      // easeOutCubic for a premium settle.
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      }
    };

    setDisplay(0);
    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [target, play, reduced]);

  if (target === null) {
    return <span className="metrics-band__value">{value}</span>;
  }

  return (
    <span className="metrics-band__value">
      {display}
      {suffix}
    </span>
  );
};

export const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.4 });
  const reduced = useReducedMotion() ?? false;
  const play = inView || reduced;

  if (metrics.length === 0) return null;

  return (
    <section aria-label="Key metrics" className="metrics-band">
      <div className="metrics-band__inner" ref={sectionRef}>
        <span className="metrics-band__hairline" aria-hidden="true" />
        <ul
          className="metrics-band__row"
          style={{ '--metrics-count': metrics.length } as React.CSSProperties}
        >
          {metrics.map((metric, index) => (
            <motion.li
              key={`${metric.label}-${index}`}
              className="metrics-band__stat"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={play ? { opacity: 1, y: 0 } : undefined}
              transition={{
                duration: 0.5,
                delay: reduced ? 0 : index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <CountUp value={metric.value} play={play} reduced={reduced} />
              <span className="metrics-band__label">
                {metric.label}
                {metric.unit ? ` (${metric.unit})` : ''}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default MetricsSection;
