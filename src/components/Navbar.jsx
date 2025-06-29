import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollY } = useScroll();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'tech', label: 'Expertise' },
    { id: 'about', label: 'About' },
    { id: 'portfolio', label: 'Work' },
    { id: 'contact', label: 'Contact' },
  ];

  useMotionValueEvent(scrollY, 'change', latest => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200; // Increased offset for better detection

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && scrollPosition >= section.offsetTop) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 100;
      const elementPosition = section.offsetTop - offset;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <motion.nav
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div className="nav-content">
        <motion.div
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Aniket
        </motion.div>

        <ul className="nav-links">
          {navItems.map(item => (
            <li key={item.id}>
              <motion.a
                href={`#${item.id}`}
                className={activeSection === item.id ? 'active' : ''}
                onClick={e => handleNavClick(e, item.id)}
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
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <motion.button className="mobile-menu-btn" whileTap={{ scale: 0.9 }}>
          <span></span>
          <span></span>
          <span></span>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
