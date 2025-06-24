import React from "react";
import "./TechStack.css";

const techs = [
  { icon: "⚛️", name: "React.js", level: "Expert" },
  { icon: "🟢", name: "Node.js", level: "Expert" },
  { icon: "🍃", name: "MongoDB", level: "Advanced" },
  { icon: "⚡", name: "Express.js", level: "Advanced" },
  { icon: "☁️", name: "AWS", level: "Intermediate" },
  { icon: "🐳", name: "Docker", level: "Intermediate" },
  { icon: "📱", name: "Next.js", level: "Advanced" },
  { icon: "🔧", name: "Git", level: "Expert" },
];

const TechStack = () => {
  return (
    <section id="tech" className="tech-stack">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Technical Mastery</h2>
          <p className="section-subtitle">
            Advanced expertise in modern web technologies that power enterprise
            applications
          </p>
        </div>
        <div className="tech-grid">
          {techs.map(({ icon, name, level }) => (
            <div className="tech-card" key={name}>
              <div className="tech-icon">{icon}</div>
              <h3 className="tech-name">{name}</h3>
              <p className="tech-level">{level}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
