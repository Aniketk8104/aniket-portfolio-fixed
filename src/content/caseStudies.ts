/**
 * Case Studies Content
 *
 * One case study entry per Featured Project — all authored and published.
 *
 * Source of truth: Aniket Kushwaha's résumé and the projects' own READMEs.
 * Tech stacks, metrics, and claims are drawn directly from documented work —
 * no fabricated numbers or tooling.
 *
 * @module content/caseStudies
 */

import type { CaseStudy, RichText } from '../types/content';
import type { Placeholder } from '../utils/placeholder';

/**
 * Case study entry with placeholder support for unset prose sections.
 * (All entries are currently authored; the Placeholder union is retained so
 * future draft case studies can be added without a type change.)
 */
export type CaseStudyEntry = Omit<CaseStudy, 'summary' | 'role' | 'duration' | 'sections'> & {
  summary: string | Placeholder<string>;
  role: string | Placeholder<string>;
  duration: string | Placeholder<string>;
  sections: {
    overview?: RichText | Placeholder<RichText>;
    context?: RichText | Placeholder<RichText>;
    problem?: RichText | Placeholder<RichText>;
    constraints?: RichText | Placeholder<RichText>;
    architecture?: RichText | Placeholder<RichText>;
    decisions?: RichText | Placeholder<RichText>;
    tradeoffs?: RichText | Placeholder<RichText>;
    outcomes?: RichText | Placeholder<RichText>;
    lessons?: RichText | Placeholder<RichText>;
  };
};

/**
 * Case studies for each Featured Project.
 */
