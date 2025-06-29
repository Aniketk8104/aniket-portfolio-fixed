import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <motion.div
    className="loading-screen"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="loading-content">
      <motion.div
        className="loading-logo"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        AK
      </motion.div>
      <motion.div className="loading-bar">
        <motion.div
          className="loading-progress"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </motion.div>
    </div>
  </motion.div>
);

export default LoadingScreen;
