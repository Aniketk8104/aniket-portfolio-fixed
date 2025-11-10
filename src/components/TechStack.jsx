import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
// import TechOrb from './TechOrb';
import './TechStack.css';

const TechStack = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'orb'
  const [selectedTech, setSelectedTech] = useState(null);
  const [enableTilt, setEnableTilt] = useState(false);
  const [TiltComponent, setTiltComponent] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluateTiltSupport = () => {
      setEnableTilt(pointerQuery.matches && !motionQuery.matches);
    };

    evaluateTiltSupport();

    const cleanupHandlers = [];

    if (typeof pointerQuery.addEventListener === 'function') {
      pointerQuery.addEventListener('change', evaluateTiltSupport);
      cleanupHandlers.push(() => pointerQuery.removeEventListener('change', evaluateTiltSupport));
    } else if (typeof pointerQuery.addListener === 'function') {
      pointerQuery.addListener(evaluateTiltSupport);
      cleanupHandlers.push(() => pointerQuery.removeListener(evaluateTiltSupport));
    }

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', evaluateTiltSupport);
      cleanupHandlers.push(() => motionQuery.removeEventListener('change', evaluateTiltSupport));
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(evaluateTiltSupport);
      cleanupHandlers.push(() => motionQuery.removeListener(evaluateTiltSupport));
    }

    return () => {
      cleanupHandlers.forEach(cleanup => cleanup());
    };
  }, []);

  useEffect(() => {
    if (!enableTilt || TiltComponent) {
      return undefined;
    }

    let isCancelled = false;

    import('react-parallax-tilt')
      .then(module => {
        if (!isCancelled) {
          setTiltComponent(() => module.default);
        }
      })
      .catch(() => {
        setTiltComponent(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [enableTilt, TiltComponent]);

  const technologies = [
    {
      name: 'React.js',
      icon: '⚛️',
      level: 'Expert',
      color: '#61DAFB',
      proficiency: 95,
      experience: '3+ years',
      description:
        'Building dynamic, responsive web applications with modern React patterns including hooks, context, and performance optimization.',
    },
    {
      name: 'Node.js',
      icon: '🟢',
      level: 'Expert',
      color: '#339933',
      proficiency: 90,
      experience: '3+ years',
      description:
        'Server-side JavaScript development with Express.js, API design, and microservices architecture.',
    },
    {
      name: 'MongoDB',
      icon: '🍃',
      level: 'Advanced',
      color: '#47A248',
      proficiency: 85,
      experience: '2+ years',
      description:
        'NoSQL database design, aggregation pipelines, and performance optimization for scalable applications.',
    },
    {
      name: 'Express.js',
      icon: '⚡',
      level: 'Advanced',
      color: '#000000',
      proficiency: 88,
      experience: '3+ years',
      description:
        'RESTful API development, middleware implementation, and secure backend architecture.',
    },
    {
      name: 'AWS',
      icon: '☁️',
      level: 'Intermediate',
      color: '#FF9900',
      proficiency: 75,
      experience: '2+ years',
      description:
        'Cloud infrastructure, EC2, S3, Lambda functions, and serverless architecture deployment.',
    },
    // {
    //   name: 'Docker',
    //   icon: '🐳',
    //   level: 'Intermediate',
    //   color: '#2496ED',
    //   proficiency: 70,
    //   experience: '1+ years',
    //   description:
    //     'Containerization, orchestration, and deployment pipeline optimization for scalable applications.',
    // },
    // {
    //   name: 'Next.js',
    //   icon: '📱',
    //   level: 'Advanced',
    //   color: '#000000',
    //   proficiency: 82,
    //   experience: '2+ years',
    //   description:
    //     'Full-stack React framework with SSR, SSG, API routes, and performance optimization.',
    // },
    // {
    //   name: 'TypeScript',
    //   icon: '�',
    //   level: 'Advanced',
    //   color: '#3178C6',
    //   proficiency: 80,
    //   experience: '2+ years',
    //   description:
    //     'Type-safe JavaScript development with advanced type systems and enterprise-level code quality.',
    // },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="tech" className="tech-stack" ref={ref}>
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Technical Mastery</h2>
          <p className="section-subtitle">
            Advanced expertise in modern web technologies that power enterprise
            applications
          </p>

        </motion.div>

        {/* Tech Stack Display */}
        {viewMode === 'orb' ? (
          <motion.div
            className="tech-orb-section"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* <TechOrb
              techStack={technologies}
              isActive={inView}
              onTechSelect={setSelectedTech}
            /> */}
          </motion.div>
        ) : (
          <motion.div
            className="tech-grid"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {technologies.map((tech, index) => {
              const CardWrapper = enableTilt && TiltComponent ? TiltComponent : 'div';
              const tiltWrapperProps =
                enableTilt && TiltComponent
                  ? {
                      tiltMaxAngleX: 15,
                      tiltMaxAngleY: 15,
                      perspective: 1000,
                      scale: 1.05,
                      transitionSpeed: 1000,
                      gyroscope: true,
                    }
                  : {};

              return (
                <motion.div key={tech.name} variants={itemVariants}>
                  <CardWrapper className="tech-card-wrapper" {...tiltWrapperProps}>
                    <motion.div
                      className="tech-card"
                      whileHover={{
                        borderColor: tech.color,
                        boxShadow: `0 20px 40px ${tech.color}40`,
                      }}
                      style={{ '--tech-color': tech.color }}
                    >
                      <motion.div
                        className="tech-icon"
                        animate={{
                          rotate: [0, 10, -10, 10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      >
                        {tech.icon}
                      </motion.div>
                      <h3 className="tech-name">{tech.name}</h3>
                      <p className="tech-level">{tech.level}</p>

                      {/* Progress Bar */}
                      <div className="tech-progress">
                        <motion.div
                          className="tech-progress-bar"
                          initial={{ width: 0 }}
                          animate={
                            inView
                              ? {
                                  width:
                                    tech.level === 'Expert'
                                      ? '95%'
                                      : tech.level === 'Advanced'
                                      ? '80%'
                                      : '65%',
                                }
                              : {}
                          }
                          transition={{ duration: 1, delay: index * 0.1 }}
                          style={{ background: tech.color }}
                        />
                      </div>
                    </motion.div>
                  </CardWrapper>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TechStack;
