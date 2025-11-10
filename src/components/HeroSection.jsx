import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import './HeroSection.css';

// Custom Typewriter Component
const Typewriter = ({
  strings,
  typeSpeed = 50,
  backSpeed = 30,
  loop = true,
}) => {
  const [currentStringIndex, setCurrentStringIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentString = strings[currentStringIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (currentText.length < currentString.length) {
            setCurrentText(currentString.slice(0, currentText.length + 1));
          } else {
            // Start deleting after a pause
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          // Deleting
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1));
          } else {
            // Move to next string
            setIsDeleting(false);
            if (loop || currentStringIndex < strings.length - 1) {
              setCurrentStringIndex(prev => (prev + 1) % strings.length);
            }
          }
        }
      },
      isDeleting ? backSpeed : typeSpeed
    );

    return () => clearTimeout(timeout);
  }, [
    currentText,
    currentStringIndex,
    isDeleting,
    strings,
    typeSpeed,
    backSpeed,
    loop,
  ]);

  return (
    <span>
      {currentText}
      <span className="cursor">|</span>
    </span>
  );
};

const HeroSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="home" className="hero" ref={ref}>
      <motion.div
        className="hero-container"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Hero Content */}
        <div className="hero-content">
          <motion.div
            className="status-indicator"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <div className="status-dot"></div>
            Available for Projects
          </motion.div>

          <motion.div className="hero-badge" variants={itemVariants}>
            Freelance MERN & Full-Stack Developer
          </motion.div>

          <motion.h1 className="hero-title" variants={itemVariants}>
            <span className="hero-title-prefix">
              Hire a revenue-focused MERN stack engineer for
            </span>{' '}
            <span className="gradient-text">
              <Typewriter
                strings={[
                  'SaaS & startup launches',
                  'enterprise-grade web apps',
                  'full-stack product rebuilds',
                ]}
                typeSpeed={50}
                backSpeed={30}
                loop={true}
              />
            </span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={itemVariants}>
            I help founders and product teams ship conversion-driven React,
            Node.js, Express, and MongoDB builds. From greenfield MVPs to
            complex migrations, I own the full-stack roadmap—architecture,
            delivery, and measurable outcomes.
          </motion.p>

          <motion.div className="cta-group" variants={itemVariants}>
            <motion.a
              href="#contact"
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
              </svg>
              Hire Me
            </motion.a>
            <motion.a
              href="#portfolio"
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 12H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View Projects
            </motion.a>
          </motion.div>

          {/* Stats Grid */}
          <motion.div className="stats-grid" variants={containerVariants}>
            {[
              { number: '1+', label: 'Years Experience' },
              { number: '5+', label: 'Projects Completed' },
              { number: '100%', label: 'Client Satisfaction' },
              { number: '24/7', label: 'Support Available' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)',
                }}
              >
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div className="hero-visual" variants={itemVariants}>
          <motion.div
            className="code-editor"
            whileHover={{
              rotateY: 0,
              rotateX: 0,
              scale: 1.02,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="editor-header">
              <div className="window-controls">
                <div className="control-dot dot-red"></div>
                <div className="control-dot dot-yellow"></div>
                <div className="control-dot dot-green"></div>
              </div>
              <div className="editor-title">mern-stack.js</div>
            </div>
            <div className="code-content">
              {[
                {
                  line: 1,
                  content: `<span class="keyword">import</span> <span class="bracket">{</span> <span class="function">Developer</span> <span class="bracket">}</span> <span class="keyword">from</span> <span class="string">'excellence'</span>;`,
                },
                {
                  line: 2,
                  content: `<span class="keyword">const</span> <span class="function">aniket</span> = <span class="keyword">new</span> <span class="function">Developer</span><span class="bracket">()</span>;`,
                },
                { line: 3, content: `` },
                {
                  line: 4,
                  content: `<span class="property">aniket</span>.<span class="function">stack</span> = <span class="bracket">[</span>`,
                },
                {
                  line: 5,
                  content: `  <span class="string">'React'</span>, <span class="string">'Node.js'</span>, <span class="string">'MongoDB'</span>,`,
                },
                {
                  line: 6,
                  content: `  <span class="string">'Express'</span>, <span class="string">'Next.js'</span>, <span class="string">'AWS'</span>`,
                },
                {
                  line: 7,
                  content: `<span class="bracket">]</span>; <span class="comment">// Enterprise-grade solutions</span>`,
                },
              ].map(codeLine => (
                <motion.div
                  key={codeLine.line}
                  className="code-line"
                  data-line={codeLine.line}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + codeLine.line * 0.1 }}
                  dangerouslySetInnerHTML={{ __html: codeLine.content }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.a
        href="#about"
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        aria-label="Scroll to the about section"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 14L12 21L5 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 8L12 15L5 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.a>
    </section>
  );
};

export default HeroSection;
