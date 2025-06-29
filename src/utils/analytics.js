// Google Analytics 4 setup
export const initGA = () => {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    page_path: window.location.pathname,
    cookie_flags: 'SameSite=None;Secure',
  });

  return gtag;
};

// Track events
export const trackEvent = (action, category, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track page views
export const trackPageView = url => {
  if (window.gtag) {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: url,
    });
  }
};

// Performance tracking to GA
export const trackPerformance = metrics => {
  if (window.gtag) {
    // Track Core Web Vitals
    if (metrics.name === 'LCP') {
      window.gtag('event', 'LCP', {
        event_category: 'Web Vitals',
        value: Math.round(metrics.value),
        event_label: metrics.id,
      });
    }

    if (metrics.name === 'FID') {
      window.gtag('event', 'FID', {
        event_category: 'Web Vitals',
        value: Math.round(metrics.value),
        event_label: metrics.id,
      });
    }

    if (metrics.name === 'CLS') {
      window.gtag('event', 'CLS', {
        event_category: 'Web Vitals',
        value: Math.round(metrics.value * 1000),
        event_label: metrics.id,
      });
    }
  }
};
