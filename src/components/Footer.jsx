import React from "react";
import "./Footer.css";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/aniket-dev",
    icon: "🐱",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/aniketdev",
    icon: "💼",
  },
  {
    label: "Upwork",
    href: "https://upwork.com/freelancers/~aniketdev",
    icon: "🧑‍💻",
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top-border" />
      <div className="footer-content">
        <div className="footer-socials">
          {socialLinks.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              className="footer-link"
              target="_blank"
              rel="noopener noreferrer"
              title={label}
            >
              {icon}
            </a>
          ))}
        </div>
        <p className="footer-text">
          © {new Date().getFullYear()} Aniket Kushwaha. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
