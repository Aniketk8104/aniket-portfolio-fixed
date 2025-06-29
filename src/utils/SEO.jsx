import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'Aniket Kushwaha -  MERN Stack Developer',
  description = ' Full-Stack MERN Developer specializing in enterprise-grade web applications. Computer Science graduate with proven track record delivering lightning-fast, scalable solutions.',
  keywords = 'MERN developer, React developer, Node.js expert, Full stack developer India, MongoDB specialist, Enterprise web development, Freelance developer',
  image = '/og-image.jpg',
  url = 'https://aniket-portfolio.com',
  author = 'Aniket Kushwaha',
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aniket Kushwaha',
    alternateName: 'Aniket',
    jobTitle: ' MERN Stack Developer',
    description: description,
    url: url,
    image: `${url}${image}`,
    sameAs: [
      'https://www.linkedin.com/in/aniket-kushwaha-ak/',
      'https://github.com/Aniketk8104',
      'https://x.com/Aniketkush89151',
      'https://www.upwork.com/freelancers/~017984919599104192?mp_source=share',
    ],
    email: 'kushwahaaniket141@gmail.com',
    telephone: '+91-8104661596',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Changu Kana Thakur College',
      url: 'https://cktcollege.edu.in',
    },
    knowsAbout: [
      'React.js',
      'Node.js',
      'MongoDB',
      'Express.js',
      'JavaScript',
      'TypeScript',
      'AWS',
      'Docker',
      'Next.js',
      'GraphQL',
      'REST API',
      'Git',
    ],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      educationalLevel: "Bachelor's Degree",
      competencyRequired: 'Computer Science',
    },
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Full Stack Developer',
      occupationalCategory: '15-1254.00',
      skills: 'MERN Stack Development',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'Freelance',
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Aniket Kushwaha Portfolio" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${url}${image}`} />
      <meta property="twitter:creator" content="@aniket" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#667eea" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="format-detection" content="telephone=no" />

      {/* Geo Tags */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Mumbai" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
