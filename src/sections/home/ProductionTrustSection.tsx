/**
 * ProductionTrustSection — an engineering "approval system", not a testimonial
 * carousel. A large featured review (evidence attached to a real project) sits
 * above four aggregate trust-signal cards. Reviews are data-driven; the accent
 * adapts to the related project's identity, and the Project pill links to it.
 *
 * Carousel: max 3 reviews, never autoplay, crossfade only (no slide/loop),
 * understated dots + arrows — shown only when more than one review exists.
 *
 * @module sections/home/ProductionTrustSection
 */
import React, { useEffect, useState } from 'react';
import { m, LazyMotion, domAnimation, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { reviews, TRUST_SIGNALS, type Review, type TrustSignal } from './reviews';
import './ProductionTrustSection.css';

// ── Icons ──────────────────────────────────────────────────────────────────────

const MetaIcon = {
  project: (
    <path d="M3 7h7l2 2h9v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7Zm0 0V5a2 2 0 0 1 2-2h4l2 2" />
  ),
  industry: <path d="M3 21V8l6 4V8l6 4V5l6 4v12H3Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};

const SignalIcon: Record<TrustSignal['icon'], React.ReactNode> = {
  delivery: <path d="M20 6 9 17l-5-5" />,
  rating: <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3Z" />,
  shipped: (
    <>
      <path d="M3 7l9-4 9 4-9 4-9-4Z" />
      <path d="M3 7v10l9 4 9-4V7M12 11v10" />
    </>
  ),
  industries: <path d="M3 21V8l6 4V8l6 4V5l6 4v12H3Z" />,
};

// ── Count-up (numbers animate once, in view) ───────────────────────────────────

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
    let raf = 0;
    let start: number | null = null;
    const dur = 900;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      if (start === null) start = now;
      const p = Math.min((now - start) / dur, 1);
      setDisplay(`${(target * ease(p)).toFixed(decimals)}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(`${target.toFixed(decimals)}${suffix}`);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, play]);
  return <span>{display}</span>;
};

// ── Featured review ─────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const FeaturedReview: React.FC<{ review: Review; reduceMotion: boolean }> = ({
  review,
  reduceMotion,
}) => {
  // Keyed fade-in: changing review.id remounts the card, so the new review
  // crossfades in over 220ms. (No slide, no loop.)
  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.22 },
      };

  return (
    <m.article
      key={review.id}
      className="pt-review"
      style={{ ['--rev-accent' as string]: review.accent }}
      {...motionProps}
    >
      {review.partnership && (
        <span className="pt-review__partner">Long-term Partnership</span>
      )}

      {/* Left: identity + quote + metadata */}
      <div className="pt-review__main">
        <span className="pt-approved">
          <span className="pt-dot pt-dot--ok" aria-hidden="true" />
          Production Approved
        </span>

        <div className="pt-reviewer">
          <span className="pt-avatar" aria-hidden="true">
            {review.avatar ? (
              <img src={review.avatar} alt="" />
            ) : (
              initials(review.name)
            )}
          </span>
          <span className="pt-reviewer__meta">
            <span className="pt-reviewer__name">{review.name}</span>
            <span className="pt-reviewer__role">
              {review.role} · {review.company}
            </span>
          </span>
        </div>

        <blockquote className="pt-quote">
          <span className="pt-quote__mark" aria-hidden="true">“</span>
          {review.quote}
        </blockquote>

        <div className="pt-meta">
          <Link className="pt-pill" to={review.projectHref}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{MetaIcon.project}</svg>
            <span className="pt-pill__k">Project</span>
            <span className="pt-pill__v">{review.project}</span>
          </Link>
          <span className="pt-pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">{MetaIcon.industry}</svg>
            <span className="pt-pill__k">Industry</span>
            <span className="pt-pill__v">{review.industry}</span>
          </span>
          {review.engagementLength && (
            <span className="pt-pill">
              <svg viewBox="0 0 24 24" aria-hidden="true">{MetaIcon.clock}</svg>
              <span className="pt-pill__k">Engagement</span>
              <span className="pt-pill__v">{review.engagementLength}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: impact + status */}
      <aside className="pt-review__impact">
        <span className="pt-kicker">Project Impact</span>
        <ul className="pt-impact-list">
          {review.impact.map((item) => (
            <li key={item} className="pt-impact-item">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="pt-check">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <span className="pt-status">
          <span className="pt-dot pt-dot--ok" aria-hidden="true" />
          {review.status}
        </span>
      </aside>
    </m.article>
  );
};

// ── Section ──────────────────────────────────────────────────────────────────────

export const ProductionTrustSection: React.FC = () => {
  const reduceMotion = useReducedMotion() ?? false;
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [activeIx, setActiveIx] = useState(0);

  const review = reviews[activeIx] ?? reviews[0];
  const multi = reviews.length > 1;

  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
      };

  if (!review) return null;

  return (
    <LazyMotion features={domAnimation}>
      <section id="testimonials" className="pt" aria-labelledby="pt-heading" ref={ref}>
        <div className="pt__inner">
          <m.header className="pt__head" {...reveal}>
            <span className="pt__eyebrow">Client Validation</span>
            <h2 id="pt-heading" className="pt__heading">
              Production Trust
            </h2>
            <p className="pt__lead">
              Trusted by founders and engineering teams to build systems that
              survive production.
            </p>
          </m.header>

          <m.div className="pt__stage" {...reveal}>
            <FeaturedReview review={review} reduceMotion={reduceMotion} />

            {multi && (
              <div className="pt-nav" role="tablist" aria-label="Reviews">
                <button
                  type="button"
                  className="pt-arrow"
                  aria-label="Previous review"
                  onClick={() => setActiveIx((i) => (i - 1 + reviews.length) % reviews.length)}
                >
                  ‹
                </button>
                <div className="pt-dots">
                  {reviews.map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      role="tab"
                      aria-selected={i === activeIx}
                      aria-label={`Review ${i + 1}: ${r.company}`}
                      className={`pt-dot-btn${i === activeIx ? ' is-active' : ''}`}
                      onClick={() => setActiveIx(i)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="pt-arrow"
                  aria-label="Next review"
                  onClick={() => setActiveIx((i) => (i + 1) % reviews.length)}
                >
                  ›
                </button>
              </div>
            )}
          </m.div>

          <m.ul className="pt-signals" {...reveal}>
            {TRUST_SIGNALS.map((s) => (
              <li key={s.label} className="pt-signal">
                <span className="pt-signal__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">{SignalIcon[s.icon]}</svg>
                </span>
                <span className="pt-signal__value">
                  <CountUp value={s.value} play={inView || reduceMotion} />
                </span>
                <span className="pt-signal__label">{s.label}</span>
                <span className="pt-signal__desc">{s.desc}</span>
              </li>
            ))}
          </m.ul>
        </div>
      </section>
    </LazyMotion>
  );
};

export default ProductionTrustSection;
