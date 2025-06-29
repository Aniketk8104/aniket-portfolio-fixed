import React from "react";
import { motion } from "framer-motion";

const AnimatedBackgroundLite = () => {
  return (
    <>
      <div className="bg-canvas"></div>
      <div className="floating-shapes">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`shape shape-${index + 1}`}
            animate={{
              y: [-30, -60, -30],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              delay: index * 7,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default AnimatedBackgroundLite;
