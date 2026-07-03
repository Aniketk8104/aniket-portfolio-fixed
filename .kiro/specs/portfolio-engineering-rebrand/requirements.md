# Requirements Document

## Introduction

The existing personal portfolio is a React 18 + Vite 5 single-page scroll site positioned around "Freelance MERN Developer" services. This feature transforms the site into a premium engineering portfolio that positions the owner as a Software Engineer / Backend / Platform Engineer / AI Automation Builder. The transformation introduces a hybrid architecture (Home remains scroll-based, new content lives behind real client-side routes), adopts TypeScript alongside existing JSX, introduces a custom React-based SVG diagram primitive library, and applies a Stripe/Linear/Vercel/Railway-inspired dark, minimal, engineering-first design language. All long-form content (case studies, architecture writeups, articles) is authored by the user and must never be fabricated by the system.

## Glossary

- **Portfolio_App**: The React 18 + Vite 5 single-page application being rebranded.
- **Home_Page**: The root route (`/`) which preserves the existing scroll-based layout.
- **Architecture_Index**: The route `/architecture` listing all architecture topics.
- **Architecture_Topic_Page**: Per-topic pages (e.g. `/architecture/distributed-messaging`) that render diagrams and prose.
- **Case_Studies_Index**: The route `/case-studies` listing case studies.
- **Case_Study_Page**: A single case study detail route at `/case-studies/:slug`.
- **Writing_Index**: The route `/writing` listing articles.
- **Article_Page**: A single article detail route at `/writing/:slug`.
- **Router**: The `react-router-dom` v6+ client-side routing layer.
- **Design_System**: The shared set of color tokens, typography scale, spacing scale, motion tokens, and base components.
- **Diagram_Primitives**: The custom React-based SVG primitive library (Node, Edge, Group, Lane, Cluster, Annotation, etc.) used to compose architecture diagrams.
- **Composed_Diagram**: A specific architecture diagram composed from Diagram_Primitives for a single Architecture_Topic_Page.
- **Content_Schema**: TypeScript-typed data structures for case studies, architecture topics, and articles.
- **Placeholder_Marker**: A clearly visible, lint-detectable string token (e.g. `__USER_AUTHORED__`) used in templates where user content is required.
- **Animated_Background**: The existing dual-variant background system (`AnimatedBackground` full and `AnimatedBackgroundLite`) with adaptive switching.
- **Custom_Cursor**: The existing `CustomCursor` component.
- **Scroll_Progress**: The existing `ScrollProgress` indicator component.
- **Floating_CTA**: The existing floating call-to-action button component.
- **Performance_Tracker**: The existing web vitals reporting utility.
- **Service_Worker**: The existing PWA service worker registered from `public/sw.js`.
- **Featured_Projects**: The set {BVISIONR, Radique, Aura Tech Platform, StopSearch}.
- **Architecture_Topics**: The set {Distributed Messaging, AI Routing, Multi-Tenant SaaS, WhatsApp Infrastructure, Healthcare Workflow, Deployment Infrastructure}.
- **Writing_Topics**: The set {Multi-Tenant SaaS, Distributed Messaging Pipelines, WhatsApp Infrastructure at Scale, Reliable AI Automation, RBAC Patterns, Queue-Based System Design, Event-Driven Architectures}.
- **Lighthouse_Baseline**: The current production Lighthouse scores measured against `/` before the rebrand.
- **SPA_Fallback**: The Netlify rewrite rule that serves `index.html` for unmatched client-side routes.

## Requirements

### Requirement 1: Information Architecture and Routing

**User Story:** As a visitor, I want a clear hybrid information architecture with stable URLs for deep content, so that I can navigate to specific case studies, architecture topics, or articles without losing the immersive home experience.

#### Acceptance Criteria

1. THE Portfolio_App SHALL expose the routes `/`, `/architecture`, `/architecture/:slug`, `/case-studies`, `/case-studies/:slug`, `/writing`, and `/writing/:slug` via the Router.
2. THE Home_Page SHALL retain its existing scroll-based section layout at `/`.
3. WHEN a user navigates between any two routes, THE Router SHALL update the URL via `react-router-dom` without a full page reload.
4. WHEN a user requests a route slug that does not exist in the Content_Schema, THE Portfolio_App SHALL render a 404 view with a link back to `/`.
5. THE Portfolio_App SHALL render the global navigation, Footer, Animated_Background, Custom_Cursor, Scroll_Progress, and Floating_CTA on every route.

