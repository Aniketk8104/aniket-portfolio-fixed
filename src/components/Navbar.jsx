import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { projects } from '../content/projects';
import Magnetic from './ui/Magnetic';
import NavbarBrand from './NavbarBrand';
import { scrollToY } from '../utils/smoothScroll';
import './Navbar.css';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home', type: 'hash' },
  { id: 'projects', label: 'Projects', href: '/projects', type: 'route' },
  { id: 'case-studies', label: 'Case Studies', href: '/case-studies', type: 'route' },
  { id: 'writing', label: 'Writing', href: '/writing', type: 'route' },
];

/** Domain labels + cover gradients for the Projects hover mega-panel. */
const PROJECT_DOMAINS = {
  bvisionr: { label: 'SaaS · AI Messaging', gradient: 'linear-gradient(135deg,#4f46e5,#7c3aed 55%,#d946ef)' },
  radique: { label: 'Healthcare · Workflow', gradient: 'linear-gradient(135deg,#6366f1,#818cf8 55%,#38bdf8)' },
  'aura-tech-platform': { label: 'Platform · Payments', gradient: 'linear-gradient(135deg,#7c3aed,#a855f7 50%,#ec4899)' },
  stopsearch: { label: 'Hiring · Dashboards', gradient: 'linear-gradient(135deg,#4338ca,#6366f1 55%,#8b5cf6)' },
};

