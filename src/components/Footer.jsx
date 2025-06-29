import React from "react";
import { motion } from "framer-motion";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Expertise", href: "#tech" },
    { label: "Work", href: "#portfolio" },
    { label: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    { icon: "🐦", label: "Twitter", href: "https://twitter.com/aniket" },
    { icon: "📸", label: "Instagram", href: "https://instagram.com/aniket" },
    { icon: "👔", label: "LinkedIn", href: "https://linkedin.com/in/aniket" },
    { icon: "💼", label: "GitHub", href: "https://github.com/aniket" },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Top Wave */}
        <div className="footer-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,40 C150,90 350,0 600,50 C850,100 1050,10 1200,60 L1200,120 L0,120 Z"
              fill="currentColor"
              opacity="0.1"
            >
              <animate
                attributeName="d"
                values="M0,40 C150,90 350,0 600,50 C850,100 1050,10 1200,60 L1200,120 L0,120 Z;
                               M0,60 C150,10 350,100 600,50 C850,0 1050,90 1200,40 L1200,120 L0,120 Z;
                               M0,40 C150,90 350,0 600,50 C850,100 1050,10 1200,60 L1200,120 L0,120 Z"
                dur="10s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        <motion.div
          className="footer-main"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div className="footer-brand" whileHover={{ scale: 1.05 }}>
            <div className="footer-logo">Aniket K.</div>
            <p className="footer-tagline">
              Elite MERN Stack Developer | Transforming Ideas Into Digital
              Excellence
            </p>
          </motion.div>

          <div className="footer-links">
            {footerLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="footer-link"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="social-links">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  rotate: 360,
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.9 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="copyright">
            © {currentYear} Aniket K. - Elite MERN Stack Developer. All rights
            reserved.
          </p>
          <p className="made-with">
            Made with <span className="heart">❤️</span> and React
          </p>
        </motion.div>

        {/* Background Pattern */}
        <div className="footer-pattern"></div>
      </div>
    </footer>
  );
};

export default Footer;
