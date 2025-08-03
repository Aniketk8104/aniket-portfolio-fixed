import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './ContactSection.css';

const ContactSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    message: '',
  });

  const [hoveredCard, setHoveredCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Reset form on successful submission
        setFormData({
          name: '',
          email: '',
          project: '',
          message: '',
        });
        alert('Thank you! Your message has been sent successfully.');
      } else {
        alert('Oops! There was a problem submitting your form. Please try again.');
      }
    } catch (error) {
      alert('Oops! There was a problem submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      id: 'email',
      icon: '✉️',
      title: 'Email Me',
      info: 'Kushwahaaniket141@gmail.com',
      link: 'https://mail.google.com/mail/?view=cm&fs=1&to=Kushwahaaniket141@gmail.com',
      color: '#667eea',
    },
    {
      id: 'linkedin',
      icon: '🔗',
      title: 'LinkedIn',
      info: '/in/aniket-kushwaha',
      link: 'https://www.linkedin.com/in/aniket-kushwaha-ak/',
      color: '#0077b5',
    },
    {
      id: 'github',
      icon: '💻',
      title: 'GitHub',
      info: '/aniket',
      link: 'https://github.com/Aniketk8104',
      color: '#333333',
    },
    {
      id: 'upwork',
      icon: '🆙',
      title: 'Upwork',
      info: '/freelancers/aniket',
      link: 'https://www.upwork.com/freelancers/~017984919599104192?mp_source=share',
      color: '#14a800',
    },
  ];

  return (
    <section id="contact" className="contact" ref={ref}>
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Let's Build Something Amazing</h2>
          <p className="section-subtitle">
            Get in touch to discuss your project requirements
          </p>
        </motion.div>

        <div className="contact-content">
          {/* Contact Form */}
          <motion.div
            className="contact-form-wrapper"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form
              action="https://formspree.io/f/mqaldddn"
              method="POST"
              onSubmit={handleSubmit}
              className="contact-form"
            >
              <div className="form-group">
                <motion.input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="form-group">
                <motion.input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="form-group">
                <motion.select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="">Select Project Type</option>
                  <option value="web-app">Web Application</option>
                  <option value="e-commerce">E-Commerce Platform</option>
                  <option value="mobile-app">Mobile Application</option>
                  <option value="consultation">Technical Consultation</option>
                  <option value="other">Other</option>
                </motion.select>
              </div>
              <div className="form-group">
                <motion.textarea
                  name="message"
                  placeholder="Tell me about your project..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <motion.button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 2L11 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 2L15 22L11 13L2 9L22 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            className="contact-methods"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="methods-title">Connect With Me</h3>
            <div className="contact-grid">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={method.id}
                  href={method.link}
                  className="contact-card"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onMouseEnter={() => setHoveredCard(method.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  whileHover={{ y: -10 }}
                  style={{
                    '--hover-color': method.color,
                  }}
                >
                  <motion.div
                    className="contact-icon"
                    animate={{
                      rotate: hoveredCard === method.id ? 360 : 0,
                      scale: hoveredCard === method.id ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {method.icon}
                  </motion.div>
                  <h3 className="contact-title">{method.title}</h3>
                  <p className="contact-info">{method.info}</p>
                </motion.a>
              ))}
            </div>

            {/* Availability Status */}
            <motion.div
              className="availability-status"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="status-badge">
                <div className="status-dot"></div>
                <span>Currently Available for Projects</span>
              </div>
              <p className="response-time">
                Typical response time: <strong>Within 24 hours</strong>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