### Requirement 2: Home Page Composition

**User Story:** As a visitor landing on the home page, I want a focused engineering narrative with hero, metrics, expertise, philosophy, featured projects, about preview, testimonials, and contact sections, so that I can quickly evaluate the owner's engineering positioning.

#### Acceptance Criteria

1. THE Home_Page SHALL render the following sections in order: Hero, Metrics, Core Expertise, Engineering Philosophy, Featured Projects, About Preview, Testimonials, Contact.
2. THE Hero section SHALL present the positioning "Software Engineer / Backend / Platform Engineer / AI Automation Builder" and SHALL NOT contain the strings "Freelance MERN" or "MERN Stack Developer".
3. THE Featured Projects section SHALL render exactly the four Featured_Projects in this order: BVISIONR, Radique, Aura Tech Platform, StopSearch.
4. THE About Preview section SHALL render a condensed summary and SHALL link to `/` anchor or dedicated About content as a "Read more" affordance.
5. THE Contact section SHALL render the existing contact controls rebranded for engineering engagements.
6. WHERE the user has reduced-motion preferences enabled, THE Home_Page SHALL disable non-essential entrance animations.

### Requirement 3: About Repositioning

**User Story:** As a hiring manager, I want the About content to position the owner as an engineer rather than a freelance MERN developer, so that the narrative matches the technical work shown on the site.

#### Acceptance Criteria

1. THE About content SHALL describe the owner using the roles "Software Engineer", "Backend Engineer", "Platform Engineer", or "AI Automation Builder".
2. THE About content SHALL NOT contain the phrases "Freelance MERN", "MERN Stack Developer", or "Hire MERN".
3. THE About content body SHALL be sourced from a Content_Schema entry authored by the user and SHALL render Placeholder_Marker tokens where the user has not yet supplied final copy.

### Requirement 4: Projects Index

**User Story:** As a visitor, I want a Projects index that surfaces engineering projects in a consistent, scannable layout, so that I can compare scope and impact at a glance.

#### Acceptance Criteria

1. THE Portfolio_App SHALL render a Projects index that lists each Featured_Project with a name, one-line summary, role, and primary tech tags.
2. THE Projects index SHALL link each item to its corresponding Case_Study_Page when a case study exists for that project.
3. WHERE a project has no published case study, THE Projects index SHALL mark the entry as "Case study coming soon" without linking to a non-existent route.
4. THE Projects index SHALL source its data from a typed `projects` collection in the Content_Schema.

### Requirement 5: Architecture Index and Topic Pages

**User Story:** As a technical visitor, I want an Architecture index plus per-topic pages with custom diagrams, so that I can study how the owner thinks about systems.

#### Acceptance Criteria

1. THE Architecture_Index SHALL list each entry in Architecture_Topics with title, one-line summary, and link to the corresponding Architecture_Topic_Page.
2. WHEN a user opens an Architecture_Topic_Page, THE page SHALL render a Composed_Diagram built from Diagram_Primitives plus user-authored prose sections.
3. THE Architecture_Topic_Page template SHALL render Placeholder_Marker tokens for any prose section the user has not authored.
4. THE Architecture_Topic_Page SHALL render a "Related case studies" block linking to any Case_Study_Page tagged with the same topic, and SHALL omit the block when no related case studies exist.

### Requirement 6: Case Studies Index and Detail Template

**User Story:** As a visitor evaluating engineering depth, I want case studies that follow a consistent structure (context, problem, constraints, architecture, decisions, tradeoffs, outcomes), so that I can compare projects and trust the rigor.

#### Acceptance Criteria

