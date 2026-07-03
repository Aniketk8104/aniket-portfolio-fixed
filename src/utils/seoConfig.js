// SEO Configuration for AniketDev.tech
// Rebranded per Requirements 2.2, 3.2, 14.4 — no freelance/MERN positioning.
export const seoConfig = {
  // Basic Site Information
  siteName: 'Aniket Kushwaha — Software Engineer',
  siteUrl: 'https://aniketdev.tech',
  defaultTitle:
    'Aniket Kushwaha — Software Engineer · Backend · Platform · AI Automation',
  defaultDescription:
    'Aniket Kushwaha is a Software Engineer specialising in backend systems, platform infrastructure, and AI automation pipelines. Building production-grade distributed systems.',

  // Keywords for different pages
  keywords: {
    home: 'software engineer, backend engineer, platform engineer, AI automation, distributed systems, Node.js, React, cloud infrastructure, system design, engineering portfolio',
    about:
      'Aniket Kushwaha engineer, backend engineer background, platform engineering experience, software engineer Mumbai, Computer Science graduate developer',
    portfolio:
      'engineering projects, React applications, Node.js backends, distributed systems, AI automation projects, engineering portfolio, web application development',
    contact:
      'hire software engineer, backend engineer contact, engineering services, distributed systems consulting, platform engineering',
  },

  // Author Information
  author: {
    name: 'Aniket Kushwaha',
    alternateName: 'AniketDev',
    email: 'kushwahaaniket141@gmail.com',
    phone: '+91-8104661596',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
  },

  // Social Media
  social: {
    linkedin: 'https://www.linkedin.com/in/aniket-kushwaha-ak/',
    github: 'https://github.com/Aniketk8104',
    twitter: 'https://x.com/Aniketkush89151',
    upwork:
      'https://www.upwork.com/freelancers/~017984919599104192?mp_source=share',
  },

  // Technical Skills for Schema
  skills: [
    'Backend Engineering',
    'Platform Engineering',
    'Distributed Systems',
    'AI Automation Pipelines',
    'Node.js Development',
    'React.js Development',
    'TypeScript Development',
    'System Design',
    'REST API Development',
    'GraphQL',
    'AWS Cloud Services',
    'Docker Containerization',
    'Next.js Framework',
    'Tailwind CSS',
    'Material-UI',
    'Socket.io',
    'JWT Authentication',
    'Payment Gateway Integration',
    'Progressive Web Apps',
    'Performance Optimization',
  ],

  // Service Offerings
  services: [
    {
      name: 'Backend & Platform Engineering',
      description:
        'Production-grade backend services, APIs, and platform infrastructure',
      category: 'Backend Engineering',
    },
    {
      name: 'Distributed Systems Design',
      description:
        'Multi-tenant SaaS platforms, distributed messaging, and event-driven architectures',
      category: 'Systems Engineering',
    },
    {
      name: 'AI Automation Pipelines',
      description:
        'Reliable LLM integrations, agentic workflows, and inference pipelines',
      category: 'AI Engineering',
    },
    {
      name: 'Cloud Infrastructure & DevOps',
      description: 'CI/CD pipelines, IaC, and cloud deployments on AWS, Railway, Fly.io',
      category: 'Platform Engineering',
    },
    {
      name: 'API Development & Integration',
      description: 'RESTful and GraphQL APIs with rate-limiting, auth, and observability',
      category: 'API Development',
    },
    {
      name: 'Performance & Reliability Engineering',
      description: 'Core Web Vitals optimization, security hardening, and observability',
      category: 'Reliability Engineering',
    },
  ],

  // Images
  images: {
    og: '/logo512.png',
    twitter: '/logo512.png',
    favicon: '/favicon.ico',
    appleTouchIcon: '/favicon-192.png',
  },

  // Business Information
  business: {
    type: 'ProfessionalService',
    serviceArea: 'Worldwide (Remote Services)',
    languages: ['English', 'Hindi'],
    priceRange: '$$',
    rating: {
      value: '4.9',
      count: '25',
    },
  },

  // Page-specific configurations
  pages: {
    home: {
      title:
        'Aniket Kushwaha — Software Engineer · Backend · Platform · AI Automation',
      description:
        'Aniket Kushwaha is a Software Engineer specialising in backend systems, platform infrastructure, and AI automation pipelines. Building production-grade distributed systems.',
      canonical: 'https://aniketdev.tech',
    },
    about: {
      title: 'About Aniket Kushwaha — Software & Platform Engineer',
      description:
        'Learn about Aniket Kushwaha, Software Engineer and Platform Engineer from Mumbai. Specialising in backend systems, distributed architectures, and AI automation.',
      canonical: 'https://aniketdev.tech/#about',
    },
    portfolio: {
      title: 'Engineering Projects — Aniket Kushwaha',
      description:
        'Explore engineering projects by Aniket Kushwaha — distributed systems, backend APIs, AI automation pipelines, and platform infrastructure.',
      canonical: 'https://aniketdev.tech/#portfolio',
    },
    contact: {
      title: 'Contact Aniket Kushwaha — Software & Platform Engineer',
      description:
        'Get in touch with Aniket Kushwaha for engineering engagements — backend systems, platform infrastructure, and AI automation projects.',
      canonical: 'https://aniketdev.tech/#contact',
    },
  },
};

