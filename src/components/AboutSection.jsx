import React from "react";
import "./AboutSection.css";

const AboutSection = () => {
  return (
    <section id="about" className="about">
      <div className="about-container">
        {/* Left: Text */}
        <div className="about-content">
          <h2>About Me</h2>
          <p className="about-text">
            I'm a Computer Science graduate and{" "}
            <span className="highlight">elite full-stack developer</span>{" "}
            specializing in the MERN stack. With advanced expertise in MongoDB,
            Express.js, React, and Node.js, I don't just use these
            technologies—I leverage their full potential to create
            lightning-fast, scalable applications that handle enterprise-level
            traffic and complexity.
          </p>
          <p className="about-text">
            My approach goes beyond coding. I{" "}
            <span className="highlight">engineer solutions</span> by thoroughly
            analyzing requirements, designing scalable architecture, and
            delivering thoroughly tested, production-ready applications with
            clean, maintainable code.
          </p>
          <p className="about-text">
            Currently pursuing my Bachelor's degree in Computer Science from
            Changu Kana Thakur College, I combine academic rigor with practical
            experience to deliver exceptional results.
          </p>

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

        {/* Right: Code philosophy window */}
        <div className="hero-visual">
          <div className="code-editor">
            <div className="editor-header">
              <div className="window-controls">
                <div className="control-dot dot-red" />
                <div className="control-dot dot-yellow" />
                <div className="control-dot dot-green" />
              </div>
              <div className="editor-title">philosophy.js</div>
            </div>

            <div className="code-content">
              <div className="code-line" data-line="1">
                <span className="comment">// My Development Approach</span>
              </div>
              <div className="code-line" data-line="2">
                <span className="keyword">class</span>{" "}
                <span className="function">MyWork</span> {"{"}
              </div>
              <div className="code-line" data-line="3">
                <span className="function">constructor</span>() {"{"}
              </div>
              <div className="code-line" data-line="4">
                <span className="keyword">this</span>.performance ={" "}
                <span className="string">'optimized'</span>;
              </div>
              <div className="code-line" data-line="5">
                <span className="keyword">this</span>.scalability ={" "}
                <span className="string">'enterprise'</span>;
              </div>
              <div className="code-line" data-line="6">
                <span className="keyword">this</span>.codeQuality ={" "}
                <span className="string">'excellent'</span>;
              </div>
              <div className="code-line" data-line="7">
                {"}"}
              </div>
              <div className="code-line" data-line="8">
                {"}"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