1. THE Case_Studies_Index SHALL list each case study with title, project, role, duration, and primary tags.
2. THE Case_Study_Page template SHALL render the sections: Overview, Context, Problem, Constraints, Architecture, Key Decisions, Tradeoffs, Outcomes, and Lessons.
3. WHERE a Case_Study_Page section has no user-authored content, THE template SHALL render a Placeholder_Marker token instead of fabricated copy.
4. THE Case_Study_Page SHALL NOT render fabricated metrics; numerical claims SHALL be rendered only when supplied by the user via the Content_Schema.
5. THE Case_Study_Page SHALL embed Composed_Diagrams when the Content_Schema entry references a diagram identifier.

### Requirement 7: Writing Index and Article Template

**User Story:** As a reader, I want a Writing index and clean article pages for engineering essays, so that I can read longer-form thinking on the listed topics.

#### Acceptance Criteria

1. THE Writing_Index SHALL list each article with title, summary, topic tags, and estimated reading time.
2. THE Article_Page template SHALL render title, metadata, table of contents (when present in Content_Schema), and prose body.
3. WHERE an article body has not been authored, THE Article_Page SHALL render a Placeholder_Marker token and SHALL NOT generate filler content.
4. THE Writing_Index SHALL include one entry per item in Writing_Topics, each linked to its Article_Page slug.

### Requirement 8: Contact

**User Story:** As a visitor wanting to engage, I want a contact path framed for engineering work, so that I can start an engineering-relevant conversation.

#### Acceptance Criteria

1. THE Contact section SHALL retain the existing functional contact controls (form and/or direct links) and SHALL update copy to reference engineering engagements rather than freelance MERN services.
2. THE Floating_CTA SHALL be rebranded with engineering-oriented label copy and SHALL preserve its current behavior and visibility rules.

### Requirement 9: Design System

**User Story:** As a visitor, I want a cohesive visual language inspired by Stripe, Linear, Vercel, and Railway, so that the site feels premium, calm, and engineering-credible.

#### Acceptance Criteria

1. THE Design_System SHALL define color tokens for a dark theme, typography scale, spacing scale, radii, elevation, and motion tokens, exposed as CSS custom properties.
2. THE Design_System SHALL include base components for Button, Link, Card, Section, Badge, Tag, Tabs, and Code Block, all consuming Design_System tokens.
3. THE Design_System SHALL apply glassmorphism surfaces sparingly and only on elevated panels.
4. THE Design_System SHALL NOT introduce flashy effects such as neon glows, particle storms, or saturated gradients beyond the existing Animated_Background.
5. THE Design_System SHALL be implemented in TypeScript modules for any new component code.

### Requirement 10: Diagram Primitive Library

**User Story:** As an architecture reader, I want diagrams that look consistent, accessible, and engineering-credible across topics, so that I can focus on the system rather than the styling.

#### Acceptance Criteria

1. THE Diagram_Primitives SHALL be implemented as a React-based SVG primitive library written in TypeScript.
2. THE Diagram_Primitives SHALL include at minimum: Node, Edge, Group/Cluster, Lane, Annotation, and Legend primitives.
3. THE Diagram_Primitives SHALL consume Design_System tokens for color, stroke, radius, and typography.
4. THE Diagram_Primitives SHALL be responsive and SHALL render legibly at viewport widths from 360px to 1920px.
5. THE Diagram_Primitives SHALL apply framer-motion animations only as subtle entrance or hover transitions and SHALL respect `prefers-reduced-motion`.
6. THE Composed_Diagrams SHALL exist for each entry in Architecture_Topics.

### Requirement 11: Content Schema and Authored Content

**User Story:** As the site owner, I want all long-form content driven by typed schemas with clear placeholders, so that I retain authorship and the system never invents claims on my behalf.

#### Acceptance Criteria

1. THE Content_Schema SHALL define TypeScript types for `Project`, `CaseStudy`, `ArchitectureTopic`, and `Article`.
2. THE Content_Schema SHALL store data as typed module exports (e.g. `.ts` files) under a dedicated content directory.
3. WHERE a content field has not been authored by the user, THE Portfolio_App SHALL render a Placeholder_Marker token rather than generated prose, generated metrics, or generated tradeoffs.
4. THE Portfolio_App SHALL NOT fabricate problem statements, metrics, tradeoffs, decisions, or article bodies.
5. THE Content_Schema SHALL fail the build when a required field is missing for a published entry.

