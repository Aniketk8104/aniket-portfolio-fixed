// SEO Configuration for AniketDev.tech
export const seoConfig = {
  // Basic Site Information
  siteName: 'AniketDev - MERN Stack Services',
  siteUrl: 'https://aniketdev.tech',
  defaultTitle:
    'Aniket Kushwaha - Freelance MERN Stack Developer | Custom Web Solutions',
  defaultDescription:
    'Hire Aniket Kushwaha, expert freelance MERN stack developer for custom web applications. Specializing in React, Node.js, MongoDB & Express.js. Fast delivery, scalable solutions for your business.',

  // Keywords for different pages
  keywords: {
    home: 'freelance MERN developer, hire MERN stack developer, React developer for hire, Node.js freelancer, MongoDB expert, Express.js developer, custom web development, MERN stack services, freelance full stack developer India, web application development',
    about:
      'Aniket Kushwaha developer, MERN stack expert background, freelance developer experience, full stack developer Mumbai, Computer Science graduate developer',
    portfolio:
      'MERN stack projects, React applications, Node.js projects, MongoDB database projects, Express.js APIs, freelance developer portfolio, web development work',
    contact:
      'hire MERN developer, freelance developer contact, web development services, custom web application quote, React developer hire',
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
    'React.js Development',
    'Node.js Backend Development',
    'MongoDB Database Design',
    'Express.js API Development',
    'JavaScript Programming',
    'TypeScript Development',
    'Full-Stack Web Development',
    'MERN Stack Architecture',
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
      name: 'Custom React Application Development',
      description:
        'Build responsive, scalable React.js applications with modern UI/UX',
      category: 'Frontend Development',
    },
    {
      name: 'Node.js Backend Development',
      description:
        'Robust server-side applications with Node.js and Express.js',
      category: 'Backend Development',
    },
    {
      name: 'MongoDB Database Solutions',
      description:
        'Efficient database design and optimization for scalable applications',
      category: 'Database Development',
    },
    {
      name: 'Full-Stack MERN Applications',
      description: 'Complete end-to-end web applications using the MERN stack',
      category: 'Full-Stack Development',
    },
    {
      name: 'API Development & Integration',
      description: 'RESTful APIs and third-party service integrations',
      category: 'API Development',
    },
    {
      name: 'Performance Optimization',
      description: 'Web application speed and performance improvements',
      category: 'Optimization',
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
        'Aniket Kushwaha - Freelance MERN Stack Developer | Custom Web Solutions',
      description:
        'Hire Aniket Kushwaha, expert freelance MERN stack developer for custom web applications. Specializing in React, Node.js, MongoDB & Express.js. Fast delivery, scalable solutions for your business.',
      canonical: 'https://aniketdev.tech',
    },
    about: {
      title: 'About Aniket Kushwaha - Expert MERN Stack Developer',
      description:
        'Learn about Aniket Kushwaha, experienced freelance MERN stack developer from Mumbai. Computer Science graduate with proven track record in React, Node.js, MongoDB development.',
      canonical: 'https://aniketdev.tech/#about',
    },
    portfolio: {
      title: 'MERN Stack Projects Portfolio - Aniket Kushwaha',
      description:
        'Explore MERN stack projects by Aniket Kushwaha. See React applications, Node.js backends, MongoDB databases, and Express.js APIs built for various clients.',
      canonical: 'https://aniketdev.tech/#portfolio',
    },
    contact: {
      title: 'Hire MERN Stack Developer - Contact Aniket Kushwaha',
      description:
        'Ready to hire a freelance MERN stack developer? Contact Aniket Kushwaha for custom web development projects using React, Node.js, MongoDB, and Express.js.',
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
  jobTitle: 'Freelance MERN Stack Developer',
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
    serviceType: 'Web Development',
    description: 'Custom MERN stack web application development services',
    provider: {
      '@type': 'Person',
      name: seoConfig.author.name,
    },
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'MERN Stack Development Services',
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
      name: 'What is MERN stack development?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MERN stack development uses MongoDB, Express.js, React, and Node.js to build full-stack web applications. It provides a complete JavaScript-based solution for both frontend and backend development.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does it cost to hire a MERN stack developer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The cost varies based on project complexity, timeline, and requirements. I offer competitive rates for freelance MERN stack development services. Contact me for a custom quote based on your specific needs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you work with clients worldwide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, I provide remote MERN stack development services to clients worldwide. I work across different time zones and communicate effectively in English and Hindi.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of projects do you work on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'I work on various projects including e-commerce websites, business applications, portfolio sites, social media platforms, and custom web applications using the MERN stack.',
      },
    },
  ],
});

export default seoConfig;
