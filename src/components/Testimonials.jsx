import React from "react";
import "./Testimonials.css";

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Client Testimonials</h2>
          <p className="section-subtitle">
            What industry leaders say about my work
          </p>
        </div>

        <div className="testimonial-card">
          <div className="quote-icon">❝</div>
          <p className="testimonial-text">
            "Aniket delivered exceptional work on our AuraTechServices.in
            platform. His MERN stack expertise is outstanding - built a
            lightning-fast, fully responsive web application from scratch with
            complex functionality and sub-2-second load times. What impressed me
            most: his ability to understand business requirements and translate
            them into clean, production-ready code. Excellent communication,
            delivered on time, and solved every technical challenge we threw at
            him. The final product exceeded expectations and significantly
            boosted our digital presence. Highly recommend Aniket for serious
            web development projects - he's the real deal."
          </p>
          <div className="testimonial-author">
            <div className="author-avatar">AK</div>
            <div className="author-info">
              <h4>Arun K.</h4>
              <p>Founder & Technical Director</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
