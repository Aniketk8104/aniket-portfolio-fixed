import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Lazy load components with preload capability
const AnimatedBackground = lazyWithPreload(() =>
  import('./components/AnimatedBackground')
);
const AnimatedBackgroundLite = lazyWithPreload(() =>
  import('./components/AnimatedBackgroundLite')
);
const HeroSection = lazyWithPreload(() => import('./components/HeroSection'));
const TechStack = lazyWithPreload(() => import('./components/TechStack'));
const AboutSection = lazyWithPreload(() => import('./components/AboutSection'));
const ServicesSection = lazyWithPreload(() =>
  import('./components/ServicesSection')
);
const Portfolio = lazyWithPreload(() => import('./components/Portfolio'));
const InsightsSection = lazyWithPreload(() =>
  import('./components/InsightsSection')
);
const Testimonials = lazyWithPreload(() => import('./components/Testimonials'));
const ContactSection = lazyWithPreload(() =>
  import('./components/ContactSection')
);
const Footer = lazyWithPreload(() => import('./components/Footer'));

// Custom Cursor Component with enhanced animation system
const CustomCursor = React.memo(() => {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const outlineRef = useRef(null);
  const trailRefs = useRef([]);
  const particleRefs = useRef([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const hasFinePointer =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: fine)').matches
        : true;
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (hasFinePointer && !isTouchDevice) {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.classList.add('custom-cursor-active');
    return () => {
      root.classList.remove('custom-cursor-active');
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const container = containerRef.current;
    const cursor = cursorRef.current;
    const outline = outlineRef.current;
    const trails = trailRefs.current;
    const particles = particleRefs.current;

    if (!container || !cursor || !outline) {
      return;
    }

    const removeVariants = element => {
      element.classList.remove(
        'ultra-cursor-pointer',
        'ultra-cursor-text',
        'ultra-cursor-view'
      );
    };

    const applyVariant = variant => {
      removeVariants(cursor);
      removeVariants(outline);

      if (variant === 'pointer') {
        cursor.classList.add('ultra-cursor-pointer');
        outline.classList.add('ultra-cursor-pointer');
      } else if (variant === 'text') {
        cursor.classList.add('ultra-cursor-text');
        outline.classList.add('ultra-cursor-text');
      } else if (variant === 'view') {
        cursor.classList.add('ultra-cursor-view');
        outline.classList.add('ultra-cursor-view');
      }
    };

    let lastX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    let lastY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

    const updatePosition = (x, y) => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      outline.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      trails.forEach((trail, index) => {
        if (!trail) return;
        trail.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        trail.style.transitionDuration = `${0.2 + index * 0.04}s`;
        trail.style.opacity = `${Math.max(0.15, 0.5 - index * 0.05)}`;
      });

      if (particles.length) {
        particles.forEach((particle, index) => {
          if (!particle) return;
          const angle = (index / particles.length) * Math.PI * 2;
          const radius = 12 + index * 2;
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          particle.style.transform = `translate3d(${px}px, ${py}px, 0)`;
          particle.style.transitionDuration = '0.35s';
          particle.style.opacity = '0.45';
        });
      }
    };

    const handleMouseMove = event => {
      lastX = event.clientX;
      lastY = event.clientY;
      updatePosition(lastX, lastY);
    };

    const showCursor = () => {
      container.classList.remove('is-hidden');
      updatePosition(lastX, lastY);
    };

    const hideCursor = () => {
      container.classList.add('is-hidden');
      applyVariant('default');
    };

    const resolveVariant = target => {
      if (!target) return 'default';

      const override = target.closest('[data-cursor]');
      if (override) {
        return override.getAttribute('data-cursor') || 'pointer';
      }

      const textTarget = target.closest(
        '[contenteditable="true"], [contenteditable=""], textarea, input[type="text"], input[type="search"], input[type="email"], input[type="password"], .text-input'
      );
      if (textTarget) {
        return 'text';
      }

      const pointerTarget = target.closest(
        'a, button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], select, label'
      );
      if (pointerTarget) {
        return 'pointer';
      }

      return 'default';
    };

    const handleIntent = event => {
      const target =
        event.target && event.target instanceof Element ? event.target : null;
      const variant = resolveVariant(target);
      applyVariant(variant);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hideCursor();
      }
    };

    updatePosition(lastX, lastY);
    showCursor();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', showCursor);
    document.addEventListener('mouseleave', hideCursor);
    document.addEventListener('mouseover', handleIntent, true);
    document.addEventListener('focusin', handleIntent, true);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', showCursor);
      document.removeEventListener('mouseleave', hideCursor);
      document.removeEventListener('mouseover', handleIntent, true);
      document.removeEventListener('focusin', handleIntent, true);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const trailCount = 6;
  const particleCount = 6;

  return (
    <div ref={containerRef} className="ultra-cursor-container is-hidden">
      <div ref={cursorRef} className="ultra-cursor" />
      <div ref={outlineRef} className="ultra-cursor-outline" />
      {Array.from({ length: trailCount }).map((_, index) => (
        <span
          key={`cursor-trail-${index}`}
          className="cursor-trail"
          ref={element => {
            trailRefs.current[index] = element;
          }}
        />
      ))}
      {Array.from({ length: particleCount }).map((_, index) => (
        <span
          key={`cursor-particle-${index}`}
          className="cursor-particle"
          ref={element => {
            particleRefs.current[index] = element;
          }}
        />
      ))}
    </div>
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
  const [backgroundVariant, setBackgroundVariant] = useState('lite');
  const [shouldRenderBackground, setShouldRenderBackground] = useState(false);
  const [targetBackground, setTargetBackground] = useState('lite');
  const performanceTracker = useRef(null);
  const preloadObserver = useRef(null);
  const backgroundVariantRef = useRef('lite');
  const targetBackgroundRef = useRef('lite');
  const backgroundUpgradeIdleRef = useRef(null);
  const backgroundUpgradeTimeoutRef = useRef(null);
  const backgroundUpgradeWaitRef = useRef(null);
  const backgroundIdleRef = useRef(null);
  const deferredInitIdleRef = useRef(null);
  const upgradeInteractionCleanupRef = useRef(null);
  const hasUserInteractionRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') {
      backgroundVariantRef.current = 'lite';
      targetBackgroundRef.current = 'lite';
      setBackgroundVariant('lite');
      setTargetBackground('lite');
      return;
    }

    if (typeof window.matchMedia !== 'function') {
      backgroundVariantRef.current = 'lite';
      targetBackgroundRef.current = 'lite';
      setBackgroundVariant('lite');
      setTargetBackground('lite');
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const cancelBackgroundUpgrade = () => {
      if (
        backgroundUpgradeIdleRef.current &&
        'cancelIdleCallback' in window &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(backgroundUpgradeIdleRef.current);
      }
      if (backgroundUpgradeTimeoutRef.current) {
        window.clearTimeout(backgroundUpgradeTimeoutRef.current);
        backgroundUpgradeTimeoutRef.current = null;
      }
      if (backgroundUpgradeWaitRef.current) {
        window.clearTimeout(backgroundUpgradeWaitRef.current);
        backgroundUpgradeWaitRef.current = null;
      }
      if (upgradeInteractionCleanupRef.current) {
        upgradeInteractionCleanupRef.current();
        upgradeInteractionCleanupRef.current = null;
      }
      backgroundUpgradeIdleRef.current = null;
      backgroundUpgradeTimeoutRef.current = null;
    };

    const commitBackgroundUpgrade = () => {
      if (targetBackgroundRef.current !== 'full') {
        cancelBackgroundUpgrade();
        return;
      }
      backgroundUpgradeIdleRef.current = null;
      backgroundUpgradeTimeoutRef.current = null;
      if (backgroundUpgradeWaitRef.current) {
        window.clearTimeout(backgroundUpgradeWaitRef.current);
        backgroundUpgradeWaitRef.current = null;
      }
      if (upgradeInteractionCleanupRef.current) {
        upgradeInteractionCleanupRef.current();
        upgradeInteractionCleanupRef.current = null;
      }
      hasUserInteractionRef.current = true;
      AnimatedBackground.preload?.();
      backgroundVariantRef.current = 'full';
      setBackgroundVariant('full');
    };

    const scheduleBackgroundUpgrade = () => {
      if (targetBackgroundRef.current !== 'full') {
        return;
      }

      if (
        backgroundUpgradeIdleRef.current ||
        backgroundUpgradeTimeoutRef.current ||
        backgroundUpgradeWaitRef.current
      ) {
        return;
      }

      if (!hasUserInteractionRef.current) {
        const handleUserInteraction = () => {
          hasUserInteractionRef.current = true;
          if (upgradeInteractionCleanupRef.current) {
            upgradeInteractionCleanupRef.current();
            upgradeInteractionCleanupRef.current = null;
          }
          if (backgroundUpgradeWaitRef.current) {
            window.clearTimeout(backgroundUpgradeWaitRef.current);
            backgroundUpgradeWaitRef.current = null;
          }
          scheduleBackgroundUpgrade();
        };

        const interactionEvents = [
          'pointerdown',
          'pointermove',
          'touchstart',
          'keydown',
          'scroll',
        ];

        interactionEvents.forEach(event => {
          window.addEventListener(event, handleUserInteraction, {
            passive: true,
            once: true,
          });
        });

        upgradeInteractionCleanupRef.current = () => {
          interactionEvents.forEach(event => {
            window.removeEventListener(event, handleUserInteraction);
          });
        };

        backgroundUpgradeWaitRef.current = window.setTimeout(() => {
          backgroundUpgradeWaitRef.current = null;
          hasUserInteractionRef.current = true;
          if (upgradeInteractionCleanupRef.current) {
            upgradeInteractionCleanupRef.current();
            upgradeInteractionCleanupRef.current = null;
          }
          scheduleBackgroundUpgrade();
        }, 45000);

        return;
      }

      if (loading) {
        backgroundUpgradeTimeoutRef.current = window.setTimeout(() => {
          backgroundUpgradeTimeoutRef.current = null;
          scheduleBackgroundUpgrade();
        }, 1200);
        return;
      }

      if ('requestIdleCallback' in window) {
        backgroundUpgradeIdleRef.current = window.requestIdleCallback(
          () => {
            commitBackgroundUpgrade();
          },
          { timeout: 4000 }
        );
      } else {
        backgroundUpgradeTimeoutRef.current = window.setTimeout(
          commitBackgroundUpgrade,
          1800
        );
      }
    };

    const evaluateVariant = () => {
      const prefersReducedMotion = motionQuery.matches;
      const saveDataEnabled = Boolean(connection?.saveData);
      const slowConnection =
        typeof connection?.effectiveType === 'string' &&
        (connection.effectiveType.includes('2g') ||
          connection.effectiveType === 'slow-2g');
      const isMobileViewport = window.innerWidth <= 1024;

      const nextVariant =
        prefersReducedMotion || saveDataEnabled || slowConnection || isMobileViewport
          ? 'lite'
          : 'full';

  setTargetBackground(nextVariant);
  targetBackgroundRef.current = nextVariant;

      if (nextVariant === 'lite') {
        AnimatedBackgroundLite.preload?.();
        cancelBackgroundUpgrade();
        if (backgroundVariantRef.current !== 'lite') {
          backgroundVariantRef.current = 'lite';
          setBackgroundVariant('lite');
        }
        return;
      }

      // Default to lite background first, upgrade once idle
      AnimatedBackgroundLite.preload?.();
      if (backgroundVariantRef.current !== 'lite') {
        backgroundVariantRef.current = 'lite';
        setBackgroundVariant('lite');
      }

      scheduleBackgroundUpgrade();
    };

    evaluateVariant();

    const cleanupFns = [];

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', evaluateVariant);
      cleanupFns.push(() =>
        motionQuery.removeEventListener('change', evaluateVariant)
      );
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(evaluateVariant);
      cleanupFns.push(() => motionQuery.removeListener(evaluateVariant));
    }

    const handleResize = () => evaluateVariant();
    window.addEventListener('resize', handleResize);
    cleanupFns.push(() => window.removeEventListener('resize', handleResize));

    if (connection?.addEventListener) {
      connection.addEventListener('change', evaluateVariant);
      cleanupFns.push(() =>
        connection.removeEventListener('change', evaluateVariant)
      );
    }

    return () => {
      cancelBackgroundUpgrade();
      cleanupFns.forEach(cleanup => cleanup());
    };
  }, [loading]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const scheduleBackground = () => setShouldRenderBackground(true);

    if ('requestIdleCallback' in window) {
      backgroundIdleRef.current = window.requestIdleCallback(
        scheduleBackground,
        {
          timeout: 1500,
        }
      );
    } else {
      backgroundIdleRef.current = window.setTimeout(scheduleBackground, 300);
    }

    return () => {
      if (!backgroundIdleRef.current) {
        return;
      }

      if (
        'cancelIdleCallback' in window &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(backgroundIdleRef.current);
      } else {
        window.clearTimeout(backgroundIdleRef.current);
      }
    };
  }, []);


  // Memoize component list for preloading
  const componentMap = useMemo(
    () => ({
      TechStack,
      AboutSection,
      ServicesSection,
      Portfolio,
      Testimonials,
      InsightsSection,
      ContactSection,
      Footer,
    }),
    []
  );

  // Enhanced initialization with error boundaries
  useEffect(() => {
    if (typeof window === 'undefined') {
      setAppReady(true);
      setLoading(false);
      return () => {};
    }

    extractCriticalCSS();
    addResourceHints();
    setAppReady(true);

    let timerId = window.setTimeout(() => {
      setLoading(false);
    }, 600);

    const runDeferredInitialization = () => {
      try {
        performanceTracker.current = new PerformanceTracker();
        performanceTracker.current.trackPageLoad();
        performanceTracker.current.trackLCP();
        performanceTracker.current.trackCLS();
        performanceTracker.current.trackFID();
        performanceTracker.current.trackMemory();

        reportWebVitals(metric => {
          if (!import.meta.env.PROD) {
            console.log(metric);
          }
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

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker
            .register('/sw.js')
            .then(registration => {
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                  if (
                    newWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    if (!import.meta.env.PROD) {
                      console.log('New app version available');
                    }
                  }
                });
              });
            })
            .catch(error => {
              if (!import.meta.env.PROD) {
                console.log('Service Worker registration failed:', error);
              }
            });
        }

        preloadObserver.current = setupPreloadObserver(componentMap);
      } catch (error) {
        if (!import.meta.env.PROD) {
          console.error('App deferred initialization failed:', error);
        }
      }
    };

    if ('requestIdleCallback' in window) {
      deferredInitIdleRef.current = window.requestIdleCallback(
        runDeferredInitialization,
        { timeout: 2000 }
      );
    } else {
      deferredInitIdleRef.current = window.setTimeout(
        runDeferredInitialization,
        250
      );
    }

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }

      if (
        deferredInitIdleRef.current &&
        'cancelIdleCallback' in window &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(deferredInitIdleRef.current);
      } else if (deferredInitIdleRef.current) {
        window.clearTimeout(deferredInitIdleRef.current);
      }

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
    <>
      <SEO />
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      <AnimatePresence>
        {!loading && (
          <motion.div
            className="app-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Custom Cursor self-disables on touch devices */}
            <CustomCursor />

            {/* Scroll Progress Bar */}
            <ScrollProgress />

            {/* Navigation - Critical path */}
            <Navbar />

            {/* Animated Background - Non-blocking */}
            {shouldRenderBackground && (
              <Suspense fallback={null}>
                {backgroundVariant === 'full' && <AnimatedBackground />}
                {backgroundVariant === 'lite' && <AnimatedBackgroundLite />}
              </Suspense>
            )}

            {/* Main Content with error boundaries */}
            <main id="main-content" tabIndex={-1}>
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

              <div data-preload="ServicesSection">
                <Suspense fallback={<ComponentLoader />}>
                  <ServicesSection />
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

              <div data-preload="InsightsSection">
                <Suspense fallback={<ComponentLoader />}>
                  <InsightsSection />
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
    </>
  );
}

export default App;