const monogram = (title) => {
  const w = title.trim().split(/\s+/);
  return (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[1][0]).toUpperCase();
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const projectsTimer = useRef(null);
  const openProjects = () => {
    if (projectsTimer.current) clearTimeout(projectsTimer.current);
    setProjectsOpen(true);
  };
  const closeProjects = () => {
    if (projectsTimer.current) clearTimeout(projectsTimer.current);
    projectsTimer.current = setTimeout(() => setProjectsOpen(false), 140);
  };
  const { scrollY } = useScroll();
  const navItems = NAV_ITEMS;
  const location = useLocation();
  const hashItems = navItems.filter(item => item.type === 'hash');
  const getNavHeight = useCallback(
    () => document.querySelector('.navbar')?.offsetHeight || 0,
    []
  );

  useMotionValueEvent(scrollY, 'change', latest => {
    setIsScrolled(latest > 50);
  });

  // Handle hash in URL on mount or route change (e.g. navigating from /projects to /#about)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && location.pathname === '/') {
      const tryScroll = (attempts = 0) => {
        const section = document.getElementById(hash);
        if (section) {
          const navOffset = getNavHeight() + 24;
          const targetPosition = section.getBoundingClientRect().top + window.scrollY - navOffset;
          smoothScrollTo(Math.max(targetPosition, 0));
          setActiveSection(hash);
        } else if (attempts < 10) {
          setTimeout(() => tryScroll(attempts + 1), 100);
        }
      };
      setTimeout(() => tryScroll(), 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Sync active state with current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname !== '/') {
      // Find matching route nav item
      const matchingItem = navItems.find(
        item => item.type === 'route' && pathname.startsWith(item.href)
      );
      if (matchingItem) {
        setActiveSection(matchingItem.id);
        return;
      }
    }
  }, [location.pathname, navItems]);

  useEffect(() => {
    // Only track scroll-based active section on the home page
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      const sections = hashItems.map(item => document.getElementById(item.id));
      const navOffset = getNavHeight();
      const scrollPosition = window.scrollY + navOffset + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && scrollPosition >= section.offsetTop) {
          setActiveSection(hashItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [getNavHeight, hashItems, location.pathname]);

  const smoothScrollTo = (targetY, duration = 700) => {
    // Prefer the shared inertial engine so the anchor glide and free scrolling
    // share one animator (no fighting between two rAF loops).
    if (scrollToY(targetY, { duration: duration / 1000 })) {
      return;
    }

    // Engine inactive (touch / unsupported). Respect reduced-motion with an
    // instant jump; otherwise run the local easing tween.
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      window.scrollTo(0, targetY);
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    const easeInOutCubic = t =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = currentTime => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      window.scrollTo(0, startY + distance * easeProgress);

      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();

    // If not on home page, navigate there first then scroll
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const navOffset = getNavHeight() + 24;
      const targetPosition = section.getBoundingClientRect().top + window.scrollY - navOffset;

      smoothScrollTo(Math.max(targetPosition, 0));
      setActiveSection(sectionId);

      setIsMobileMenuOpen(false);
    }
  };

  const openContact = () => {
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open-contact-modal'));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        isMobileMenuOpen &&
        !event.target.closest('.navbar') &&
        !event.target.closest('.mobile-nav')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <motion.nav
        className={`navbar ${isScrolled ? 'scrolled' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="nav-content">
          <NavbarBrand
            pageKey={activeSection}
            onNavigate={() => setIsMobileMenuOpen(false)}
          />

          <ul className="nav-links">
            {navItems.map(item =>
              item.type === 'route' ? (
                item.id === 'projects' ? (
                  <li
                    key={item.id}
                    className="nav-projects"
                    onMouseEnter={openProjects}
                    onMouseLeave={closeProjects}
                  >
                    <Link
                      to={item.href}
                      className={activeSection === item.id ? 'active' : ''}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-haspopup="true"
                      aria-expanded={projectsOpen}
                    >
                      {item.label}
                      {activeSection === item.id && (
                        <motion.div
                          className="nav-indicator"
                          layoutId="navbar-indicator"
                          transition={{ type: 'spring', duration: 0.5 }}
                        />
                      )}
                    </Link>
                  </li>
                ) : (
                  <li key={item.id}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={item.href}
                        className={activeSection === item.id ? 'active' : ''}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                        {activeSection === item.id && (
                          <motion.div
                            className="nav-indicator"
                            layoutId="navbar-indicator"
                            transition={{ type: 'spring', duration: 0.5 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  </li>
                )
              ) : (
                <li key={item.id}>
                  <motion.a
                    href={item.href}
                    className={activeSection === item.id ? 'active' : ''}
                    onClick={e => {
                      if (item.type === 'modal') {
                        e.preventDefault();
                        openContact();
                      } else {
                        handleNavClick(e, item.id);
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.div
                        className="nav-indicator"
                        layoutId="navbar-indicator"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                  </motion.a>
                </li>
              )
            )}
          </ul>

          <motion.button
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </motion.button>

          <Magnetic
            as="button"
            type="button"
            className="nav-cta"
            onClick={openContact}
            strength={0.4}
            aria-label="Open contact form"
          >
            Get in Touch
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </Magnetic>
        </div>
      </motion.nav>

      {/* Projects mega-panel — rendered OUTSIDE .nav-links so the nav-link
          styles (pill radius/padding) can't leak into the image cards */}
      <AnimatePresence>
        {projectsOpen && (
          <motion.div
            className="nav-megapanel"
            onMouseEnter={openProjects}
            onMouseLeave={closeProjects}
            initial={{ opacity: 0, x: '-50%', y: 10 }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, x: '-50%', y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="nav-megapanel__intro">
              <span className="nav-megapanel__title">Featured Work</span>
              <p className="nav-megapanel__desc">
                Backend, platform &amp; AI systems engineered for scale,
                reliability, and real business impact.
              </p>
              <Link
                to="/projects"
                className="nav-megapanel__viewall"
                onClick={() => setProjectsOpen(false)}
              >
                View All
              </Link>
            </div>

            <div className="nav-megapanel__cards">
              {projects.slice(0, 4).map(p => {
                const d = PROJECT_DOMAINS[p.slug] || { label: 'Engineering', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' };
                return (
                  <Link
                    key={p.slug}
                    to="/projects"
                    className="nav-megacard"
                    style={{ background: d.gradient }}
                    onClick={() => setProjectsOpen(false)}
                  >
                    {p.thumbnail ? (
                      <img className="nav-megacard__img" src={p.thumbnail} alt="" loading="lazy" />
                    ) : (
                      <span className="nav-megacard__mono">{monogram(p.title)}</span>
                    )}
                    <span className="nav-megacard__scrim" aria-hidden="true" />
                    <span className="nav-megacard__name">
                      <span className="nav-megacard__title">{p.title}</span>
                      <span className="nav-megacard__domain">{d.label}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-nav active"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <NavbarBrand variant="drawer" />
            <ul className="mobile-nav-links">
              {navItems.map(item =>
                item.type === 'route' ? (
                  <li key={item.id}>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Link
                        to={item.href}
                        className={activeSection === item.id ? 'active' : ''}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  </li>
                ) : (
                  <li key={item.id}>
                    <motion.a
                      href={item.href}
                      className={activeSection === item.id ? 'active' : ''}
                      onClick={e => {
                        if (item.type === 'modal') {
                          e.preventDefault();
                          openContact();
                        } else {
                          handleNavClick(e, item.id);
                        }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.label}
                    </motion.a>
                  </li>
                )
              )}
            </ul>
            <button
              type="button"
              className="mobile-nav-cta"
              onClick={openContact}
            >
              Get in Touch
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