### Requirement 12: TypeScript Adoption

**User Story:** As a maintainer, I want TypeScript adopted incrementally without breaking existing JSX, so that new code gains type safety while legacy code keeps working.

#### Acceptance Criteria

1. THE Portfolio_App SHALL include a `tsconfig.json` with `allowJs: true` and strict type checking enabled for `.ts`/`.tsx` files.
2. THE Portfolio_App SHALL author all new files introduced by this feature in `.ts` or `.tsx`.
3. THE Portfolio_App SHALL leave existing `.jsx` files unchanged in language unless their content is being rebranded as part of another requirement.
4. THE Portfolio_App SHALL document a separate, non-blocking migration plan for converting legacy `.jsx` files to `.tsx`.
5. THE build SHALL fail when a `.ts` or `.tsx` file contains a TypeScript error.

### Requirement 13: Folder Restructure

**User Story:** As a maintainer, I want a folder structure that separates routes, sections, design system, diagrams, and content, so that the codebase scales with the new surface area.

#### Acceptance Criteria

1. THE Portfolio_App SHALL organize new code under directories for `routes/`, `sections/`, `design-system/`, `diagrams/`, and `content/` (exact names defined in design phase).
2. THE Portfolio_App SHALL preserve existing `src/components/` files in place and SHALL only relocate files when a related rebrand requirement requires it.
3. THE Portfolio_App SHALL expose route components from a dedicated `routes/` directory consumed by the Router configuration.

### Requirement 14: SEO and Structured Data Rebrand

**User Story:** As a visitor or search engine, I want SEO metadata, structured data, and indexable artifacts to reflect the engineering positioning, so that search results match the site's actual focus.

#### Acceptance Criteria

1. THE Portfolio_App SHALL set per-route `<title>`, `<meta name="description">`, canonical URL, and Open Graph / Twitter Card tags for each route in Requirement 1.
2. THE Portfolio_App SHALL replace any "freelance MERN" JSON-LD payload with a `Person` JSON-LD payload describing engineering roles, and SHALL add `Article` JSON-LD on Article_Page routes.
3. THE Portfolio_App SHALL regenerate `public/sitemap.xml` to include every public route in Requirement 1 plus published case study, architecture, and article slugs.
4. THE Portfolio_App SHALL NOT contain the strings "Freelance MERN", "MERN Stack Developer", or "Hire MERN" in any rendered HTML, JSON-LD, meta tag, sitemap entry, or manifest field after the rebrand.
5. THE Portfolio_App SHALL apply a documented disposition for `public/blog/hire-mern-stack-developer-checklist.html` that is one of: rebrand to engineering content, remove the file and add a 301 redirect to `/writing`, or remove the file and exclude from sitemap.

### Requirement 15: Performance Budgets

**User Story:** As a visitor, I want the rebranded site to load and respond as fast or faster than today, so that the premium feel is matched by real performance.

#### Acceptance Criteria

1. THE Portfolio_App SHALL achieve Lighthouse Performance, Accessibility, Best Practices, and SEO scores greater than or equal to the Lighthouse_Baseline on `/` after the rebrand.
2. THE Portfolio_App SHALL code-split each route in Requirement 1 via `React.lazy` or equivalent dynamic import.
3. THE Portfolio_App SHALL lazy-load below-the-fold heavy components on the Home_Page and on every Case_Study_Page, Architecture_Topic_Page, and Article_Page.
4. THE Portfolio_App SHALL keep the initial JavaScript payload for `/` less than or equal to the current production initial JS payload (gzipped) measured before the rebrand.
5. THE Portfolio_App SHALL continue to report Core Web Vitals via the existing Performance_Tracker.

### Requirement 16: Accessibility

**User Story:** As a visitor using assistive technology, I want full keyboard support and accessible diagrams, so that I can use the site without a mouse.

#### Acceptance Criteria

