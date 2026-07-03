import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Float, Sparkles, MeshDistortMaterial, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// Brand palette
const COLOR_PRIMARY = '#818cf8'; // indigo (nodes)
const COLOR_SECONDARY = '#a78bfa'; // violet (nodes / edges)
const COLOR_EDGE = '#818cf8'; // indigo (edges)
const COLOR_PACKET_A = '#d946ef'; // fuchsia (data packet)
const COLOR_PACKET_B = '#c7d2fe'; // soft indigo (data packet)
const COLOR_CORE = '#6366f1'; // central distorted core

// Network sizing constraints (kept low for performance)
const NODE_COUNT = 12; // <= 14
const MAX_EDGES = 24; // <= ~24
const PACKET_COUNT = 5; // <= 6
const CLOUD_RADIUS = 2.4;
const EDGE_CONNECT_DISTANCE = 1.85; // threshold for linking nearby nodes

/**
 * Decide once whether the accent should render. We deliberately bail out on
 * reduced-motion, small/touch viewports, and data-saver to keep the hero
 * lightweight and respectful of user preferences.
 */
function shouldRenderAccent() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return false;

  const isSmallViewport = window.matchMedia('(max-width: 1024px)').matches;
  if (isSmallViewport) return false;

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (isCoarsePointer) return false;

  const connection =
    typeof navigator !== 'undefined' ? navigator.connection : undefined;
  if (connection && connection.saveData) return false;

  return true;
}

// Deterministic PRNG (mulberry32) — seeded so geometry is identical every run.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build the network once: nodes distributed via a Fibonacci sphere (even,
 * organic spread) with seeded jitter, plus edges between nearby nodes.
 * No Math.random, no per-frame allocation.
 */
function buildNetwork() {
  const rand = mulberry32(1337);
  const golden = Math.PI * (3 - Math.sqrt(5)); // golden angle

  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2; // 1 -> -1
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    // seeded radial jitter so it reads as a cluster, not a perfect shell
    const r = CLOUD_RADIUS * (0.72 + rand() * 0.28);
    const x = Math.cos(theta) * radiusAtY * r;
    const z = Math.sin(theta) * radiusAtY * r;
    nodes.push(new THREE.Vector3(x, y * r, z));
  }

  // Connect nearby nodes; cap edge count. Guarantee no orphan nodes by
  // always linking each node to its nearest neighbor first.
  const edges = [];
  const seen = new Set();
  const addEdge = (a, b) => {
    if (a === b || edges.length >= MAX_EDGES) return;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push([a, b]);
  };

  for (let i = 0; i < NODE_COUNT; i++) {
    let nearest = -1;
    let nearestDist = Infinity;
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      const d = nodes[i].distanceTo(nodes[j]);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = j;
      }
    }
    if (nearest >= 0) addEdge(i, nearest);
  }

  // Then add all remaining short edges up to the cap.
  for (let i = 0; i < NODE_COUNT && edges.length < MAX_EDGES; i++) {
    for (let j = i + 1; j < NODE_COUNT && edges.length < MAX_EDGES; j++) {
      if (nodes[i].distanceTo(nodes[j]) <= EDGE_CONNECT_DISTANCE) {
        addEdge(i, j);
      }
    }
  }

  // Seed packets onto a deterministic subset of edges with staggered phase.
  const packets = [];
  for (let p = 0; p < PACKET_COUNT && edges.length > 0; p++) {
    packets.push({
      edge: (p * 5 + 1) % edges.length,
      t: rand(),
      speed: 0.35 + rand() * 0.45,
      color: p % 2 === 0 ? COLOR_PACKET_A : COLOR_PACKET_B,
    });
  }

  return { nodes, edges, packets };
}

/**
 * GlowCore — the central signature object. A slowly morphing, gently glowing
 * icosahedron with a crisp wireframe shell around it. This is the focal point
 * that reads as "engineered core" at the heart of the network.
 */
