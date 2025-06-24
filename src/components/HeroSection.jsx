import React from "react";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-container">
        {/* Left: Content */}
        <div className="hero-content">
          <div className="status-indicator">
            <div className="status-dot"></div>
            Available for Projects
          </div>

          <div className="hero-badge">Elite MERN Stack Developer</div>

          <h1 className="hero-title">
            Transform Your Vision Into Scalable Digital Reality
          </h1>

          <p className="hero-subtitle">
            I architect and build sophisticated web solutions that drive real
            business results. With advanced MERN stack expertise, I transform
            complex requirements into elegant, high-performance applications
            that scale.
          </p>

          <div className="cta-group">
            <a href="#contact" className="btn btn-primary">
              Hire Me
            </a>
            <a href="#portfolio" className="btn btn-secondary">
              View Projects
            </a>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">2+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">5+</span>
              <span className="stat-label">Projects Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">100%</span>
              <span className="stat-label">Client Satisfaction</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support Available</span>
            </div>
          </div>
        </div>

        {/* Right: Code window */}
        <div className="hero-visual">
          <div className="code-editor">
            <div className="editor-header">
              <div className="window-controls">
                <div className="control-dot dot-red" />
                <div className="control-dot dot-yellow" />
                <div className="control-dot dot-green" />
              </div>
              <div className="editor-title">mern-stack.js</div>
            </div>

            <div className="code-content">
              {[
                `import { Developer } from 'excellence';`,
                `const aniket = new Developer();`,
                ``,
                `aniket.stack = [`,
                `  'React', 'Node.js', 'MongoDB',`,
                `  'Express', 'Next.js', 'AWS'`,
                `]; // Enterprise-grade solutions`,
              ].map((line, i) => (
                <div className="code-line" data-line={i + 1} key={i}>
                  <code>{line}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <a href="#about" className="scroll-indicator">
        ↓
      </a>
    </section>
  );
};

export default HeroSection;
