import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Particle System Component
function ParticleField() {
  const ref = useRef();
  const [sphere] = useMemo(() => {
    const points = [];
    for (let i = 0; i < 2000; i++) {
      const r = 800 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      points.push(x, y, z);
    }
    return [new Float32Array(points)];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#667eea"
          size={2}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// Floating Shapes Component
const FloatingShapes = () => {
  const shapes = [
    { top: '10%', left: '10%', delay: -2 },
    { top: '70%', right: '10%', delay: -8 },
    { top: '40%', left: '80%', delay: -15 },
  ];

  return (
    <div className="floating-shapes">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`shape shape-${index + 1}`}
          style={shape}
          animate={{
            y: [-30, -60, -30],
            rotate: [0, 360],
            scale: [1, 1.1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};

const AnimatedBackground = () => {
  return (
    <>
      {/* WebGL 3D Background */}
      <div className="webgl-background">
        <Canvas
          camera={{ position: [0, 0, 500], fov: 60 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -3,
          }}
        >
          <ambientLight intensity={0.5} />
          <ParticleField />
        </Canvas>
      </div>

      {/* Gradient Overlays */}
      <div className="bg-canvas"></div>

      {/* Floating Shapes */}
      <FloatingShapes />
    </>
  );
};

export default AnimatedBackground;
