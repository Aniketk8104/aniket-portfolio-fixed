import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import './assets/styles/global.css';

// Performance utilities
import {
  PerformanceTracker,
  reportWebVitals,
  addResourceHints,
} from './utils/performance';
import { extractCriticalCSS } from './utils/criticalCSS';
import { lazyWithPreload, setupPreloadObserver } from './utils/lazyWithPreload';
import SEO from './utils/SEO';

// Immediate components
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import FontLoader from './components/FontLoader';

// Lazy load components with preload capability
const AnimatedBackground = lazyWithPreload(() =>
  import('./components/AnimatedBackground')
);
const HeroSection = lazyWithPreload(() => import('./components/HeroSection'));
const TechStack = lazyWithPreload(() => import('./components/TechStack'));
const AboutSection = lazyWithPreload(() => import('./components/AboutSection'));
const Portfolio = lazyWithPreload(() => import('./components/Portfolio'));
const Testimonials = lazyWithPreload(() => import('./components/Testimonials'));
const ContactSection = lazyWithPreload(() =>
  import('./components/ContactSection')
);
const Footer = lazyWithPreload(() => import('./components/Footer'));

// Custom Cursor Component with performance optimization (from working version)
const CustomCursor = React.memo(() => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);
  const requestRef = useRef();

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const updatePosition = () => {
      setPosition({ x: lastX, y: lastY });
    };

    const onMouseMove = e => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(() => {
          updatePosition();
          requestRef.current = null;
        });
      }
    };

    const onMouseEnter = () => setHidden(false);
    const onMouseLeave = () => setHidden(true);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  if (hidden) return null;

  return (
    <>
      <div
        className="cursor-dot"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      />
      <div
        className="cursor-dot-outline"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      />
    </>
  );
});

// Optimized scroll progress component
const ScrollProgress = React.memo(() => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setScrollProgress(Math.min(100, Math.max(0, progress)));
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollProgress);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="scroll-progress"
      style={{
        transform: `scaleX(${scrollProgress / 100})`,
        transformOrigin: 'left',
        willChange: 'transform',
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: scrollProgress / 100 }}
      transition={{ duration: 0.1 }}
    />
  );
});

// Enhanced component loader with skeleton
const ComponentLoader = React.memo(({ height = '400px' }) => (
  <div
    className="component-loader"
    style={{
      minHeight: height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background:
        'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}
  >
    <div className="loading-spinner" />
  </div>
));

// Floating CTA with enhanced interactivity
const FloatingCTA = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollY = window.pageYOffset;
      setIsVisible(scrollY > heroHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href="#contact"
          className="floating-cta"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <path
              d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 6L12 13L2 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          <span>Hire Me</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
});

function App() {
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const performanceTracker = useRef(null);
  const preloadObserver = useRef(null);

  // Memoize component list for preloading
  const componentMap = useMemo(
    () => ({
      TechStack,
      AboutSection,
      Portfolio,
      Testimonials,
      ContactSection,
      Footer,
    }),
    []
  );

  // Enhanced initialization with error boundaries
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Performance optimizations
        extractCriticalCSS();
        addResourceHints();

        // Initialize performance tracking
        performanceTracker.current = new PerformanceTracker();
        performanceTracker.current.trackPageLoad();
        performanceTracker.current.trackLCP();
        performanceTracker.current.trackCLS();
        performanceTracker.current.trackFID();
        performanceTracker.current.trackMemory();

        // Report web vitals with custom analytics
        reportWebVitals(metric => {
          console.log(metric);
          // Send to analytics service
          if (window.gtag) {
            window.gtag('event', metric.name, {
              event_category: 'Web Vitals',
              value: Math.round(
                metric.name === 'CLS' ? metric.value * 1000 : metric.value
              ),
              event_label: metric.id,
              non_interaction: true,
            });
          }
        });

        // Register service worker with update handling
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register(
              '/sw.js'
            );

            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New update available
                  console.log('New app version available');
                }
              });
            });
          } catch (error) {
            console.log('Service Worker registration failed:', error);
          }
        }

        // Setup intelligent preloading
        preloadObserver.current = setupPreloadObserver(componentMap);

        // Preload critical components after hero loads
        setTimeout(() => {
          TechStack.preload();
          AboutSection.preload();
        }, 100);

        setAppReady(true);

        // Faster loading with staggered component initialization
        const timer = setTimeout(() => {
          setLoading(false);
        }, 600);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('App initialization failed:', error);
        setLoading(false);
        setAppReady(true);
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      if (performanceTracker.current) {
        performanceTracker.current.disconnect();
      }
      if (preloadObserver.current) {
        preloadObserver.current.disconnect();
      }
    };
  }, [componentMap]);

  // Error boundary fallback
  const ErrorFallback = useCallback(
    ({ error }) => (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    ),
    []
  );

  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <HelmetProvider>
      <SEO />
      <FontLoader />

      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      <AnimatePresence>
        {!loading && (
          <motion.div
            className="app-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Custom Cursor - Only on desktop */}
            {window.innerWidth > 768 && <CustomCursor />}

            {/* Scroll Progress Bar */}
            <ScrollProgress />

            {/* Navigation - Critical path */}
            <Navbar />

            {/* Animated Background - Non-blocking */}
            <Suspense fallback={null}>
              <AnimatedBackground />
            </Suspense>

            {/* Main Content with error boundaries */}
            <main>
              <Suspense fallback={<ComponentLoader height="100vh" />}>
                <HeroSection />
              </Suspense>

              <div data-preload="TechStack">
                <Suspense fallback={<ComponentLoader />}>
                  <TechStack />
                </Suspense>
              </div>

              <div data-preload="AboutSection">
                <Suspense fallback={<ComponentLoader />}>
                  <AboutSection />
                </Suspense>
              </div>

              <div data-preload="Portfolio">
                <Suspense fallback={<ComponentLoader />}>
                  <Portfolio />
                </Suspense>
              </div>

              <div data-preload="Testimonials">
                <Suspense fallback={<ComponentLoader />}>
                  <Testimonials />
                </Suspense>
              </div>

              <div data-preload="ContactSection">
                <Suspense fallback={<ComponentLoader />}>
                  <ContactSection />
                </Suspense>
              </div>
            </main>

            {/* Footer */}
            <Suspense fallback={<ComponentLoader height="200px" />}>
              <Footer />
            </Suspense>

            {/* Enhanced Floating CTA */}
            <FloatingCTA />
          </motion.div>
        )}
      </AnimatePresence>
    </HelmetProvider>
  );
}

export default App;
