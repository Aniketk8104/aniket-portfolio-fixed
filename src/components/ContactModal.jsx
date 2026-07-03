/**
 * ContactModal
 *
 * Premium split contact popup (info panel + form), opened globally via a
 * window CustomEvent ('open-contact-modal') dispatched by the navbar CTA,
 * the floating CTA, or any element with [data-open-contact].
 *
 * Adapted into the portfolio's dark premium theme from a split modal layout:
 *   Left  — eyebrow, headline, intro, contact channels, social row.
 *   Right — name / email / engagement type / message + submit (Formspree).
 *
 * Mounted once in SiteShell. Locks body scroll while open, closes on Esc,
 * backdrop click, or the close button. Reduced-motion aware.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ContactModal.css';

const CHANNELS = [
  {
    id: 'email',
    label: 'Email',
    value: 'Kushwahaaniket141@gmail.com',
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=Kushwahaaniket141@gmail.com',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
    ),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: '/in/aniket-kushwaha',
    href: 'https://www.linkedin.com/in/aniket-kushwaha-ak/',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z" /></svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    value: '/Aniketk8104',
    href: 'https://github.com/Aniketk8104',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" /></svg>
    ),
  },
];

const ContactModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', project: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const panelRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);

  // Global open trigger
  useEffect(() => {
    const open = () => {
      lastFocusedRef.current = document.activeElement;
      setIsOpen(true);
    };
    window.addEventListener('open-contact-modal', open);

    // Delegate clicks from any [data-open-contact] element
    const onClick = (e) => {
      const trigger = e.target.closest?.('[data-open-contact]');
      if (trigger) {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('open-contact-modal', open);
      document.removeEventListener('click', onClick);
    };
  }, []);

  // Body scroll lock + Esc + focus management
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    // Focus first field
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector('input, textarea, button')?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen, close]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    const form = e.target;
    try {
      const res = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setFormData({ name: '', email: '', project: '', message: '' });
        setStatus({ type: 'success', message: "Thanks — your message is on its way. I'll reply within 24 hours." });
      } else {
        setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cmodal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Contact"
        >
          <motion.div
            ref={panelRef}
            className="cmodal-panel"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <button className="cmodal-close" onClick={close} aria-label="Close contact dialog" type="button">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>

            {/* ── Left: info ── */}
            <div className="cmodal-info">
              <span className="cmodal-eyebrow">
                <span className="cmodal-eyebrow__dot" aria-hidden="true" />
                Contact
              </span>
              <h2 className="cmodal-title">Let&apos;s build something meaningful.</h2>
              <p className="cmodal-lead">
                For engineering engagements, backend &amp; platform systems, or AI automation —
                send a note and I&apos;ll get back within 24 hours.
              </p>

              <ul className="cmodal-channels">
                {CHANNELS.map((c) => (
                  <li key={c.id}>
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="cmodal-channel">
                      <span className="cmodal-channel__icon">{c.icon}</span>
                      <span className="cmodal-channel__meta">
                        <span className="cmodal-channel__label">{c.label}</span>
                        <span className="cmodal-channel__value">{c.value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="cmodal-availability">
                <span className="cmodal-availability__dot" aria-hidden="true" />
                Open to engineering engagements
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="cmodal-formwrap">
              <form
                action="https://formspree.io/f/mqaldddn"
                method="POST"
                onSubmit={handleSubmit}
                className="cmodal-form"
              >
                <label className="cmodal-field">
                  <span className="cmodal-field__label">Full Name</span>
                  <input type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required autoComplete="name" />
                </label>
                <label className="cmodal-field">
                  <span className="cmodal-field__label">Email Address</span>
                  <input type="email" name="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} required autoComplete="email" />
                </label>
                <label className="cmodal-field">
                  <span className="cmodal-field__label">Engagement Type</span>
                  <select name="project" value={formData.project} onChange={handleChange} required>
                    <option value="">Select engagement type</option>
                    <option value="backend-engineering">Backend Engineering</option>
                    <option value="platform-engineering">Platform / Infrastructure</option>
                    <option value="ai-automation">AI Automation</option>
                    <option value="technical-consultation">Technical Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="cmodal-field">
                  <span className="cmodal-field__label">How can I help?</span>
                  <textarea name="message" rows="4" placeholder="Tell me about the system or challenge you're working on…" value={formData.message} onChange={handleChange} required />
                </label>

                <button type="submit" className="cmodal-submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Sending…' : 'Send your message'}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></svg>
                </button>

                {status && (
                  <p className={`cmodal-status cmodal-status--${status.type}`} role="status">
                    {status.message}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
