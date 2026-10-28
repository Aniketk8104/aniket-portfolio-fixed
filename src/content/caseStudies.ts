/**
 * Case Studies Content
 *
 * One case study entry per Featured Project — all authored and published.
 *
 * Source of truth: the "Approved facts" in the local TASKS.md (checked against
 * production databases, CI history and code). Every number, stack item and
 * claim below comes from that list; do not add any that are not there.
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

/** Role label for the Aura Tech Services client platforms. */
const AURA_ROLE = 'Primary engineer · Full-Stack (Aura Tech Services)';

/**
 * Case studies for each Featured Project.
 */
export const caseStudies: CaseStudyEntry[] = [
  {
    slug: 'bvisionr',
    projectSlug: 'bvisionr',
    title: 'BVisionr Case Study',
    summary:
      'A multi-tenant WhatsApp Cloud API SaaS on Node.js 20, Express 5 and PostgreSQL 16. Since May 2026 it has handled 62K+ webhook events, 36K+ chat messages and 33K+ LLM calls, with HMAC-verified webhooks, a job queue that survives a Redis failure, and an append-only billing ledger.',
    role: AURA_ROLE,
    duration: 'Oct 2025 – present',
    status: 'published',
    tags: ['saas', 'messaging', 'multi-tenant', 'whatsapp', 'postgresql'],
    diagramId: 'multi-tenant-saas',
    metrics: [
      { label: 'Webhook events (since May 2026)', value: '62K+', tone: 'positive' },
      { label: 'Chat messages', value: '36K+', tone: 'positive' },
      { label: 'LLM calls', value: '33K+', tone: 'positive' },
      { label: 'Largest campaign', value: '2,001', unit: ' recipients', tone: 'neutral' },
    ],
    gallery: [
      {
        src: '/projects/bvisionr%20screenshots/Chat%20Inbox.svg',
        alt: 'BVisionr team inbox showing WhatsApp conversations',
        caption: 'Team inbox: shared WhatsApp conversations, updated over Socket.IO.',
      },
      {
        src: '/projects/bvisionr%20screenshots/Brodcast%20Campaigns.svg',
        alt: 'BVisionr broadcast campaign dashboard',
        caption: 'Broadcast campaigns: queued sends throttled between 1 and 500 messages a second.',
      },
      {
        src: '/projects/bvisionr%20screenshots/AutomationFlows.svg',
        alt: 'BVisionr automation flows screen',
        caption: 'Automation flows.',
      },
      {
        src: '/projects/bvisionr%20screenshots/NoCodeFlowBuilder.svg',
        alt: 'BVisionr visual flow builder canvas',
        caption: 'Flow builder canvas.',
      },
    ],
    sections: {
      overview:
        'BVisionr (connect.bvisionr.com) is a multi-tenant SaaS on the WhatsApp Cloud API: tenants run campaigns, a shared team inbox and LLM-assisted conversations from one backend. I have been the primary engineer since October 2025. Since May 2026 the platform has handled 62K+ webhook events, 36K+ chat messages and 33K+ LLM calls, with campaigns of up to 2,001 recipients.',
      context:
        'The WhatsApp Cloud API is low level: it sends signed webhooks, enforces send rates and reports delivery asynchronously. BVisionr turns that into a product for several tenants at once, so every message, job, replay and charge has to stay inside the tenant it belongs to.',
      problem:
        'Webhooks can be forged or replayed, campaigns have to be sent at a rate the API accepts, failed jobs need a safe way back in, and billing has to be correct after the fact. The backend also has to keep sending when one of its own dependencies, such as Redis, goes down.',
      constraints:
        'One multi-tenant PostgreSQL database, a small team, and deployment with Docker on Oracle Cloud. Campaign throughput had to be configurable per send, from 1 to 500 messages a second, and LLM calls had to keep working when a provider rate-limits or fails.',
      architecture:
        'Node.js 20 and Express 5 on PostgreSQL 16, with Redis, BullMQ and Socket.IO, and a React 19 front end; everything runs in Docker on Oracle Cloud. Incoming webhooks are HMAC-verified and replay-guarded before they are processed. Jobs run on BullMQ, with a PostgreSQL SKIP LOCKED queue that keeps working if Redis fails. Failed jobs land in a tenant-scoped dead-letter store that can be replayed. The schema has 148 tables across 59 migrations, and billing is an append-only ledger enforced by database triggers. An LLM router spreads calls across Gemini, Groq, DeepSeek and OpenAI-compatible providers with cooldowns, caching and failover.',
      decisions:
        'Verify and replay-guard every webhook before doing any work, so a forged or repeated event never reaches business logic. Keep a Postgres fallback queue so Redis is an accelerator, not a single point of failure. Scope dead-letter replay to the tenant, so recovering one tenant cannot touch another. Enforce the billing ledger as append-only in the database rather than in application code. Route LLM calls through one layer with cooldowns and failover, so a provider outage degrades service instead of breaking it.',
      tradeoffs:
        'Running two queue paths (BullMQ and Postgres SKIP LOCKED) means more code to keep consistent, in exchange for sending through a Redis outage. Trigger-enforced billing makes corrections explicit entries rather than edits, which is slower to work with but keeps the history trustworthy. Supporting several LLM providers adds configuration, but no single provider can stop the product.',
      outcomes:
        'Since May 2026: 62K+ webhook events, 36K+ chat messages and 33K+ LLM calls processed, and campaigns of up to 2,001 recipients sent with throttling between 1 and 500 messages a second. The schema has grown to 148 tables through 59 migrations.',
      lessons:
        'Put the guarantees where they cannot be skipped: signature checks at the edge, tenant scope on replay, and billing rules in the database. Planning for a dependency to fail, whether Redis or an LLM provider, is cheaper at design time than during an outage.',
    },
  },
  {
    slug: 'aurastack-crm',
    projectSlug: 'aurastack-crm',
    title: 'AuraStack CRM Case Study',
    summary:
      'A multi-tenant CRM for real-estate developers, rebuilt in 3 months (356 commits) on Next.js 14, TypeScript, MongoDB and Redis. For Bhagwati Group it holds 5,400+ leads, 47K+ lead activities, 2,389 site visits and 152 bookings, with server-enforced role scopes and blue/green deploys.',
    role: AURA_ROLE,
    duration: 'Jul 2026 – present',
    status: 'published',
    tags: ['crm', 'real-estate', 'multi-tenant', 'mobile'],
    metrics: [
      { label: 'Leads (Bhagwati Group)', value: '5,400+', tone: 'positive' },
      { label: 'Lead activities', value: '47K+', tone: 'positive' },
      { label: 'Site visits', value: '2,389', tone: 'positive' },
      { label: 'Bookings', value: '152', tone: 'positive' },
    ],
    gallery: [
      {
        src: '/projects/aurastack-crm.webp',
        alt: 'AuraStack CRM dashboard with leads, bookings, site visits and team overview',
        caption: 'Dashboard: lead, booking and site-visit totals with a team overview and performance trend.',
      },
    ],
    sections: {
      overview:
        'AuraStack CRM (crm.aurastack.in) is a multi-tenant CRM for real-estate developers, with web, Android and iOS apps. I rebuilt it in 3 months (356 commits): 336 API handlers, 48 models and 62 pages. Bhagwati Group uses it for 5,400+ leads, 47K+ lead activities, 2,389 site visits and 152 bookings, with about 30 active staff a month.',
      context:
        'A real-estate sales team works a lead from first enquiry through site visits to a booking. Several developers share the same system, and each has many roles with different access.',
      problem:
        'Data from one developer must never reach another, each of many roles should only see and change what it is allowed to, a removed user must lose access straight away, and the system has to be deployable and recoverable without downtime or guesswork.',
      constraints:
        'A 3-month rebuild while the client kept working, mobile apps for field staff, deployment with Docker on Oracle Cloud, and an AI assistant that must never change data on its own.',
      architecture:
        'Next.js 14 and TypeScript on MongoDB, with Redis and BullMQ for background work and Server-Sent Events for live updates. Capacitor wraps the app for Android and iOS. A foreign-key tenant guard keeps every record tied to its tenant. Role scopes (13 roles × 16 modules) are enforced on the server. Sessions are revoked on the next request. The AI assistant can only propose actions for a person to confirm. Releases go out as blue/green deploys in Docker on Oracle Cloud, and a nightly drill restores the backup to prove it works.',
      decisions:
        'Enforce tenancy and role scopes on the server, never only in the UI. Check the session on every request so revocation takes effect immediately. Keep the AI assistant to proposals so a person stays accountable for every change. Use blue/green deploys and a nightly restore drill so both releases and backups are tested, not assumed.',
      tradeoffs:
        'Server-side checks on every request add work to each handler, but they are the only check a client cannot bypass. A propose-only assistant is less automatic, in exchange for no unreviewed writes. Blue/green deploys need two environments on the same host.',
      outcomes:
        'Rebuilt in 3 months with 356 commits: 336 API handlers, 48 models and 62 pages. In use at Bhagwati Group with 5,400+ leads, 47K+ lead activities, 2,389 site visits and 152 bookings recorded, and about 30 active staff a month.',
      lessons:
        'Access rules belong in one server-side place that every handler goes through. A backup only counts once it has been restored, so the restore drill runs every night.',
    },
  },
  {
    slug: 'future-fortune-hrms',
    projectSlug: 'future-fortune-hrms',
    title: 'Future & Fortune HRMS Case Study',
    summary:
      'A database-per-tenant HRMS with an Express + TypeScript API, a Next.js 15 web app and an Expo iOS/Android app and PWA. For Bhagwati Group it covers 82 employees across 25 sites, 1,900+ GPS + selfie check-ins and monthly payroll for ~80 staff, backed by 1,309 Jest tests.',
    role: AURA_ROLE,
    duration: 'Aug 2026 – present',
    status: 'published',
    tags: ['hrtech', 'payroll', 'attendance', 'multi-tenant', 'mobile'],
    metrics: [
      { label: 'Employees (Bhagwati Group)', value: '82', tone: 'positive' },
      { label: 'Sites', value: '25', tone: 'neutral' },
      { label: 'GPS + selfie check-ins', value: '1,900+', tone: 'positive' },
      { label: 'Jest tests', value: '1,309', tone: 'positive' },
    ],
    gallery: [
      {
        src: '/projects/future-fortune-hrms.webp',
        alt: 'Future & Fortune HRMS dashboard with pending actions, attendance analytics and recent activity',
        caption: 'Dashboard: pending leave and document actions, attendance analytics and recent check-ins.',
      },
    ],
    sections: {
      overview:
        'Future & Fortune HRMS (hr.futureandfortune.in) covers attendance, payroll and HR for companies with staff spread across many sites. It has an Express + TypeScript API (33 modules, 7 roles, 38 permissions), a Next.js 15 web app (65 pages) and an Expo iOS/Android app and PWA (42 screens). Bhagwati Group runs 82 employees across 25 sites on it.',
      context:
        'Staff check in at sites rather than at one office, and payroll in India has to produce TDS, Form 16, Form 24Q and bank files every month. Each client company is a separate tenant.',
      problem:
        'Attendance has to be trustworthy when people check in from their own phones, payroll has to be right for about 80 staff every month, and one tenant must never see another tenant\u2019s employees or pay.',
      constraints:
        'Check-ins come from employee phones, where GPS can be faked. The same API serves the web app, the native apps and the PWA. Payroll output has to match statutory formats.',
      architecture:
        'Each tenant gets its own database behind an Express + TypeScript API with 33 modules, 7 roles and 38 permissions. Staff use a Next.js 15 web app (65 pages) or an Expo app for iOS and Android with a PWA (42 screens). Check-ins capture GPS and a selfie; a trust score flags likely fake GPS, a server-side face check verifies the selfie, and per-employee rate limits stop repeated attempts. Payroll runs monthly and produces TDS, Form 16, Form 24Q and bank files.',
      decisions:
        'Use a database per tenant so isolation does not depend on every query filtering correctly. Verify check-ins on the server (GPS trust score, face check, rate limits) because the phone cannot be trusted. Invest in tests: 1,309 Jest tests, with CI cut from about 24 to about 8 minutes so they run on every change.',
      tradeoffs:
        'A database per tenant makes migrations and backups per-tenant work, in exchange for strong isolation. Server-side face checks add latency to each check-in, but a check made on the phone would be easy to bypass.',
      outcomes:
        'In use at Bhagwati Group: 82 employees across 25 sites, 1,900+ GPS + selfie check-ins, and monthly payroll for about 80 staff including TDS, Form 16, Form 24Q and bank files. 1,309 Jest tests run in CI, which now takes about 8 minutes instead of about 24.',
      lessons:
        'Anything a phone reports, such as location or a photo, is a claim to verify on the server. Making the test suite fast is what keeps it running on every change.',
    },
  },
  {
    slug: 'radioque',
    projectSlug: 'radioque',
    title: 'Radioque Case Study',
    summary:
      'A multi-centre teleradiology platform for a US-based client, in acceptance testing with 6 centres onboarded. Cached frame loads dropped from ~1.4 s to ~3 ms with a CPU-bounded decode queue, request coalescing and a shared Redis frame cache, and MPR runs in the browser in Web Workers.',
    role: AURA_ROLE,
    duration: 'Jan 2026 – present',
    status: 'published',
    tags: ['healthcare', 'teleradiology', 'dicom', 'performance'],
    diagramId: 'healthcare-workflow',
    metrics: [
      { label: 'Cached frame load', value: '~1.4 s → ~3 ms', tone: 'positive' },
      { label: 'Centres onboarded', value: '6', tone: 'neutral' },
      { label: 'Modality templates', value: '73', tone: 'neutral' },
      { label: 'Jest tests', value: '170', tone: 'positive' },
    ],
    gallery: [
      {
        src: '/projects/Radique%20Screenshots/image.png',
        alt: 'Radioque case worklist',
        caption: 'Case worklist.',
      },
      {
        src: '/projects/Radique%20Screenshots/image1.png',
        alt: 'Radioque DICOM viewer',
        caption: 'DICOM viewer built on Cornerstone3D.',
      },
      {
        src: '/projects/Radique%20Screenshots/image3.png',
        alt: 'Radioque report editor next to the imaging viewer',
        caption: 'Report editor next to the viewer.',
      },
    ],
    sections: {
      overview:
        'Radioque is a multi-centre teleradiology platform for a US-based client. It is in acceptance testing with 6 centres onboarded, so there is no public link. I built the imaging pipeline, the viewer integration and the reporting workflow on Next.js 16, Node.js, TypeScript, MongoDB, Redis and Orthanc, running on AWS EC2.',
      context:
        'Radiologists read studies from several centres in one place. Studies are DICOM, stored in Orthanc and shown in a Cornerstone3D viewer, and every centre must only see its own cases and history.',
      problem:
        'Loading image frames was slow (about 1.4 s for a cached frame), two people could edit the same report at once, and each centre needed its own audit trail.',
      constraints:
        'Decoding DICOM is CPU-heavy, so unbounded parallel decodes slow everything down. Reformatting (MPR) has to run in the browser without freezing the page. Reports have to support many modalities.',
      architecture:
        'Orthanc stores the DICOM studies. Frames are decoded through a CPU-bounded queue, identical requests are coalesced, and decoded frames go into a shared Redis cache, which brought cached frame loads from about 1.4 s to about 3 ms. The Cornerstone3D viewer runs MPR in Web Workers. Reports move through a state machine, with TTL edit locks and optimistic versioning to stop conflicting edits, and 73 modality templates. Audit logs are scoped to each centre. The app is Next.js 16 and Node.js with TypeScript on MongoDB, deployed on AWS EC2.',
      decisions:
        'Bound decode concurrency to the CPU instead of decoding everything at once, and coalesce duplicate requests so one decode serves every viewer that needs the frame. Share the frame cache in Redis so all servers benefit. Use TTL locks plus optimistic versioning so an abandoned lock expires and a stale save is rejected.',
      tradeoffs:
        'A bounded queue means a burst of requests waits its turn rather than all starting at once; the shared cache makes repeat loads near-instant in return. Locks with a TTL can expire during a long pause, so versioning is the backstop.',
      outcomes:
        'Cached frame loads went from about 1.4 s to about 3 ms. The platform is in acceptance testing with 6 centres onboarded, 73 modality templates and 170 Jest tests.',
      lessons:
        'Most of the speed came from not doing work twice: coalescing requests and sharing one cache. Concurrency on shared documents needs both a lock and a version check.',
    },
  },
  {
    slug: 'aura-tech-platform',
    projectSlug: 'aura-tech-platform',
    title: 'Aura Tech Commerce Case Study',
    summary:
      'Laptop rental, sales and buyback at auratechservices.in: 220+ REST endpoints, 27 models and 45+ pages across customer, Admin, Dealer and Partner portals, with HMAC-verified Razorpay webhooks processed in MongoDB transactions and a move from AWS EC2 to ARM64 Docker on Oracle Cloud.',
    role: AURA_ROLE,
    duration: 'Jan 2025 – present',
    status: 'published',
    tags: ['commerce', 'payments', 'rbac', 'devops'],
    diagramId: 'deployment-infrastructure',
    metrics: [
      { label: 'REST endpoints', value: '220+', tone: 'neutral' },
      { label: 'Data models', value: '27', tone: 'neutral' },
      { label: 'Pages', value: '45+', tone: 'neutral' },
      { label: 'Portals', value: '4', tone: 'neutral' },
    ],
    gallery: [
      {
        src: '/projects/Aura%20Tech%20Screenshots/AuraTech.png',
        alt: 'Aura Tech Services storefront home page',
        caption: 'Storefront at auratechservices.in.',
      },
      {
        src: '/projects/Aura%20Tech%20Screenshots/image.png',
        alt: 'Aura Tech Services product and checkout experience',
        caption: 'Buy and rent flow through Razorpay checkout.',
      },
      {
        src: '/projects/Aura%20Tech%20Screenshots/image1.png',
        alt: 'Aura Tech Services admin dashboard',
        caption: 'Admin portal.',
      },
    ],
    sections: {
      overview:
        'Aura Tech commerce runs auratechservices.in: laptop rental, sales and buyback. It has 220+ REST endpoints, 27 models and 45+ pages across four portals (customer, Admin, Dealer and Partner), built on React 18, Node.js 20, Express and MongoDB with Razorpay payments.',
      context:
        'Customers rent, buy or sell back laptops; dealers handle orders in their area and pay a subscription; partners send quotes. Each group has its own portal.',
      problem:
        'Payments must be verified and must not double-count stock, every order needs a GST invoice, orders have to reach the right dealer, and the hosting needed to move off AWS EC2.',
      constraints:
        'Razorpay callbacks and webhooks can arrive more than once or out of order. Inventory has to be finalized exactly once per payment. Files live in S3-compatible storage.',
      architecture:
        'React 18 front end and a Node.js 20 + Express API on MongoDB. Razorpay callbacks and webhooks are HMAC-verified and processed inside MongoDB transactions, with once-only inventory finalization. The API generates GST invoice PDFs, routes orders to dealers by area, manages dealer subscriptions and runs partner quotes through a state machine. Files are stored in S3/MinIO. The app moved from AWS EC2 with PM2 to ARM64 Docker containers on Oracle Cloud.',
      decisions:
        'Treat every payment event as untrusted until its HMAC checks out, and finalize stock inside the same transaction as the payment so a repeated webhook cannot sell an item twice. Model partner quotes as a state machine so a quote can only move through valid steps. Containerize for ARM64 so the move to Oracle Cloud was a redeploy rather than a rewrite.',
      tradeoffs:
        'Transactions make payment handling slower to write and test, in exchange for consistent stock. Moving to ARM64 meant checking that every dependency builds for that architecture.',
      outcomes:
        'Live at auratechservices.in with 220+ REST endpoints, 27 models and 45+ pages across four portals, GST invoice PDFs, area-based dealer routing and dealer subscriptions, now running in ARM64 Docker on Oracle Cloud.',
      lessons:
        'Payment webhooks will repeat, so the code that acts on them has to be safe to run twice. Putting the stock update in the same transaction as the payment was the simplest way to get there.',
    },
  },
  {
    slug: 'bhagwati-group-website',
    projectSlug: 'bhagwati-group-website',
    title: 'Bhagwati Group Website + CMS Case Study',
    summary:
      'A company website and CMS on Next.js 16, React 19, Express and MongoDB, launching soon. A 27-screen admin, a CMS API with 22 models, 70 deploys in 4 weeks on a 1 vCPU / 4 GB VPS, and a 30.6 MB image sequence replaced by one 13.3 MB AV1 stream decoded with WebCodecs.',
    role: AURA_ROLE,
    duration: 'Jun 2026 – present',
    status: 'published',
    tags: ['cms', 'web', 'performance', 'media'],
    metrics: [
      { label: 'Scroll sequence size', value: '30.6 MB → 13.3 MB', tone: 'positive' },
      { label: 'Deploys in 4 weeks', value: '70', tone: 'neutral' },
      { label: 'Admin screens', value: '27', tone: 'neutral' },
      { label: 'CMS models', value: '22', tone: 'neutral' },
    ],
    gallery: [
      {
        src: '/projects/bhagwati-group-website.webp',
        alt: 'Bhagwati Group website home page with an aircraft-window scroll sequence',
        caption: 'Home page: the scroll sequence that now plays from one AV1 stream decoded with WebCodecs.',
      },
    ],
    sections: {
      overview:
        'A new website and CMS for Bhagwati Group, launching soon. It has a 27-screen admin and a CMS API with 22 models, RBAC, virus-scanned uploads and scheduled publishing, built on Next.js 16, React 19, TypeScript, Express, MongoDB and Redis, deployed with Docker and Traefik.',
      context:
        'The site has a scroll-driven animation and is managed through its own admin, so the publishing flow matters as much as the public pages.',
      problem:
        'The scroll animation was a sequence of 518 images totalling 30.6 MB, too heavy for a first visit. Content also had to be uploaded and scheduled safely.',
      constraints:
        'Everything runs on a single 1 vCPU / 4 GB VPS, and the visual quality of the animation had to stay the same.',
      architecture:
        'Next.js 16 and React 19 for the site and the 27-screen admin; an Express CMS API on MongoDB and Redis with 22 models, RBAC, virus-scanned uploads and scheduled publishing. Docker and Traefik run it on the VPS. The 518-image scroll sequence was replaced by one AV1 video stream decoded frame by frame in the browser with WebCodecs.',
      decisions:
        'Encode the image sequence as a single AV1 stream and decode it with WebCodecs, which cut it from 30.6 MB to 13.3 MB at comparable measured quality (VMAF 97.4 vs 96.4). Scan every upload for viruses before it is stored.',
      tradeoffs:
        'WebCodecs decoding adds client-side code and depends on browser support, in exchange for less than half the download.',
      outcomes:
        'The scroll sequence went from 30.6 MB to 13.3 MB (VMAF 97.4 vs 96.4). The project shipped 70 deploys in 4 weeks on a 1 vCPU / 4 GB VPS and is launching soon.',
      lessons:
        'Measure quality as well as size: the VMAF comparison is what showed the video was not a downgrade.',
    },
  },
  {
    slug: 'stopsearch',
    projectSlug: 'stopsearch',
    title: 'StopSearch Case Study',
    summary:
      'A 3-role hiring marketplace for candidates, hiring managers and recruitment consultants on Next.js 14, Express 5, TypeScript, MongoDB and Redis: 148 REST endpoints, 36 models and 41 pages, with rule-based ranked feeds, Socket.IO chat and Jitsi interview rooms.',
    role: 'Software Engineer · Full-Stack (StopSearch Technologies)',
    duration: 'Internship and follow-on work',
    status: 'published',
    tags: ['hiring', 'marketplace', 'real-time'],
    metrics: [
      { label: 'REST endpoints', value: '148', tone: 'neutral' },
      { label: 'Data models', value: '36', tone: 'neutral' },
      { label: 'Pages', value: '41', tone: 'neutral' },
      { label: 'Deploys', value: '80', tone: 'neutral' },
    ],
    sections: {
      overview:
        'StopSearch is a hiring marketplace with three roles: candidates, hiring managers and recruitment consultants. I worked across the stack on Next.js 14, Express 5, TypeScript, MongoDB, Redis, BullMQ and Socket.IO. It has 148 REST endpoints, 36 models and 41 pages.',
      context:
        'Each role has its own journey: candidates look for roles, hiring managers look for candidates, and consultants work between them. All three need to talk to each other and set up interviews.',
      problem:
        'Each role needs a ranked feed of relevant matches, real-time chat that works across several server instances, and interview scheduling with reminders.',
      constraints:
        'Chat had to work with more than one Socket.IO server, interview reminders had to be sent on time, and the hosting moved from AWS to Oracle Cloud during the work.',
      architecture:
        'A Next.js 14 front end and an Express 5 + TypeScript API on MongoDB and Redis. Feeds are ranked by rules. Socket.IO chat uses a Redis adapter so messages reach users on any instance. Interviews run in Jitsi rooms, with reminders scheduled as BullMQ jobs. Hosting moved from AWS EC2 and S3 to Oracle Cloud ARM with MinIO.',
      decisions:
        'Use explicit ranking rules so results are predictable and explainable. Use the Redis adapter for Socket.IO so chat scales past one server. Schedule reminders in BullMQ so they survive restarts.',
      tradeoffs:
        'Rule-based ranking is simpler to reason about than a learned model but needs tuning by hand as the rules grow.',
      outcomes:
        '148 REST endpoints, 36 models and 41 pages across the three roles, with ranked feeds, real-time chat and Jitsi interview rooms, shipped over 80 deploys and moved to Oracle Cloud ARM + MinIO.',
      lessons:
        'Shared state such as chat presence and reminders belongs in Redis and the job queue, not in one server\u2019s memory.',
    },
  },
];
