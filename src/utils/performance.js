// Web Vitals monitoring
export const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Custom performance tracking
export class PerformanceTracker {
  constructor() {
    this.metrics = {};
    this.observers = new Map();
  }

  // Track page load performance
  trackPageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];

      this.metrics.pageLoad = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom:
          perfData.domContentLoadedEventEnd -
          perfData.domContentLoadedEventStart,
        load: perfData.loadEventEnd - perfData.loadEventStart,
        total: perfData.loadEventEnd - perfData.fetchStart,
      };

      console.log('Page Load Metrics:', this.metrics.pageLoad);
    });
  }

  // Track Largest Contentful Paint
  trackLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.log('LCP:', this.metrics.lcp);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    }
  }

  // Track Cumulative Layout Shift
  trackCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let clsEntries = [];

      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }
        this.metrics.cls = clsValue;
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', observer);
    }
  }

  // Track First Input Delay
  trackFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.metrics.fid = entry.processingStart - entry.startTime;
          console.log('FID:', this.metrics.fid);
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    }
  }

  // Track Time to Interactive
  trackTTI() {
    if ('PerformanceLongTaskTiming' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          console.log('Long Task:', entry);
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    }
  }

  // Memory usage tracking
  trackMemory() {
    if (performance.memory) {
      setInterval(() => {
        this.metrics.memory = {
          usedJSHeapSize:
            (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          totalJSHeapSize:
            (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
          limit:
            (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
        };
      }, 10000);
    }
  }

  // Get all metrics
  getMetrics() {
    return this.metrics;
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
    { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.keys(hint).forEach(key => {
      if (key === 'crossorigin') {
        link.setAttribute('crossorigin', '');
      } else {
        link[key] = hint[key];
      }
    });
    document.head.appendChild(link);
  });
};
