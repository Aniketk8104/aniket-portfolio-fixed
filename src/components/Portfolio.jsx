import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Portfolio.css";

const Portfolio = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredProject, setHoveredProject] = useState(null);

  const projects = [
    {
      id: 1,
      title: "AuraTechServices.in",
      category: "enterprise",
      description:
        "A sophisticated enterprise platform showcasing cutting-edge technology solutions. Features dynamic content management, real-time data processing, and seamless user experience across all devices.",
      image: "AuraTech",
      techStack: ["React", "Node.js", "MongoDB", "Express", "AWS"],
      liveLink: "https://auratechservices.in",
      features: [
        "Real-time Analytics",
        "Cloud Infrastructure",
        "API Integration",
        "Responsive Design",
      ],
    },
    {
      id: 2,
      title: "E-Commerce Platform",
      category: "ecommerce",
      description:
        "Full-featured e-commerce solution with advanced product management, secure payment integration, real-time inventory tracking, and responsive design for optimal mobile experience.",
      image: "E-Commerce",
      techStack: ["Next.js", "Stripe API", "PostgreSQL", "Redux"],
      features: [
        "Payment Gateway",
        "Inventory Management",
        "User Authentication",
        "Order Tracking",
      ],
    },
    {
      id: 3,
      title: "Data Analytics Dashboard",
      category: "dashboard",
      description:
        "Real-time data visualization dashboard with custom charting, user authentication, and API integrations. Processes large datasets efficiently with optimized MongoDB queries.",
      image: "Dashboard",
      techStack: ["React", "D3.js", "JWT Auth", "REST API"],
      features: [
        "Data Visualization",
        "Real-time Updates",
        "Custom Charts",
        "Export Features",
      ],
    },
  ];

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "enterprise", label: "Enterprise" },
    { id: "ecommerce", label: "E-Commerce" },
    { id: "dashboard", label: "Dashboards" },
  ];

  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  return (
    <section id="portfolio" className="portfolio" ref={ref}>
      <div className="section-container">
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
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.id ? "active" : ""
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                whileHover={{ y: -20 }}
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