// Generate structured data for different schema types
export const generatePersonSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['Person', 'ProfessionalService'],
  name: seoConfig.author.name,
  alternateName: seoConfig.author.alternateName,
  jobTitle: 'Software Engineer · Backend · Platform · AI Automation',
  description: seoConfig.defaultDescription,
  url: seoConfig.siteUrl,
  image: `${seoConfig.siteUrl}${seoConfig.images.og}`,
  sameAs: Object.values(seoConfig.social),
  knowsAbout: seoConfig.skills,
  email: seoConfig.author.email,
  telephone: seoConfig.author.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: seoConfig.author.location.city,
    addressRegion: seoConfig.author.location.state,
    addressCountry: seoConfig.author.location.country,
  },
  offers: {
    '@type': 'Service',
    serviceType: 'Software Engineering',
    description: 'Backend engineering, platform infrastructure, and AI automation pipeline services',
    provider: {
      '@type': 'Person',
      name: seoConfig.author.name,
    },
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Engineering Services',
    itemListElement: seoConfig.services.map(service => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.name,
        description: service.description,
        category: service.category,
      },
    })),
  },
  availableLanguage: seoConfig.business.languages,
  serviceArea: {
    '@type': 'Place',
    name: seoConfig.business.serviceArea,
  },
  priceRange: seoConfig.business.priceRange,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: seoConfig.business.rating.value,
    reviewCount: seoConfig.business.rating.count,
  },
});

// Generate breadcrumb schema
export const generateBreadcrumbSchema = currentPage => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: seoConfig.siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: currentPage,
      item: `${seoConfig.siteUrl}/#${currentPage.toLowerCase()}`,
    },
  ],
});

// Generate FAQ schema for common questions
export const generateFAQSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What areas do you specialise in as a Software Engineer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'I specialise in backend engineering, platform infrastructure, distributed systems, and AI automation pipelines. I build production-grade systems using Node.js, React, cloud platforms, and modern DevOps tooling.',
      },
    },
    {
      '@type': 'Question',
      name: 'What kinds of engineering projects do you take on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'I work on backend API services, multi-tenant SaaS platforms, distributed messaging architectures, event-driven systems, AI automation pipelines, and cloud infrastructure projects. Contact me to discuss your specific engineering needs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you work with clients worldwide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, I provide remote engineering services to clients worldwide. I work across different time zones and communicate effectively in English and Hindi.',
      },
    },
    {
      '@type': 'Question',
      name: 'What technologies and platforms do you work with?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'I work with Node.js, React, TypeScript, Python, PostgreSQL, MongoDB, Redis, AWS, Railway, Fly.io, Docker, and various AI/LLM APIs. I prioritise production reliability, observability, and long-term maintainability.',
      },
    },
  ],
});

export default seoConfig;