function GlowCore() {
  const wireRef = useRef(null);

  useFrame((state, delta) => {
    if (!wireRef.current) return;
    wireRef.current.rotation.y -= delta * 0.22;
    wireRef.current.rotation.x += delta * 0.05;
  });

  return (
    <group>
      {/* Soft morphing inner sphere */}
      <Icosahedron args={[0.92, 12]}>
        <MeshDistortMaterial
          color={COLOR_CORE}
          emissive={COLOR_PRIMARY}
          emissiveIntensity={0.85}
          roughness={0.18}
          metalness={0.55}
          distort={0.32}
          speed={1.6}
          transparent
          opacity={0.92}
        />
      </Icosahedron>

      {/* Crisp wireframe shell, counter-rotating for depth */}
      <Icosahedron ref={wireRef} args={[1.18, 1]}>
        <meshBasicMaterial
          color={COLOR_SECONDARY}
          wireframe
          transparent
          opacity={0.35}
        />
      </Icosahedron>
    </group>
  );
}

function NodeNetwork() {
  const groupRef = useRef(null);
  const packetRefs = useRef([]);
  const { pointer } = useThree();

  const { nodes, edges, packets } = useMemo(() => buildNetwork(), []);

  // Reusable vectors — no allocation inside useFrame.
  const tmpA = useRef(new THREE.Vector3());
  const tmpB = useRef(new THREE.Vector3());
  // Mutable packet runtime state (cloned so the memo stays pure).
  const packetState = useRef(packets.map((p) => ({ ...p }))).current;

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Slow rotation + gentle bob.
    group.rotation.y += delta * 0.12;
    group.rotation.x += delta * 0.015;
    group.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.12;

    // Subtle mouse parallax (lerp toward pointer, clamped influence).
    const targetX = pointer.y * 0.18;
    const targetY = group.rotation.y + pointer.x * 0.18;
    group.rotation.x += (targetX - group.rotation.x) * 0.02;
    group.rotation.y += (targetY - group.rotation.y) * 0.02;

    // Advance data packets along edges.
    for (let i = 0; i < packetState.length; i++) {
      const pkt = packetState[i];
      const mesh = packetRefs.current[i];
      if (!mesh) continue;

      pkt.t += delta * pkt.speed;
      if (pkt.t >= 1) {
        // Hop to another edge — deterministic walk, no random in render.
        pkt.t -= 1;
        pkt.edge = (pkt.edge + 7) % edges.length;
      }

      const [a, b] = edges[pkt.edge];
      tmpA.current.copy(nodes[a]);
      tmpB.current.copy(nodes[b]);
      mesh.position.lerpVectors(tmpA.current, tmpB.current, pkt.t);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Edges — subtle, low opacity */}
      {edges.map((edge, i) => (
        <Line
          key={`edge-${i}`}
          points={[nodes[edge[0]], nodes[edge[1]]]}
          color={i % 2 === 0 ? COLOR_EDGE : COLOR_SECONDARY}
          lineWidth={1}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      ))}

      {/* Nodes — low-poly emissive spheres */}
      {nodes.map((pos, i) => (
        <mesh key={`node-${i}`} position={pos}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? COLOR_PRIMARY : COLOR_SECONDARY}
            emissive={i % 2 === 0 ? COLOR_PRIMARY : COLOR_SECONDARY}
            emissiveIntensity={1.4}
            transparent
            opacity={0.7}
            roughness={0.35}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* Data packets — bright travelling dots */}
      {packetState.map((pkt, i) => (
        <mesh
          key={`packet-${i}`}
          ref={(el) => (packetRefs.current[i] = el)}
        >
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial
            color={pkt.color}
            emissive={pkt.color}
            emissiveIntensity={2.4}
            transparent
            opacity={0.95}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/** The full animated scene, wrapped in Float for organic drift. */
function Scene() {
  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.6}>
      <GlowCore />
      <NodeNetwork />
      {/* Ambient premium particles drifting through the composition */}
      <Sparkles
        count={36}
        scale={[6, 5, 6]}
        size={2.2}
        speed={0.32}
        opacity={0.55}
        color={COLOR_PACKET_B}
      />
    </Float>
  );
}

const HeroAccent3D = ({ active = true }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(shouldRenderAccent());
  }, []);

  if (!enabled) return null;

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 5]} intensity={1.1} color={COLOR_PACKET_A} />
      <pointLight position={[-5, -3, 2]} intensity={0.7} color={COLOR_PRIMARY} />
      <pointLight position={[0, 0, 3]} intensity={0.6} color={COLOR_SECONDARY} />
      <Scene />
    </Canvas>
  );
};

export default HeroAccent3D;