export const caseStudies: CaseStudyEntry[] = [
  {
    slug: 'bvisionr',
    projectSlug: 'bvisionr',
    title: 'BVISIONR Case Study',
    summary:
      'Building a multi-tenant AI WhatsApp infrastructure platform from scratch — a BullMQ queue-based campaign pipeline with zero message loss, real-time Socket.IO messaging, isolated tenant environments, and an event-driven RBAC team inbox.',
    role: 'Full-Stack Engineer · Backend & Platform',
    duration: '2025 – Present',
    status: 'published',
    tags: ['saas', 'ai', 'messaging', 'multi-tenant', 'whatsapp', 'real-time'],
    diagramId: 'multi-tenant-saas',
    metrics: [
      { label: 'Messages / Campaign', value: '1,000+', tone: 'positive' },
      { label: 'Message Loss', value: 'Zero', tone: 'positive' },
      { label: 'Business Clients', value: '3+', tone: 'neutral' },
      { label: 'Operators Enabled', value: '30+', tone: 'positive' },
    ],
    gallery: [
      {
        src: '/projects/bvisionr%20screenshots/Chat%20Inbox.svg',
        alt: 'BVISIONR real-time team inbox showing multi-tenant WhatsApp conversations',
        caption: 'Real-time RBAC team inbox — Socket.IO-powered shared conversations with role-based access.',
      },
      {
        src: '/projects/bvisionr%20screenshots/Brodcast%20Campaigns.svg',
        alt: 'BVISIONR broadcast campaign dashboard with queue-based message delivery',
        caption: 'Broadcast campaigns — BullMQ queue-based pipeline delivering 1,000+ messages per campaign with zero loss.',
      },
      {
        src: '/projects/bvisionr%20screenshots/AutomationFlows.svg',
        alt: 'BVISIONR automation flows configuration screen',
        caption: 'Automation flows — event-driven triggers that run customer communication without engineering support.',
      },
      {
        src: '/projects/bvisionr%20screenshots/NoCodeFlowBuilder.svg',
        alt: 'BVISIONR no-code visual flow builder canvas',
        caption: 'No-code flow builder — a visual canvas letting non-technical operators design automations.',
      },
    ],
    sections: {
      overview:
        'BVISIONR is a multi-tenant AI WhatsApp infrastructure platform that lets businesses and agencies run, automate, and scale customer communication. A single backend serves multiple isolated tenants — each with their own users, roles, templates, and automations — behind a real-time product surface. I built it from scratch: the queue-based campaign pipeline that delivers messages reliably at scale, the real-time Socket.IO messaging layer, the event-driven RBAC team inbox, AI campaign generation, a no-code automation builder, and real-time analytics dashboards that let 30+ non-technical operators run full communication workflows without engineering support.',
      context:
        'Businesses increasingly run sales and support over WhatsApp, but Meta’s WhatsApp Cloud API is low-level — it speaks in webhooks, rate limits, template approvals, and per-message delivery callbacks. BVISIONR wraps that into a managed product serving 3+ business clients, turning a raw messaging channel into campaigns, automations, a shared team inbox, and analytics, with every tenant isolated from the others.',
      problem:
        'Sending WhatsApp messages one synchronous API call at a time collapses under real campaign load: rate limits trigger, requests time out, and naive retries duplicate messages. Inbound messages and delivery webhooks arrive asynchronously, so the system needs a durable way to absorb bursts, retry safely, and never lose a message. The core problem was a messaging backend that stays reliable and fair across many tenants while remaining observable enough to trace a single message end to end.',
      constraints:
        'The platform had to respect Meta WhatsApp Cloud API rate limits and template rules, guarantee that no tenant could read or affect another tenant’s data, and never lose a message under load. With a small team, it had to be deployable with Docker on OCI, recoverable without manual data surgery, and instrumented well enough that one engineer could trace problems in production.',
      architecture:
        'The backend is a Node.js and Express.js service with MongoDB for state. Outbound campaigns and inbound events are decoupled through BullMQ queues (backed by Redis): API requests enqueue jobs rather than calling WhatsApp directly, and queue workers drain them at a controlled rate with retry logic, throughput control, and dead-letter (DLQ) recovery for poison jobs. Real-time messaging and live analytics are pushed to clients over Socket.IO. Webhooks from the Meta WhatsApp Cloud API are verified, normalized, and fed back through the same queue system to reconcile delivery state. Tenant isolation and an event-driven RBAC model gate every action so the team inbox stays scoped per tenant. The service is containerized with Docker and deployed on OCI.',
      decisions:
        'The most consequential decision was queue-based delivery via BullMQ rather than synchronous sends — it gave the system natural backpressure, fair scheduling across tenants, safe retries, DLQ recovery, and low request latency because handlers return as soon as a job is accepted. Socket.IO drives the real-time inbox and analytics. Enforcing tenant isolation and RBAC as a structural property, rather than per-query discipline, made cross-tenant safety a guarantee of the system. Treating webhooks as just another queue source unified inbound and outbound flows under one observable pipeline.',
      tradeoffs:
        'Queue-based delivery is eventually consistent: a message is “accepted” before it is “sent,” so the UI and analytics model intermediate states (queued, sent, delivered, read, failed) rather than a single boolean. Running per-tenant workers increases operational surface compared with one shared pipeline, but it is what makes fairness and isolation possible. Depending on Redis (via BullMQ) is mitigated with persistence and reconnection handling.',
      outcomes:
        'The platform processes 1,000+ messages per campaign with zero message loss under load and full event-driven observability. Bursts are absorbed by the queue instead of overwhelming the Cloud API, retries no longer create duplicates, and a failing job is contained in the DLQ rather than cascading. 30+ non-technical operators run AI-generated campaigns and no-code automations across 3+ business clients without engineering support, backed by real-time analytics.',
      lessons:
        'Pushing reliability concerns — rate limiting, retries, fairness — into a queue boundary rather than request handlers paid off repeatedly. Making tenant isolation a structural property instead of a per-query habit prevented the kind of mistake that is catastrophic in multi-tenant systems. Investing early in tracing a single message across the queue made production support tractable for a small team. If I rebuilt it, I would formalize the message-state machine even earlier, since nearly every UI and analytics question traced back to it.',
    },
  },
  {
    slug: 'radique',
    projectSlug: 'radique',
    title: 'Radique Case Study',
    summary:
      'Architecting a radiology workflow SaaS that integrates PACS-style DICOM imaging through Orthanc and coordinates case assignment, report generation, and multi-centre audit tracking — with audit-logged, state-managed backend systems that keep every diagnostic case traceable.',
    role: 'Full-Stack Engineer · Workflow & Backend',
    duration: '2025',
    status: 'published',
    tags: ['healthcare', 'radiology', 'workflow', 'dicom', 'pacs'],
    diagramId: 'healthcare-workflow',
    metrics: [
      { label: 'Diagnostic Cases', value: '50+', tone: 'positive' },
      { label: 'Radiology Centres', value: '3+', tone: 'neutral' },
      { label: 'Traceability', value: 'Full audit', tone: 'positive' },
      { label: 'Imaging', value: 'DICOM / PACS', tone: 'neutral' },
    ],
    gallery: [
      {
        src: '/projects/Radique%20Screenshots/image.png',
        alt: 'Radique smart worklist dashboard with STAT case prioritisation',
        caption: 'Smart worklist — priority-first case list that surfaces STAT studies with saved filters.',
      },
      {
        src: '/projects/Radique%20Screenshots/image1.png',
        alt: 'Radique DICOM viewer with clustered imaging tools',
        caption: 'DICOM viewer — clustered tools and keyboard-first navigation for rapid image review.',
      },
      {
        src: '/projects/Radique%20Screenshots/image2.png',
        alt: 'Radique AI-assisted diagnostic panel showing heatmaps and confidence levels',
        caption: 'AI-assisted panel — heatmaps and explicit confidence levels that support, not replace, the radiologist.',
      },
      {
        src: '/projects/Radique%20Screenshots/image3.png',
        alt: 'Radique integrated report editor alongside the imaging viewer',
        caption: 'Integrated report editor — snapshot capture and auto-insertion beside the viewer, no window switching.',
      },
    ],
    sections: {
      overview:
        'Radique is a radiology workflow SaaS that connects multiple imaging centres around a shared, accountable read-and-report process. It integrates PACS-style DICOM imaging through Orthanc and coordinates the full case lifecycle — assignment, reporting, and sign-off — while audit-logging every state change. I architected the workflow engine and the audit-logged, state-managed backend, and built the four surfaces radiologists actually work in: a priority-first worklist, a DICOM viewer wired to Orthanc, an AI-assisted diagnostic panel, and a report editor integrated directly beside the imaging view so a case moves from open to signed-off without leaving the app.',
      context:
        'Radiology is increasingly distributed: a scan acquired at one centre is often read by a specialist elsewhere, and a delay of even a few minutes on a time-critical study can change the outcome for a patient. Imaging data lives in DICOM, stored and served by a PACS (Picture Archiving and Communication System); Radique uses Orthanc as that PACS. Getting the right case in front of the right radiologist quickly, tracking assignment and reporting, layering AI insight without getting in the way, and keeping a defensible audit trail across 3+ radiology centres is the core of the operation.',
      problem:
        'The workflow was slowing radiologists down. Cases were hard to find in an unprioritised worklist, imaging tools and patient data were fragmented, the viewer and the report editor lived in separate windows, and AI output arrived as noise rather than help. Underneath the UX, the system still had to keep case state — received, assigned, in-progress, reported, signed-off — consistent across centres, and healthcare demands accountability: every assignment and report change has to be reconstructable later. The problem was to integrate PACS imaging, surface urgent cases first, make AI legible and controllable, tie reporting to the image, and never lose the trail of who did what.',
      constraints:
        'The platform had to interoperate with a real PACS (Orthanc) over DICOM rather than a custom format, keep case state consistent under concurrent activity across centres, and make the audit record dependable. STAT cases had to be surfaced ahead of routine ones, AI suggestions had to be explainable and reversible (never silently altering a report), and the report had to stay tied to the exact image it described. It also needed to deploy reproducibly with Docker and keep patient and case data access controlled.',
      architecture:
        'Radique is a Next.js and Node.js application backed by MongoDB for case, report, and audit documents. Imaging is integrated through Orthanc, a PACS that stores and serves DICOM studies, and the DICOM viewer talks to it directly with tools clustered for fast, keyboard-first review. A workflow engine drives each case through an explicit state machine — received, assigned, in-progress, reported, signed-off — and a priority-first worklist queries that state to float STAT and urgent cases to the top with saved, sharable filters. An AI-assisted diagnostic panel renders model output as heatmaps plus explicit confidence levels, with one-click accept/reject so a radiologist stays in control and every AI decision is recorded. The report editor is embedded beside the viewer: snapshots capture from the current image and auto-insert into the report, keeping findings tied to their source. Every meaningful action is written to an audit log, giving full operational traceability across the 3+ connected radiology centres, and the system is containerized with Docker.',
      decisions:
        'The defining decisions were to integrate an established PACS (Orthanc) over DICOM instead of reinventing medical-imaging storage, and to model the case lifecycle as an explicit, audit-logged state machine so accountability and worklist prioritisation both fall out of the same source of truth. I treated AI as an assistant, not an authority — surfacing confidence and requiring an explicit accept/reject rather than mutating the report automatically — so radiologists could trust and audit it. Embedding the report editor in the viewer removed the window-switching that fragmented the old workflow. Keeping case, report, and audit records in MongoDB and deploying with Docker kept the stack reproducible and simple to operate at this scale.',
      tradeoffs:
        'Depending on Orthanc/PACS adds an integration boundary, but it avoids rebuilding medical-imaging storage and speaks the standard the centres already use. Keeping AI advisory (accept/reject with confidence) rather than automatic means a human is always in the loop, trading a little speed for trust and safety — the right trade in diagnosis. Writing an audit entry on every state transition costs discipline and storage, but in a clinical context that traceability is non-negotiable. A single document store keeps the system simple at this scale, at the cost of the strict relational guarantees a dedicated audit database would add.',
      outcomes:
        'Radique processed 50+ diagnostic cases across 3+ radiology centres with full operational traceability, reducing workflow errors and enabling end-to-end case accountability. Radiologists find urgent cases first through the priority worklist, review images in a viewer wired straight to Orthanc, weigh AI heatmaps and confidence without losing control, and report beside the image instead of across windows. Coordinators can see case status across centres, and every assignment, AI decision, and report change is reconstructable from the audit log.',
      lessons:
        'In healthcare, traceability and speed both have to be designed in from the start rather than bolted on later. Modeling the case as an explicit state machine made coordination, worklist prioritisation, and audit all fall out of one model. Making AI legible and reversible mattered more than making it clever — an accept/reject with a visible confidence level earned trust that an automatic edit never would. And integrating an established PACS (Orthanc) was far better than rebuilding imaging infrastructure. If I extended it further, I would formalize the case-state machine even more explicitly, since every coordination, AI, and audit question traced back to it.',
    },
  },
  {
    slug: 'aura-tech-platform',
    projectSlug: 'aura-tech-platform',
    title: 'Aura Tech Platform Case Study',
    summary:
      'Building and operating AuraTechServices.in — a live laptop rental and sales platform with a React frontend and a hardened Node.js/Express API on MongoDB, Razorpay checkout, AWS S3 image storage, RBAC dashboards, and containerized deployment with health, readiness, and metrics endpoints.',
    role: 'Full-Stack Engineer · Platform & Payments',
    duration: '2025 – Present',
    status: 'published',
    tags: ['commerce', 'payments', 'inventory', 'rbac', 'devops'],
    diagramId: 'deployment-infrastructure',
    metrics: [
      { label: 'API Response (p95)', value: '< 200', unit: ' ms', tone: 'positive' },
      { label: 'Throughput', value: '1,000+', unit: ' RPS', tone: 'positive' },
      { label: 'Inventory Items', value: '200+', tone: 'neutral' },
      { label: 'Role Dashboards', value: '3', tone: 'neutral' },
    ],
    gallery: [
      {
        src: '/projects/Aura%20Tech%20Screenshots/AuraTech.png',
        alt: 'Aura Tech Services storefront home page',
        caption: 'Storefront — the live auratechservices.in laptop rental and sales catalog.',
      },
      {
        src: '/projects/Aura%20Tech%20Screenshots/image.png',
        alt: 'Aura Tech Services product and checkout experience',
        caption: 'Buy / rent flow — catalog browsing through signature-verified Razorpay checkout.',
      },
      {
        src: '/projects/Aura%20Tech%20Screenshots/image1.png',
        alt: 'Aura Tech Services role-based admin dashboard',
        caption: 'Admin back office — RBAC dashboards for Admin, Dealer, and Partner operations.',
      },
    ],
    sections: {
      overview:
        'Aura Tech Platform powers AuraTechServices.in, a live laptop rental and sales platform. I built the full stack: a fast, responsive React frontend and a hardened Node.js and Express API on MongoDB that runs the catalog, buy and rent flows, Razorpay checkout, and a role-based admin back office across Admin, Dealer, and Partner dashboards — deployed in containers with health, readiness, and metrics endpoints for real production operation.',
      context:
        'Buying and renting laptops at scale needs a catalog, payments, fulfilment, and an admin operation behind it. Aura turns that into one platform: customers browse and check out, while staff manage inventory, orders, and rentals across role-specific dashboards. The platform runs in production at auratechservices.in.',
      problem:
        'A commerce platform has to take money safely, keep inventory accurate, control who can do what, and stay fast and available in production. Payment verification, image storage, authentication, and admin operations all have to be reliable — a demo-grade build would not survive real customers and real money.',
      constraints:
        'The platform had to verify payments with tamper-evident signatures, protect against common web and database attacks, keep API latency low and availability high, gate access by role, and deploy reproducibly. It also had to be observable enough to operate without guesswork.',
      architecture:
        'The frontend is React; the backend is a Node.js 18 and Express API on MongoDB (Mongoose), organized with a service-layer pattern that keeps controllers thin and business logic testable. Authentication uses JWT with refresh tokens, account locking after failed attempts, and Google OAuth, with role-based access control across the Admin, Dealer, and Partner dashboards. Razorpay handles payments with server-side signature verification; AWS S3 stores product images; and order confirmations and admin alerts render from EJS email templates. The service is hardened with Helmet/CSP, CORS, per-endpoint rate limiting, NoSQL-injection sanitization, and validated inputs, and operated with structured Pino logging plus /healthz, /readyz, and /metrics endpoints. It is containerized with Docker and deployable via PM2 or Kubernetes behind an Nginx reverse proxy.',
      decisions:
        'The service-layer pattern kept business logic out of controllers and testable as rules changed. A signature-verified Razorpay flow made payments tamper-evident. Pushing security (Helmet, rate limiting, sanitization, validation) and observability (health/readiness/metrics, structured logs) in from the start made the platform production-ready rather than demo-grade. Containerizing with Docker and supporting Kubernetes made deployment reproducible across environments.',
      tradeoffs:
        'Refresh-token auth with account locking adds flow complexity but materially improves security. Running S3, MongoDB, Razorpay, and email together increases integration surface, but each is the right tool for its job. In-memory caching with TTL speeds reads at the cost of careful cache invalidation. Supporting both PM2 and Kubernetes deployment paths adds documentation overhead but keeps hosting flexible.',
      outcomes:
        'Aura runs live at auratechservices.in, managing 200+ inventory items across Admin, Dealer, and Partner dashboards, with p95 API responses under 200ms, 1,000+ RPS throughput, and a 99.9% uptime target. RBAC-driven workflows and Razorpay payment automation eliminated 10+ hours per week of manual operational overhead.',
      lessons:
        'Building security and observability in from day one is far cheaper than retrofitting them later. A service layer paid for itself the first time the business rules changed. And for commerce, signature verification and careful payment handling are non-negotiable — they are the difference between a demo and a system that can take real money.',
    },
  },
  {
    slug: 'stopsearch',
    projectSlug: 'stopsearch',
    title: 'StopSearch Case Study',
    summary:
      'Building a swipe-based, AI-powered job matchmaking platform for tech and sales hiring in India — three independent user flows (Job Seekers, Hiring Managers, Recruitment Consultants) plus an isolated SuperAdmin console, with Gemini-ranked feeds, OTP auth, Socket.IO real-time, and production-grade observability.',
    role: 'Software Engineer · Full-Stack',
    duration: 'Apr 2025 – Jun 2025',
    status: 'published',
    tags: ['hiring', 'ai', 'real-time', 'marketplace', 'authentication'],
    metrics: [
      { label: 'User Flows', value: '3', tone: 'neutral' },
      { label: 'AI Matching', value: 'Gemini', tone: 'neutral' },
      { label: 'Real-Time', value: 'Socket.IO', tone: 'positive' },
      { label: 'E2E Tests', value: 'Passed', tone: 'positive' },
    ],
    sections: {
      overview:
        'StopSearch is a swipe-based, AI-powered job matchmaking platform for tech and sales roles in India — hiring as simple as a swipe. It has three distinct user flows (Job Seekers, Hiring Managers, Recruitment Consultants) plus an isolated SuperAdmin console for operating the platform. I built the full stack: a Next.js and React frontend and an Express + TypeScript API on MongoDB and Redis, with phone/OTP authentication, Socket.IO real-time updates, a Gemini-powered ranking layer, and the observability and security needed to reach an end-to-end-tested, launch-ready state.',
      context:
        'Hiring for tech and sales in India is high-volume and slow. StopSearch reframes it as a swipe: candidates and managers move through ranked matches, recruitment consultants broker placements, and an AI layer orders each feed. The product spans three independent user journeys, plus an administrative console to run the platform safely.',
      problem:
        'A three-sided marketplace has to rank matches well, keep three independent user flows coherent without leaking into each other, deliver updates in real time, authenticate users simply (phone/OTP) yet securely, and stay observable and safe enough to launch. The feed has to degrade gracefully when AI ranking is unavailable, and every administrative action has to be auditable.',
      constraints:
        'Phone-first OTP auth with session cookies and CSRF protection; three role flows that must stay isolated; an admin surface fully separated from platform users; ranked feeds that must fall back to a safe shape when the AI branch is unavailable; and production observability (health, metrics) plus security (input validation, rate limiting, audit logging) in place before launch.',
      architecture:
        'The frontend is Next.js 14 (App Router) with React 18, TypeScript, Tailwind CSS, TanStack Query, and a Socket.IO client; middleware guards dashboard and role-specific routes through session and role cookies. The backend is Express + TypeScript on MongoDB (Mongoose) with Redis for sessions and caching. Authentication is OTP-based with session cookies and rotating CSRF tokens. Real-time updates flow over Socket.IO, and a Gemini-powered ranking layer orders candidate and manager feeds, with a fallback feed shape when ranking is unavailable. An isolated SuperAdmin console — a separate Admin model, its own Redis session namespace, bcrypt-hashed credentials, and a requireSuperAdmin middleware — manages users, jobs, applications, content, and settings, with Zod-validated inputs, soft deletes, and audit logging on every mutation. Operations are exposed through /health and /api/health (Mongo, Redis, uptime), Prometheus /metrics, and a JSON /api/metrics funnel snapshot, with optional Sentry error tracking.',
      decisions:
        'Phone/OTP with session cookies and CSRF (rather than bearer tokens) matched an India-first, mobile-first audience while keeping web flows secure. Isolating the admin model and session namespace meant the operator console could never be reached through normal user authentication. Designing the feed as a mode contract — ranked or fallback — kept the product resilient when the AI branch was unavailable. Building observability and audit logging in from the start made the platform genuinely launch-ready rather than demo-ready.',
      tradeoffs:
        'Three role flows plus an admin console is more surface than a single funnel, but each flow stays independently coherent. OTP/session auth simplifies the user experience at the cost of server-side session and CSRF machinery (backed by Redis). The interview room currently ships as a UI shell rather than a full browser-RTC implementation — a deliberate scope cut to reach launch. Supporting both ranked and fallback feed shapes adds a contract for the frontend to honor but removes a hard dependency on the AI path.',
      outcomes:
        'StopSearch reached end-to-end-tested, launch-ready status: three independent user flows (Job Seekers, Hiring Managers, Recruitment Consultants), swipe-based discovery with Gemini-ranked feeds and graceful fallback, real-time updates over Socket.IO, and an isolated, fully audited SuperAdmin console. Health and metrics endpoints plus audit logging provide the operational visibility needed to run it in production.',
      lessons:
        'Designing the feed as a mode contract (ranked or fallback) turned the AI layer into an enhancement rather than a single point of failure. Isolating the admin surface from user authentication was worth the extra model and session namespace. And shipping the interview room as a UI shell to hit launch — while being explicit about the limitation — was the right call over delaying for a full RTC build.',
    },
  },
  {
    slug: 'labour-link',
    projectSlug: 'labour-link',
    title: 'Labour Link HRM Case Study',
    summary:
      'Building a multi-role workforce management platform for manpower supply businesses — QR/NFC on-site attendance, real-time cross-site worker allocation, a modular payroll engine, centralized KYC, and a client portal — that replaces paper registers with a real-time, auditable system.',
    role: 'Full-Stack Engineer · Workforce Platform',
    duration: '2025',
    status: 'published',
    tags: ['hrtech', 'workforce', 'attendance', 'payroll', 'multi-site'],
    metrics: [
      { label: 'User Roles', value: '5', tone: 'neutral' },
      { label: 'Attendance', value: 'QR / NFC', tone: 'positive' },
      { label: 'Payroll', value: 'Automated', tone: 'positive' },
      { label: 'Deployment', value: 'Multi-site', tone: 'neutral' },
    ],
    gallery: [
      {
        src: '/projects/Labour%20Link%20Screenshots/imagea.png',
        alt: 'Labour Link HRM workforce management dashboard',
        caption: 'Workforce dashboard — a role-based view of workers, sites, and live deployment status.',
      },
      {
        src: '/projects/Labour%20Link%20Screenshots/imageas.png',
        alt: 'Labour Link HRM QR/NFC attendance capture',
        caption: 'QR/NFC attendance — supervisors scan workers on-site, with hours split across multiple sites per day.',
      },
      {
        src: '/projects/Labour%20Link%20Screenshots/imagem.png',
        alt: 'Labour Link HRM modular payroll engine',
        caption: 'Payroll engine — hourly, 8/12-hour shift, overtime, and deduction rules configured per site or client.',
      },
      {
        src: '/projects/Labour%20Link%20Screenshots/imagez.png',
        alt: 'Labour Link HRM employee KYC and client portal',
        caption: 'KYC & client portal — centralized worker records with a dedicated interface for manpower requests.',
      },
    ],
    sections: {
      overview:
        'Labour Link HRM is a workforce management platform for manpower supply businesses — operations that deploy workers across multiple client sites and companies every day. I built it as a multi-role system that replaces paper registers and morning phone calls with a real-time, auditable record: QR/NFC on-site attendance, dynamic cross-site worker allocation, a modular payroll engine that handles hourly, 8/12-hour shift, and monthly pay with overtime and deductions, centralized KYC, and a client portal for requesting and tracking manpower. Five roles — Super Admin, Supervisor, Admin/Payroll, Client, and Employee — each see only the surface relevant to them.',
      context:
        'A manpower supply business does not employ workers at one place — it places them at many client sites at once, and a single worker can move between two or three sites in a day. The old workflow ran on paper registers and phone calls: who went where, who marked attendance, and by month-end payroll became guesswork. Attendance, allocation, payroll, and statutory compliance all had to be reconciled by hand across locations, which cost time, created disputes, and lost business.',
      problem:
        'The core difficulty is that the workforce is fluid. Manual attendance across multiple locations creates data silos; workers shifting between sites daily have no reliable real-time record; payroll spans several wage models (hourly, 8-hour, 12-hour, overtime, deductions) that differ per client; KYC and compliance data is scattered; and client companies have no structured way to request and track manpower. The system had to make attendance trustworthy at the point of capture, allocation accurate in real time, and payroll a deterministic calculation rather than a monthly reconciliation.',
      constraints:
        'Attendance had to be captured on-site by supervisors in noisy, low-bandwidth field conditions with minimal typing, and it had to resist proxy marking. A worker had to be attributable to more than one site in the same day with hours split correctly for accurate billing. Payroll rules had to be configurable per site or client rather than hard-coded. KYC (Aadhaar, PAN, medical) had to be stored securely for compliance, access had to be gated strictly by role, and the whole system had to stay usable by non-technical users under pressure.',
      architecture:
        'Labour Link is a web application with a React and TypeScript frontend and a Node.js/Express API on MongoDB. Attendance is captured through QR/NFC scanning on mobile devices: a supervisor scans a worker\u2019s code or tag and the event is timestamped and tied to a specific site, so the same worker can be scanned into several sites in a day and the engine splits their hours automatically. A site-mapping model tracks which workers are allocated where in real time. The payroll engine is modular — hourly, shift-based (8/12-hour), and monthly wage rules, plus overtime and deductions, are configured at the site or company level and applied deterministically to the captured attendance. Employee records hold KYC (Aadhaar, PAN, medical) in a centralized store, a role-based access model drives five distinct interfaces (Super Admin, Supervisor, Admin/Payroll, Client, Employee), and a client portal lets companies request and track manpower and pull compliance and operational reports.',
      decisions:
        'The defining decision was to make the point of capture trustworthy: QR/NFC scanning instead of manual entry removed both typing errors and proxy attendance, and tying every scan to a site and timestamp made multi-site hour-splitting a property of the data rather than a manual correction. Modeling wages as configurable rules per site/client — instead of one hard-coded formula — let the same engine serve clients with very different pay structures. Enforcing role-based access across five roles kept each user\u2019s surface simple and compliance data protected. Prioritising a mobile-first, scan-first supervisor flow kept the hardest users (in the field, under pressure) productive with a near-zero learning curve.',
      tradeoffs:
        'A configurable payroll rule engine is more work up front than a fixed formula, but it is the only thing that scales across clients with different wage models. Depending on QR/NFC hardware and worker tags adds an onboarding step, but it is what makes attendance tamper-resistant and fast. Allowing multiple attendance entries per worker per day complicates the data model and hour attribution, yet it is exactly what accurate cross-site billing requires. Storing KYC centrally raises the security bar, so access is gated by role rather than left open.',
      outcomes:
        'Labour Link reached a working, pilot-tested platform that turns a paper-based, phone-driven operation into a real-time digital system. Supervisors mark attendance by scanning on-site, workers are allocated and tracked across multiple sites in real time, payroll is calculated automatically from captured hours against per-client rules, and client companies request and track manpower through their own portal — with KYC and compliance reporting centralized. Early pilot use pointed to sharply less manual tracking and fewer payroll disputes, though those figures are still being validated in wider rollout.',
      lessons:
        'Designing for non-technical users in the field meant the right interaction (a scan) mattered far more than adding features — simplicity at the point of capture was the whole product. Modeling the fluid reality of manpower supply — one worker, many sites, many wage rules — as configurable data rather than fixed logic was what let the system flex to each client. And building attendance to be trustworthy at capture, rather than corrected later, was what made payroll deterministic instead of a monthly argument.',
    },
  },
];
