import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Portfolio.css';

const Portfolio = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [neuralAdaptation, setNeuralAdaptation] = useState({
    userPreference: 'visual',
    interactionIntensity: 'medium',
    focusArea: 'general',
  });

  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Neural tracking for user behavior
  const [userBehavior, setUserBehavior] = useState({
    hoverTime: {},
    clickPatterns: [],
    scrollSections: [],
    preferredTech: [],
  });

  // Advanced mouse tracking with neural analysis
  const handleMouseMove = useCallback(
    e => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseX.set(x);
      mouseY.set(y);
      setMousePosition({ x, y });

      // Neural adaptation based on mouse behavior
      const speed = Math.sqrt(e.movementX ** 2 + e.movementY ** 2);
      if (speed > 30) {
        setNeuralAdaptation(prev => ({
          ...prev,
          interactionIntensity: 'high',
        }));
      } else if (speed < 5) {
        setNeuralAdaptation(prev => ({
          ...prev,
          interactionIntensity: 'low',
        }));
      }
    },
    [mouseX, mouseY]
  );

  // Track hover patterns for neural learning
  const handleProjectHover = useCallback((projectId, action) => {
    const timestamp = Date.now();

    if (action === 'enter') {
      setHoveredProject(projectId);
      setUserBehavior(prev => ({
        ...prev,
        hoverTime: {
          ...prev.hoverTime,
          [projectId]: timestamp,
        },
      }));
    } else if (action === 'leave') {
      setHoveredProject(null);
      setUserBehavior(prev => {
        const hoverDuration =
          timestamp - (prev.hoverTime[projectId] || timestamp);

        // Analyze hover patterns
        if (hoverDuration > 2000) {
          // User is interested in this type of project
          const project = projects.find(p => p.id === projectId);
          if (project) {
            return {
              ...prev,
              preferredTech: [
                ...new Set([
                  ...prev.preferredTech,
                  ...project.techStack.slice(0, 2),
                ]),
              ],
            };
          }
        }

        return prev;
      });
    }
  }, []);

  // Neural UI adaptation effects
  useEffect(() => {
    // Adapt UI based on user behavior patterns
    const adaptUI = () => {
      const { preferredTech, hoverTime } = userBehavior;

      // Determine user preference based on interaction patterns
      const avgHoverTime =
        Object.values(hoverTime).reduce((a, b) => a + b, 0) /
        Object.keys(hoverTime).length;

      if (avgHoverTime > 3000) {
        setNeuralAdaptation(prev => ({
          ...prev,
          userPreference: 'detailed',
          focusArea: 'technical',
        }));
      } else if (
        preferredTech.includes('React') ||
        preferredTech.includes('JavaScript')
      ) {
        setNeuralAdaptation(prev => ({
          ...prev,
          focusArea: 'frontend',
        }));
      } else if (
        preferredTech.includes('Node.js') ||
        preferredTech.includes('MongoDB')
      ) {
        setNeuralAdaptation(prev => ({
          ...prev,
          focusArea: 'backend',
        }));
      }
    };

    const timer = setTimeout(adaptUI, 5000);
    return () => clearTimeout(timer);
  }, [userBehavior]);

  const projects = [
    {
      id: 1,
      title: 'AuraTechServices.in',
      category: 'enterprise',
      description:
        'A sophisticated enterprise platform showcasing cutting-edge technology solutions. Features dynamic content management, real-time data processing, and seamless user experience across all devices.',
      image: 'AuraTech',
      techStack: ['React', 'Node.js', 'MongoDB', 'Express', 'AWS'],
      liveLink: 'https://auratechservices.in',
      features: [
        'Real-time Analytics',
        'Cloud Infrastructure',
        'API Integration',
        'Responsive Design',
      ],
    },
    {
      id: 2,
      title: 'E-Commerce Platform',
      category: 'ecommerce',
      description:
        'Full-featured e-commerce solution with advanced product management, secure payment integration, real-time inventory tracking, and responsive design for optimal mobile experience.',
      image: 'DessertSafari',
      techStack: ['React.js', 'REST API', 'MongoDB'],
      features: [
        'Payment Gateway',
        'Inventory Management',
        'User Authentication',
        'Order Tracking',
      ],
    },
    {
      id: 3,
      title: 'Data Analytics Dashboard',
      category: 'dashboard',
      description:
        'Real-time data visualization dashboard with custom charting, user authentication, and API integrations. Processes large datasets efficiently with optimized MongoDB queries.',
      image: 'Dashboard',
      techStack: ['React', 'JWT Auth', 'REST API'],
      features: [
        'Data Visualization',
        'Real-time Updates',
        'Custom Charts',
        'Export Features',
      ],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'enterprise', label: 'Enterprise' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'dashboard', label: 'Dashboards' },
  ];

  const filteredProjects =
    selectedCategory === 'all'
      ? projects
      : projects.filter(project => project.category === selectedCategory);

  return (
    <section
      id="portfolio"
      className="portfolio"
      ref={ref}
      onMouseMove={handleMouseMove}
      data-neural-focus={neuralAdaptation.focusArea}
      data-interaction-intensity={neuralAdaptation.interactionIntensity}
    >
      <div className="section-container" ref={containerRef}>
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            Showcasing enterprise-grade applications and innovative solutions
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="category-filter"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.map(category => (
            <motion.button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.id ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div className="portfolio-grid" layout>
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="project-card"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness:
                    neuralAdaptation.interactionIntensity === 'high'
                      ? 400
                      : 200,
                  damping: 20,
                }}
                onMouseEnter={() => handleProjectHover(project.id, 'enter')}
                onMouseLeave={() => handleProjectHover(project.id, 'leave')}
                whileHover={{
                  y: -20,
                  rotateY:
                    neuralAdaptation.interactionIntensity === 'high' ? 5 : 0,
                  scale:
                    neuralAdaptation.userPreference === 'detailed'
                      ? 1.05
                      : 1.02,
                }}
              >
                <div className="project-image">
                  <div className="project-overlay">{project.image}</div>
                  {hoveredProject === project.id && (
                    <motion.div
                      className="project-features"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {project.features.map((feature, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>

                  <div className="tech-tags">
                    {project.techStack.map((tech, idx) => (
                      <motion.span
                        key={idx}
                        className="tech-tag"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>

                  <div className="project-links">
                    {project.liveLink && (
                      <motion.a
                        href={project.liveLink}
                        className="project-link"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 3H21V9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 14L21 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Live Demo
                      </motion.a>
                    )}
                    <motion.a
                      href="#"
                      className="project-link"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L2 7L12 12L22 7L12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 17L12 22L22 17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 12L12 17L22 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Case Study
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
