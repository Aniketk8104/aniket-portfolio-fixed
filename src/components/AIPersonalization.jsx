import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIPersonalization.css';

// 🤖 AI-POWERED PERSONALIZATION ENGINE
const AIPersonalization = () => {
  const [userProfile, setUserProfile] = useState({
    visitCount: 0,
    timeSpent: 0,
    interests: [],
    deviceType: 'desktop',
    timeOfDay: 'day',
    location: 'unknown',
    returnVisitor: false,
    lastVisit: null,
    engagementScore: 0,
    preferredContent: 'technical',
    scrollBehavior: 'normal',
  });

  const [aiInsights, setAiInsights] = useState({
    recommendedProjects: [],
    personalizedCTA: '',
    adaptiveLayout: 'standard',
    contentFocus: 'general',
    interactionStyle: 'professional',
  });

  const [isLearning, setIsLearning] = useState(true);
  const startTime = useRef(Date.now());
  const interactionCount = useRef(0);
  const scrollData = useRef([]);

  // 🧠 BEHAVIORAL ANALYSIS ENGINE
  useEffect(() => {
    const analyzeUserBehavior = () => {
      // Detect device type
      const deviceType =
        window.innerWidth <= 768
          ? 'mobile'
          : window.innerWidth <= 1024
          ? 'tablet'
          : 'desktop';

      // Detect time of day
      const hour = new Date().getHours();
      const timeOfDay =
        hour >= 6 && hour < 12
          ? 'morning'
          : hour >= 12 && hour < 18
          ? 'afternoon'
          : hour >= 18 && hour < 22
          ? 'evening'
          : 'night';

      // Check if return visitor
      const lastVisit = localStorage.getItem('aniketdev_last_visit');
      const visitCount =
        parseInt(localStorage.getItem('aniketdev_visit_count') || '0') + 1;
      const returnVisitor =
        lastVisit && Date.now() - parseInt(lastVisit) < 7 * 24 * 60 * 60 * 1000;

      // Detect location (simplified - in production would use IP geolocation)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const location = timezone.split('/')[1] || 'unknown';

      setUserProfile(prev => ({
        ...prev,
        deviceType,
        timeOfDay,
        visitCount,
        returnVisitor,
        lastVisit,
        location,
      }));

      // Store visit data
      localStorage.setItem('aniketdev_visit_count', visitCount.toString());
      localStorage.setItem('aniketdev_last_visit', Date.now().toString());
    };

    analyzeUserBehavior();
  }, []);

  // 📊 REAL-TIME INTERACTION TRACKING
  useEffect(() => {
    const trackInteractions = () => {
      // Mouse movement tracking
      const handleMouseMove = e => {
        interactionCount.current++;

        // Analyze mouse movement patterns
        const speed = Math.sqrt(e.movementX ** 2 + e.movementY ** 2);
        if (speed > 50) {
          setUserProfile(prev => ({
            ...prev,
            scrollBehavior: 'fast',
            engagementScore: Math.min(prev.engagementScore + 0.1, 100),
          }));
        }
      };

      // Scroll behavior analysis
      const handleScroll = () => {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollPercent = scrollY / (docHeight - windowHeight);

        scrollData.current.push({
          time: Date.now(),
          position: scrollPercent,
          direction:
            scrollData.current.length > 0
              ? scrollPercent >
                scrollData.current[scrollData.current.length - 1].position
                ? 'down'
                : 'up'
              : 'down',
        });

        // Keep only last 50 scroll events for performance
        if (scrollData.current.length > 50) {
          scrollData.current = scrollData.current.slice(-50);
        }
      };

      // Click tracking for interest analysis
      const handleClick = e => {
        const target = e.target;
        const interests = [];

        if (target.closest('.tech-card')) interests.push('technology');
        if (target.closest('.project-card')) interests.push('projects');
        if (target.closest('.contact')) interests.push('hiring');
        if (target.closest('.about')) interests.push('background');

        if (interests.length > 0) {
          setUserProfile(prev => ({
            ...prev,
            interests: [...new Set([...prev.interests, ...interests])],
            engagementScore: Math.min(prev.engagementScore + 5, 100),
          }));
        }
      };

      // Time spent tracking
      const timeInterval = setInterval(() => {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        setUserProfile(prev => ({
          ...prev,
          timeSpent,
          engagementScore: Math.min(prev.engagementScore + 0.5, 100),
        }));
      }, 5000);

      // Event listeners
      document.addEventListener('mousemove', handleMouseMove, {
        passive: true,
      });
      document.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('click', handleClick);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('scroll', handleScroll);
        document.removeEventListener('click', handleClick);
        clearInterval(timeInterval);
      };
    };

    const cleanup = trackInteractions();
    return cleanup;
  }, []);

  // 🎯 AI RECOMMENDATION ENGINE
  useEffect(() => {
    const generateAIInsights = () => {
      const {
        interests,
        timeOfDay,
        deviceType,
        engagementScore,
        returnVisitor,
      } = userProfile;

      // Project recommendations based on interests
      let recommendedProjects = [
        'MERN Stack E-commerce',
        'React Dashboard',
        'Node.js API',
      ];

      if (interests.includes('technology')) {
        recommendedProjects = [
          'Advanced React Components',
          'WebGL Visualization',
          'AI Integration',
        ];
      }
      if (interests.includes('projects')) {
        recommendedProjects = [
          'Portfolio Showcase',
          'Full-Stack Applications',
          'Open Source',
        ];
      }

      // Personalized CTA based on behavior
      let personalizedCTA = "Let's Build Something Amazing";

      if (returnVisitor) {
        personalizedCTA = 'Welcome Back! Ready for Your Next Project?';
      } else if (engagementScore > 50) {
        personalizedCTA = "I Can See You're Interested - Let's Talk!";
      } else if (timeOfDay === 'morning') {
        personalizedCTA = 'Start Your Day with a Great Project!';
      } else if (timeOfDay === 'evening') {
        personalizedCTA = 'End Your Day by Planning Something Great!';
      }

      // Layout adaptation
      let adaptiveLayout = 'standard';
      if (deviceType === 'mobile') adaptiveLayout = 'mobile-optimized';
      if (engagementScore > 70) adaptiveLayout = 'detail-rich';
      if (interests.includes('technology')) adaptiveLayout = 'tech-focused';

      // Content focus
      let contentFocus = 'general';
      if (interests.includes('technology')) contentFocus = 'technical';
      if (interests.includes('projects')) contentFocus = 'portfolio';
      if (interests.includes('hiring')) contentFocus = 'professional';

      // Interaction style
      let interactionStyle = 'professional';
      if (timeOfDay === 'evening' || timeOfDay === 'night')
        interactionStyle = 'relaxed';
      if (engagementScore > 80) interactionStyle = 'enthusiastic';

      setAiInsights({
        recommendedProjects,
        personalizedCTA,
        adaptiveLayout,
        contentFocus,
        interactionStyle,
      });

      setIsLearning(false);
    };

    // Generate insights after user has been analyzed
    const timer = setTimeout(generateAIInsights, 3000);
    return () => clearTimeout(timer);
  }, [userProfile]);

  // 💡 ADAPTIVE UI COMPONENT
  const AdaptiveInsights = () => {
    if (isLearning || userProfile.engagementScore < 20) return null;

    return (
      <motion.div
        className="ai-insights-panel"
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="insights-header">
          <span className="ai-icon">🤖</span>
          <span>AI Personalization Active</span>
        </div>

        <div className="insights-content">
          <div className="user-profile">
            <h4>Your Profile</h4>
            <div className="profile-stats">
              <span>
                Engagement: {Math.round(userProfile.engagementScore)}%
              </span>
              <span>Visit #{userProfile.visitCount}</span>
              <span>{userProfile.timeOfDay} visitor</span>
            </div>
          </div>

          {aiInsights.recommendedProjects.length > 0 && (
            <div className="recommendations">
              <h4>Recommended for You</h4>
              <ul>
                {aiInsights.recommendedProjects
                  .slice(0, 2)
                  .map((project, index) => (
                    <li key={index}>{project}</li>
                  ))}
              </ul>
            </div>
          )}

          <div className="adaptive-cta">
            <button
              className="ai-cta-button"
              onClick={() => {
                document
                  .getElementById('contact')
                  ?.scrollIntoView({ behavior: 'smooth' });
                setUserProfile(prev => ({
                  ...prev,
                  engagementScore: Math.min(prev.engagementScore + 10, 100),
                }));
              }}
            >
              {aiInsights.personalizedCTA}
            </button>
          </div>
        </div>

        <motion.button
          className="close-insights"
          onClick={() => setIsLearning(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close personalization insights"
        >
          ×
        </motion.button>
      </motion.div>
    );
  };

  // 📈 ANALYTICS EXPORT (for development/debugging)
  window.aniketDevAI = {
    userProfile,
    aiInsights,
    getAnalytics: () => ({
      totalInteractions: interactionCount.current,
      scrollHistory: scrollData.current,
      timeSpent: userProfile.timeSpent,
      engagementScore: userProfile.engagementScore,
    }),
  };

  return (
    <AnimatePresence>
      <AdaptiveInsights />
    </AnimatePresence>
  );
};

export default AIPersonalization;
