/**
 * FloatingCTA
 *
 * Floating call-to-action button with engineering-positioned copy.
 * Visibility is scroll-driven: appears after the user has scrolled
 * past 50% of the initial viewport height (i.e. past the hero section).
 *
 * Behavior is unchanged from the original component; only the label and
 * aria copy have been rebranded per Requirement 8.2.
 *
 * Mounted from SiteShell.tsx exactly once globally so it persists across
 * route changes without remounting.
 *
 * Validates: Requirements 8.2, 19.4
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCTA = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollY = window.pageYOffset;
      setIsVisible(scrollY > heroHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href="#contact"
          className="floating-cta"
          data-open-contact
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('open-contact-modal'));
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          aria-label="Get in touch for engineering work"
        >
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          >
            <path
              d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 6L12 13L2 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          <span>Let&apos;s Talk Engineering</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
});

FloatingCTA.displayName = 'FloatingCTA';

export default FloatingCTA;
