import React from "react";
import AnimatedBackground from "./components/AnimatedBackground";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TechStack from "./components/TechStack";
import AboutSection from "./components/AboutSection";
import Portfolio from "./components/Portfolio";
import Testimonials from "./components/Testimonials";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import "./App.css"; // include global styles

const App = () => {
  return (
    <div className="app">
      <AnimatedBackground />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TechStack />
      <Portfolio />
      <Testimonials />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default App;
