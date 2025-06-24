import React from "react";
import "./Portfolio.css";

const projects = [
  {
    image: "AuraTech",
    title: "AuraTechServices.in",
    description:
      "A sophisticated enterprise platform showcasing cutting-edge technology solutions. Features dynamic content management, real-time data processing, and seamless user experience across all devices.",
    tags: ["React", "Node.js", "MongoDB", "Express", "AWS"],
    live: "https://auratechservices.in",
    caseStudy: "#",
  },
  {
    image: "E-Commerce",
    title: "E-Commerce Platform",
    description:
      "Full-featured e-commerce solution with advanced product management, secure payment integration, real-time inventory tracking, and responsive design for optimal mobile experience.",
    tags: ["Next.js", "Stripe API", "PostgreSQL", "Redux"],
    live: "#",
    caseStudy: "#",
  },
  {
    image: "Dashboard",
    title: "Data Analytics Dashboard",
    description:
      "Real-time data visualization dashboard with custom charting, user authentication, and API integrations. Processes large datasets efficiently with optimized MongoDB queries.",
    tags: ["React", "D3.js", "JWT Auth", "REST API"],
    live: "#",
    caseStudy: "#",
  },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="portfolio">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            Showcasing enterprise-grade applications and innovative solutions
          </p>
        </div>
        <div className="portfolio-grid">
          {projects.map((project) => (
            <div className="project-card" key={project.title}>
              <div className="project-image">{project.image}</div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="tech-tags">
                  {project.tags.map((tag, i) => (
                    <span className="tech-tag" key={i}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  <a
                    href={project.live}
                    className="project-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live Demo
                  </a>
                  <a href={project.caseStudy} className="project-link">
                    Case Study
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
