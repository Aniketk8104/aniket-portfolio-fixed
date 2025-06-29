import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./AboutSection.css";

const AboutSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const codeLines = [
    {
      line: 1,
      content: `<span class="comment">// My Development Approach</span>`,
    },
    {
      line: 2,
      content: `<span class="keyword">class</span> <span class="function">MyWork</span> <span class="bracket">{</span>`,
    },
    {
      line: 3,
      content: `  <span class="function">constructor</span><span class="bracket">()</span> <span class="bracket">{</span>`,
    },
    {
      line: 4,
      content: `    <span class="keyword">this</span>.<span class="property">performance</span> = <span class="string">'optimized'</span>;`,
    },
    {
      line: 5,
      content: `    <span class="keyword">this</span>.<span class="property">scalability</span> = <span class="string">'enterprise'</span>;`,
    },
    {
      line: 6,
      content: `    <span class="keyword">this</span>.<span class="property">codeQuality</span> = <span class="string">'excellent'</span>;`,
    },
    { line: 7, content: `  <span class="bracket">}</span>` },
    { line: 8, content: `<span class="bracket">}</span>` },
  ];

  return (
    <section id="about" className="about" ref={ref}>
      <div className="about-container">
        <motion.div
          className="about-content"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
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

          {/* Experience Timeline */}
          <motion.div
            className="experience-timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>2023 - Present</h4>
                <p>Elite MERN Stack Developer</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>2022 - 2023</h4>
                <p>Full Stack Development Journey</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>2021 - Present</h4>
                <p>B.Sc Computer Science - CKT College</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="code-editor about-code">
            <div className="editor-header">
              <div className="window-controls">
                <div className="control-dot dot-red"></div>
                <div className="control-dot dot-yellow"></div>
                <div className="control-dot dot-green"></div>
              </div>
              <div className="editor-title">philosophy.js</div>
            </div>
            <div className="code-content">
              {codeLines.map((codeLine, index) => (
                <motion.div
                  key={codeLine.line}
                  className="code-line"
                  data-line={codeLine.line}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  dangerouslySetInnerHTML={{ __html: codeLine.content }}
                />
              ))}
            </div>
          </div>

          {/* Floating skill badges */}
          <motion.div
            className="skill-badges"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[
              "Problem Solver",
              "Team Player",
              "Quick Learner",
              "Creative Thinker",
            ].map((skill, index) => (
              <motion.div
                key={skill}
                className="skill-badge"
                animate={{
                  y: [0, -10, 0],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
              >
                {skill}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
