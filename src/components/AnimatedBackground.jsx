import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Brand palette
const POINT_COLOR = '#a78bfa';
const LINE_COLOR = '#818cf8';

// Field tuning
const POINT_COUNT = 130; // <= 150
const MAX_SEGMENTS = 280; // <= 300
const LINK_DISTANCE = 95; // threshold for connecting two points
const SPREAD_X = 520;
const SPREAD_Y = 320;
const SPREAD_Z = 160; // flat-ish volume (shallow depth)

// Deterministic mulberry32 PRNG so positions are stable across renders
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Connected constellation / network field
function ConstellationField() {
  const groupRef = useRef();
  const driftRef = useRef(0); // accumulated slow rotation
  const parallaxRef = useRef({ x: 0, y: 0 }); // smoothed pointer offset

  // Compute point positions + line segment geometry once (deterministic).
  const { positions, linePositions } = useMemo(() => {
    const rng = makeRng(1337);
    const pts = new Float32Array(POINT_COUNT * 3);

    for (let i = 0; i < POINT_COUNT; i++) {
      pts[i * 3] = (rng() - 0.5) * 2 * SPREAD_X;
      pts[i * 3 + 1] = (rng() - 0.5) * 2 * SPREAD_Y;
      pts[i * 3 + 2] = (rng() - 0.5) * 2 * SPREAD_Z;
    }

    // Build line segments between nearby points, capped at MAX_SEGMENTS.
    const segs = [];
    const threshSq = LINK_DISTANCE * LINK_DISTANCE;
    for (let i = 0; i < POINT_COUNT && segs.length < MAX_SEGMENTS; i++) {
      const ax = pts[i * 3];
      const ay = pts[i * 3 + 1];
      const az = pts[i * 3 + 2];
      for (let j = i + 1; j < POINT_COUNT; j++) {
        const dx = ax - pts[j * 3];
        const dy = ay - pts[j * 3 + 1];
        const dz = az - pts[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz <= threshSq) {
          segs.push(ax, ay, az, pts[j * 3], pts[j * 3 + 1], pts[j * 3 + 2]);
          if (segs.length >= MAX_SEGMENTS * 6) break;
        }
      }
    }

    return { positions: pts, linePositions: new Float32Array(segs) };
  }, []);

  // Reused line geometry built once from computed positions.
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return geo;
  }, [linePositions]);

  // Gentle continuous drift + subtle mouse parallax. No allocations in loop.
  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    // Slow continuous rotation about Y, plus a tiny X drift.
    driftRef.current += delta * 0.02;

    // Smoothly lerp parallax offset toward the normalized pointer.
    const p = parallaxRef.current;
    p.x = THREE.MathUtils.lerp(p.x, state.pointer.y * 0.08, 0.03);
    p.y = THREE.MathUtils.lerp(p.y, state.pointer.x * 0.12, 0.03);

    g.rotation.x = Math.sin(driftRef.current * 0.4) * 0.05 + p.x;
    g.rotation.y = driftRef.current + p.y;
  });

  return (
    <group ref={groupRef}>
      {/* Faint connecting lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color={LINE_COLOR}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </lineSegments>

      {/* Constellation points */}
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={POINT_COLOR}
          size={2.2}
          sizeAttenuation
          depthWrite={false}
          opacity={0.5}
        />
      </Points>
    </group>
  );
}

const AnimatedBackground = () => {
  return (
    <>
      {/* Premium aurora mesh + engineering grid (CSS, behind WebGL) */}
      <div className="premium-aurora" aria-hidden="true" />
      <div className="premium-grid" aria-hidden="true" />

      {/* WebGL 3D constellation field */}
      <div className="webgl-background">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 500], fov: 60 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -2,
          }}
        >
          <ambientLight intensity={0.5} />
          <ConstellationField />
        </Canvas>
      </div>
    </>
  );
};

export default AnimatedBackground;
