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
      text: "Aniket delivered exceptional work on our AuraTechServices.in platform. His backend engineering is outstanding — built a lightning-fast, fully responsive platform from scratch with complex payment flows and sub-2-second load times. What impressed me most: his ability to understand business requirements and translate them into clean, production-ready systems. Excellent communication, delivered on time, and solved every technical challenge we threw at him. The final product exceeded expectations and significantly boosted our digital presence. Highly recommend Aniket for serious engineering projects — he's the real deal.",
      author: "Arun K.",
      position: "Founder & Technical Director",
      company: "AuraTech Services",
      rating: 5,
    },
    // {
    //   id: 2,
    //   text: "Working with Aniket was an absolute pleasure. His technical skills are matched only by his professionalism and dedication to delivering high-quality solutions. The platform he built for us handles thousands of concurrent users without breaking a sweat. His attention to security, performance optimization, and distributed systems design is exceptional.",
    //   author: "Sarah M.",
    //   position: "CEO",
    //   company: "Digital Commerce Inc.",
    //   rating: 5,
    // },
    // {
    //   id: 3,
    //   text: "Aniket transformed our data requirements into an intuitive, powerful analytics platform that our entire team relies on. His expertise in backend architecture and real-time data pipelines produced smooth, interactive dashboards that make complex operational data easy to act on. He went above and beyond, implementing features we didn't even know we needed.",
    //   author: "Michael R.",
    //   position: "Head of Data Engineering",
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
          <h2 className="section-title">What Clients Say</h2>
          <p className="section-subtitle">
            Feedback from engineering engagements
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
              <div className="quote-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                  <path d="M9.5 6C6.46 6 4 8.46 4 11.5V18h6.5v-6.5H7.5c0-1.66 1.34-3 3-3V6Zm10 0C16.46 6 14 8.46 14 11.5V18h6.5v-6.5h-3c0-1.66 1.34-3 3-3V6Z" />
                </svg>
              </div>

              {/* Rating Stars */}
              <div className="rating-stars" aria-label={`Rated ${testimonials[activeTestimonial].rating} out of 5`}>
                {[...Array(testimonials[activeTestimonial].rating)].map(
                  (_, i) => (
                    <motion.svg
                      key={i}
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                      aria-hidden="true"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <path d="m12 17.27 5.18 3.12-1.37-5.9 4.58-3.97-6.03-.52L12 4.5 9.64 10l-6.03.52 4.58 3.97-1.37 5.9L12 17.27Z" />
                    </motion.svg>
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
            <div className="trust-label">Delivery Rate</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">5.0</div>
            <div className="trust-label">Average Rating</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">5+</div>
            <div className="trust-label">Engineering Engagements</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
