import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

// Set document metadata
document.documentElement.lang = 'en';

// Add structured data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Aniket Kushwaha',
  jobTitle: ' MERN Stack Developer',
  description:
    'Full-Stack MERN Developer specializing in enterprise-grade web applications',
  url: window.location.href,
  sameAs: [
    'https://www.linkedin.com/in/aniket-kushwaha-ak/',
    'https://github.com/Aniketk8104',
    'https://x.com/Aniketkush89151',
  ],
  knowsAbout: [
    'React',
    'Node.js',
    'MongoDB',
    'Express.js',
    'JavaScript',
    'TypeScript',
  ],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Changu Kana Thakur College',
  },
};

const script = document.createElement('script');
script.type = 'application/ld+json';
script.text = JSON.stringify(structuredData);
document.head.appendChild(script);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
