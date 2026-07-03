/**
 * AboutSection
 *
 * Rebranded for engineering positioning per Requirements 3.1, 3.2, 3.3.
 * Content is sourced from src/content/about.ts via the aboutContent module.
 * Unauthored optional fields render a <Placeholder> sentinel via the TSX wrapper
 * from src/sections/shared/Placeholder.tsx rather than fabricated prose.
 *
 * NOTE: This file remains .jsx per Requirements 12.3 (existing JSX files are not
 * converted during the rebrand pass). The Placeholder component is imported as a
 * regular ES module — TypeScript interop works at runtime because the project uses
 * allowJs + react-jsx.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './AboutSection.css';

// Content module – sourced from typed about.ts
import { aboutContent } from '../content/about';
// Placeholder helpers (TS interop via allowJs)
import { isPlaceholder } from '../utils/placeholder';
import { Placeholder } from '../sections/shared/Placeholder';

/**
 * Render a string field or a Placeholder sentinel for unset fields.
 * @param {string | import('../utils/placeholder').Placeholder<string>} value
 */
const Field = ({ value }) => {
  if (isPlaceholder(value)) {
    return <Placeholder field={value.__field} />;
  }
  return <>{value}</>;
};

const codeLines = [
  {
    line: 1,
    content: `<span class="comment">// Engineering Approach</span>`,
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
    content: `    <span class="keyword">this</span>.<span class="property">reliability</span> = <span class="string">'production-grade'</span>;`,
  },
  {
    line: 5,
    content: `    <span class="keyword">this</span>.<span class="property">scalability</span> = <span class="string">'distributed'</span>;`,
  },
  {
    line: 6,
    content: `    <span class="keyword">this</span>.<span class="property">automation</span> = <span class="string">'AI-first'</span>;`,
  },
  { line: 7, content: `  <span class="bracket">}</span>` },
  { line: 8, content: `<span class="bracket">}</span>` },
];

const AboutSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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

          {/* Headline — always authored */}
          <p className="about-text" style={{ fontWeight: 600 }}>
            {aboutContent.headline}
          </p>

          {/* Intro paragraph — sourced from content module */}
          <p className="about-text">
            <Field value={aboutContent.introParagraph} />
          </p>

          {/* Approach paragraph */}
          <p className="about-text">
            <Field value={aboutContent.approachParagraph} />
          </p>

          {/* Background paragraph */}
          <p className="about-text">
            <Field value={aboutContent.backgroundParagraph} />
          </p>

          {/* Experience Timeline */}
          <motion.div
            className="experience-timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {aboutContent.timeline.map((entry, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3 className="timeline-item-title">{entry.period}</h3>
                  <p>{entry.label}</p>
                </div>
              </div>
            ))}
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
              <div className="editor-title">philosophy.ts</div>
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

          {/* Floating skill badges sourced from content module */}
          <motion.div
            className="skill-badges"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {aboutContent.skills.map((skill, index) => (
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
