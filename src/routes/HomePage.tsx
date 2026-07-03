/**
 * HomePage — root route (/).
 *
 * Composes the home-page scroll layout as a narrative arc:
 *   1. Hero         — Vision      (HeroSection.jsx)
 *   2. About        — Identity    (AboutPreviewSection.tsx)
 *   3. Projects     — Proof       (FeaturedProjectsSection.tsx)
 *   4. Expertise    — Capability  (EngineeringConstellation.tsx)
 *   5. Metrics      — by the numbers (MetricsSection.tsx)
 *   6. Principles   — Thinking    (EngineeringPhilosophySection.tsx)
 *   7. Trust        — Validation  (ProductionTrustSection.tsx)
 *
 * Wrapped with <RouteSEO routeKey="home" /> for per-route SEO metadata.
 *
 * Validates: Requirements 2.1, 2.2, 14.1
 * Depends on: 7.1, 7.2, 7.3, 7.4, 7.5, 4.1
 */

import React from 'react';

// SEO
import { RouteSEO } from '../app/SEO/RouteSEO';

// New TSX sections
import { MetricsSection } from '../sections/home/MetricsSection';
import { EngineeringConstellation } from '../sections/home/EngineeringConstellation';
import { EngineeringPhilosophySection } from '../sections/home/EngineeringPhilosophySection';
import { FeaturedProjectsSection } from '../sections/home/FeaturedProjectsSection';
import { AboutPreviewSection } from '../sections/home/AboutPreviewSection';
import { ProductionTrustSection } from '../sections/home/ProductionTrustSection';

// Legacy JSX sections (imported as-is per migration plan)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — legacy JSX module, no TS types available
import HeroSection from '../components/HeroSection';

// Content
import type { Metric } from '../types/content';
import { aboutContent } from '../content/about';

// ─────────────────────────────────────────────────────────────────────────────
// Static content sourced inline; real values authored by user via content modules.
// Values here are placeholders until the owner supplies final copy.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Home-page metrics.
 * Values rendered verbatim from content — never derived or fabricated.
 * Replace placeholder strings with real data when available.
 */
const HOME_METRICS: Metric[] = [
  { label: 'Production Systems', value: '4', tone: 'positive' },
  { label: 'Years of Experience', value: '1+', tone: 'positive' },
  { label: 'Business Clients', value: '5+', tone: 'positive' },
  { label: 'Operators Enabled', value: '30+', tone: 'positive' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Route component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HomePage — root route (`/`).
 *
 * Renders the full scroll-based home layout.
 * The Hero, Testimonials, and Contact sections are legacy JSX components
 * imported and wrapped here per the migration plan; new TSX sections
 * (Metrics, CoreExpertise, EngineeringPhilosophy, FeaturedProjects, AboutPreview)
 * are authored in TypeScript and composed alongside them.
 *
 * `<RouteSEO routeKey="home" />` sets the per-route title, description,
 * canonical URL, Open Graph / Twitter Card tags, and Person JSON-LD.
 */
export default function HomePage(): React.ReactElement {
  return (
    <>
      {/* Per-route SEO — title, description, OG, Twitter, Person JSON-LD */}
      <RouteSEO routeKey="home" />

      {/* Narrative order:
          1 Hero (Vision) → 2 About (Identity) → 3 Projects (Proof) →
          4 Expertise (Capability) → 5 Metrics (by the numbers) →
          6 Principles (Thinking) → 7 Trust (Validation). */}

      {/* 1. Hero — Vision. Renders <section id="home"> internally. */}
      <HeroSection />

      {/* 2. About — Identity (id="about" for the Navbar "About" hash link). */}
      <section id="about">
        <AboutPreviewSection
          headline={aboutContent.headline}
          summary="I build reliable backend platforms and AI-powered systems that stay scalable and resilient as products and teams grow."
        />
      </section>

      {/* 3. Featured Projects — Proof (id="portfolio"). */}
      <FeaturedProjectsSection />

      {/* 4. Expertise — Capability. "Engineering Constellation" (id="tech"). */}
      <EngineeringConstellation />

      {/* 5. Metrics — quantitative proof ("by the numbers"). */}
      <MetricsSection metrics={HOME_METRICS} />

      {/* 6. Engineering Philosophy — Principles / Thinking (id="philosophy"). */}
      <EngineeringPhilosophySection />

      {/* 7. Production Trust — Validation (id="testimonials"). */}
      <ProductionTrustSection />
    </>
  );
}
