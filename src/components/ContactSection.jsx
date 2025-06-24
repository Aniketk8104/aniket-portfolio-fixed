import React from "react";
import "./ContactSection.css";

const contactLinks = [
  {
    label: "Email",
    value: "aniket@example.com",
    href: "mailto:aniket@example.com",
    icon: "✉️",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/aniketdev",
    href: "https://linkedin.com/in/aniketdev",
    icon: "💼",
  },
  {
    label: "GitHub",
    value: "github.com/aniket-dev",
    href: "https://github.com/aniket-dev",
    icon: "🐱",
  },
  {
    label: "Upwork",
    value: "upwork.com/freelancers/aniketdev",
    href: "https://www.upwork.com/freelancers/~aniketdev",
    icon: "🧑‍💻",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="contact">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Let's Work Together</h2>
          <p className="section-subtitle">
            Ready to start your next project? Reach out via any of the channels
            below.
          </p>
        </div>

        <div className="contact-grid">
          {contactLinks.map(({ label, value, href, icon }) => (
            <a
              key={label}
              href={href}
              className="contact-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="contact-icon">{icon}</div>
              <div className="contact-info">
                <div className="contact-label">{label}</div>
                <div className="contact-value">{value}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
