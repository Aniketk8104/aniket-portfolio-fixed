import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Footer.css';

/* Crisp inline icon set — no emoji, premium minimal */
const Icon = {
  GitHub: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  ),
  LinkedIn: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  ),
  X: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64Z" />
    </svg>
  ),
  Instagram: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Architecture', href: '/architecture' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Writing', href: '/writing' },
    { label: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    { Icon: Icon.GitHub, label: 'GitHub', href: 'https://github.com/Aniketk8104' },
    { Icon: Icon.LinkedIn, label: 'LinkedIn', href: 'https://www.linkedin.com/in/aniket-kushwaha-ak' },
    { Icon: Icon.X, label: 'X', href: 'https://x.com/Aniketkush89151' },
    { Icon: Icon.Instagram, label: 'Instagram', href: 'https://www.instagram.com/p/DEXzAlEImcV/' },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <motion.div
          className="footer-main"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="footer-brand">
            <div className="footer-logo">Aniket Kushwaha</div>
            <p className="footer-tagline">
              Software Engineer · Backend, Platform &amp; AI Automation
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer">
            {footerLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link key={link.label} to={link.href} className="footer-link">
                  {link.label}
                </Link>
              ) : link.href === '#contact' ? (
                <a key={link.label} href={link.href} className="footer-link" data-open-contact>
                  {link.label}
                </a>
              ) : (
                <a key={link.label} href={link.href} className="footer-link">
                  {link.label}
                </a>
              )
            )}
          </nav>

          <div className="social-links">
            {socialLinks.map(({ Icon: SocialIcon, label, href }) => (
              <motion.a
                key={label}
                href={href}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
              >
                <SocialIcon />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Aniket Kushwaha. All rights reserved.
          </p>
          <p className="footer-meta">Designed &amp; built for production.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