1. THE Portfolio_App SHALL expose every interactive element to keyboard users with a visible focus indicator that meets WCAG 2.1 AA non-text contrast.
2. WHEN the Router navigates to a new route, THE Portfolio_App SHALL move focus to the route's primary heading or a `<main>` landmark.
3. THE Diagram_Primitives SHALL render an accessible name and description (via `<title>`, `<desc>`, or `aria-labelledby`) for every Composed_Diagram.
4. THE Portfolio_App SHALL meet WCAG 2.1 AA color contrast on text and meaningful UI elements within the Design_System tokens.
5. WHERE a user has `prefers-reduced-motion: reduce` set, THE Portfolio_App SHALL disable non-essential motion across the Animated_Background, Diagram_Primitives, and section entrance animations.

### Requirement 17: Netlify SPA Routing Fallback

**User Story:** As a visitor opening a deep link, I want client-side routes to load directly from a refresh or shared URL, so that the new routes are not broken on Netlify.

#### Acceptance Criteria

1. THE Portfolio_App SHALL configure an SPA_Fallback in `netlify.toml` (or `public/_redirects`) that serves `index.html` with HTTP 200 for any request that does not match a static asset.
2. WHEN a visitor reloads any route in Requirement 1, THE Portfolio_App SHALL render the same view as a client-side navigation to that route.
3. THE SPA_Fallback SHALL NOT shadow real static files such as `/sitemap.xml`, `/robots.txt`, `/manifest.json`, `/favicon.ico`, or files under `/assets/`.

### Requirement 18: Motion Guidelines

**User Story:** As a visitor, I want motion that feels like Stripe, Linear, or Vercel, so that animations enhance rather than distract.

#### Acceptance Criteria

1. THE Portfolio_App SHALL define motion tokens (duration, easing, distance) in the Design_System and SHALL consume them from all framer-motion usages.
2. THE Portfolio_App SHALL limit entrance animations to opacity and small translate transforms with durations between 150ms and 600ms.
3. THE Portfolio_App SHALL NOT use parallax, infinite-loop background motion, or oversized scale animations in new components.
4. WHERE a user has `prefers-reduced-motion: reduce` set, THE Portfolio_App SHALL render the final visual state immediately without transition.

### Requirement 19: Preserve Existing Premium UX

**User Story:** As a returning visitor, I want the existing premium UX touches (animated background, custom cursor, scroll progress, floating CTA, web vitals, service worker) to keep working, so that nothing the site already does well regresses.

#### Acceptance Criteria

1. THE Portfolio_App SHALL preserve the existing Animated_Background full/lite variant switching behavior on every route.
2. THE Portfolio_App SHALL preserve the Custom_Cursor on pointer devices on every route and SHALL hide it on touch-only devices as it does today.
3. THE Portfolio_App SHALL preserve the Scroll_Progress indicator on every route.
4. THE Portfolio_App SHALL preserve the Floating_CTA behavior with rebranded copy per Requirement 8.
5. THE Portfolio_App SHALL continue to register the Service_Worker and SHALL continue to invoke the Performance_Tracker on app boot.

### Requirement 20: Migration of Existing Freelance Assets

**User Story:** As the site owner, I want all legacy freelance MERN assets and metadata audited and migrated, so that no stale freelance footprint remains after the rebrand.

#### Acceptance Criteria

1. THE Portfolio_App SHALL update `public/manifest.json` `name`, `short_name`, and `description` fields to engineering-positioned copy and SHALL NOT contain the strings "Freelance MERN", "MERN Stack Developer", or "Hire MERN".
2. THE Portfolio_App SHALL regenerate `public/sitemap.xml` so that it lists exactly the public routes defined by this feature plus the chosen disposition for `public/blog/hire-mern-stack-developer-checklist.html` per Requirement 14.5.
3. THE Portfolio_App SHALL update `public/robots.txt` to reference the new sitemap URL and SHALL NOT disallow the new routes.
4. THE Portfolio_App SHALL update `index.html` `<title>`, `<meta name="description">`, and any inline JSON-LD to engineering-positioned copy.
5. IF a legacy asset references freelance MERN copy and is not migrated, THEN THE build SHALL fail a content lint check that scans rendered HTML, public assets, and Content_Schema entries for the prohibited strings listed in Requirement 14.4.
