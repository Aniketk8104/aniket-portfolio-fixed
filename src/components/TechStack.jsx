import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Tilt from "react-parallax-tilt";
import "./TechStack.css";

const TechStack = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const technologies = [
    { name: "React.js", icon: "⚛️", level: "Expert", color: "#61DAFB" },
    { name: "Node.js", icon: "🟢", level: "Expert", color: "#339933" },
    { name: "MongoDB", icon: "🍃", level: "Advanced", color: "#47A248" },
    { name: "Express.js", icon: "⚡", level: "Advanced", color: "#000000" },
    { name: "AWS", icon: "☁️", level: "Intermediate", color: "#FF9900" },
    { name: "Docker", icon: "🐳", level: "Intermediate", color: "#2496ED" },
    { name: "Next.js", icon: "📱", level: "Advanced", color: "#000000" },
    { name: "Git", icon: "🔧", level: "Expert", color: "#F05032" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="tech" className="tech-stack" ref={ref}>
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Technical Mastery</h2>
          <p className="section-subtitle">
            Advanced expertise in modern web technologies that power enterprise
            applications
          </p>
        </motion.div>

        <motion.div
          className="tech-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {technologies.map((tech, index) => (
            <motion.div key={tech.name} variants={itemVariants}>
              <Tilt
                className="tech-card-wrapper"
                tiltMaxAngleX={15}
                tiltMaxAngleY={15}
                perspective={1000}
                scale={1.05}
                transitionSpeed={1000}
                gyroscope={true}
              >
                <motion.div
                  className="tech-card"
                  whileHover={{
                    borderColor: tech.color,
                    boxShadow: `0 20px 40px ${tech.color}40`,
                  }}
                  style={{ "--tech-color": tech.color }}
                >
                  <motion.div
                    className="tech-icon"
                    animate={{
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    {tech.icon}
                  </motion.div>
                  <h3 className="tech-name">{tech.name}</h3>
                  <p className="tech-level">{tech.level}</p>

                  {/* Progress Bar */}
                  <div className="tech-progress">
                    <motion.div
                      className="tech-progress-bar"
                      initial={{ width: 0 }}
                      animate={
                        inView
                          ? {
                              width:
                                tech.level === "Expert"
                                  ? "95%"
                                  : tech.level === "Advanced"
                                  ? "80%"
                                  : "65%",
                            }
                          : {}
                      }
                      transition={{ duration: 1, delay: index * 0.1 }}
                      style={{ background: tech.color }}
                    />
                  </div>
                </motion.div>
              </Tilt>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;
