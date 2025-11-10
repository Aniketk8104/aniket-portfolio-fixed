import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Testimonials.css";

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "Aniket delivered exceptional work on our AuraTechServices.in platform. His MERN stack expertise is outstanding - built a lightning-fast, fully responsive web application from scratch with complex functionality and sub-2-second load times. What impressed me most: his ability to understand business requirements and translate them into clean, production-ready code. Excellent communication, delivered on time, and solved every technical challenge we threw at him. The final product exceeded expectations and significantly boosted our digital presence. Highly recommend Aniket for serious web development projects - he's the real deal.",
      author: "Arun K.",
      position: "Founder & Technical Director",
      company: "AuraTech Services",
      rating: 5,
    },
    // {
    //   id: 2,
    //   text: "Working with Aniket was an absolute pleasure. His technical skills are matched only by his professionalism and dedication to delivering high-quality solutions. The e-commerce platform he built for us handles thousands of concurrent users without breaking a sweat. His attention to security, performance optimization, and user experience is exceptional.",
    //   author: "Sarah M.",
    //   position: "CEO",
    //   company: "Digital Commerce Inc.",
    //   rating: 5,
    // },
    // {
    //   id: 3,
    //   text: "Aniket transformed our data visualization needs into an intuitive, powerful dashboard that our entire team loves. His expertise in React and D3.js created smooth, interactive charts that make complex data easy to understand. He went above and beyond, implementing features we didn't even know we needed.",
    //   author: "Michael R.",
    //   position: "Data Analytics Manager",
    //   company: "Analytics Pro",
    //   rating: 5,
    // },
  ];

  const nextTestimonial = () => {
    setActiveTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial(
      prev => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="testimonials" ref={ref}>
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Client Testimonials</h2>
          <p className="section-subtitle">
            What industry leaders say about my work
          </p>
        </motion.div>

        <div className="testimonials-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              className="testimonial-card"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div className="quote-icon">❝</div>

              {/* Rating Stars */}
              <div className="rating-stars">
                {[...Array(testimonials[activeTestimonial].rating)].map(
                  (_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      ⭐
                    </motion.span>
                  )
                )}
              </div>

              <p className="testimonial-text">
                "{testimonials[activeTestimonial].text}"
              </p>

              <div className="testimonial-author">
                <motion.div
                  className="author-avatar"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {testimonials[activeTestimonial].author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </motion.div>
                <div className="author-info">
                  <h3 className="testimonial-author-name">
                    {testimonials[activeTestimonial].author}
                  </h3>
                  <p>{testimonials[activeTestimonial].position}</p>
                  <span>{testimonials[activeTestimonial].company}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="testimonial-nav">
            <motion.button
              className="nav-btn prev"
              onClick={prevTestimonial}
              type="button"
              aria-label="Show previous testimonial"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>

            <div className="nav-dots">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  className={`nav-dot ${
                    index === activeTestimonial ? "active" : ""
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                  type="button"
                  aria-label={`Show testimonial ${index + 1}`}
                  aria-pressed={index === activeTestimonial}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>

            <motion.button
              className="nav-btn next"
              onClick={nextTestimonial}
              type="button"
              aria-label="Show next testimonial"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="trust-indicators"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="trust-item">
            <div className="trust-number">100%</div>
            <div className="trust-label">Client Satisfaction</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">5.0</div>
            <div className="trust-label">Average Rating</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">5+</div>
            <div className="trust-label">Happy Clients</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
