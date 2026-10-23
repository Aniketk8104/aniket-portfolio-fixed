/**
 * Featured Projects Content
 *
 * Canonical project entries for the portfolio.
 * Each project has a slug, title, summary, role, primary tech tags,
 * and an optional case study link.
 *
 * Source of truth: the "Approved facts" in the local TASKS.md (checked against
 * production databases, CI history and code). Do not add numbers, stacks or
 * links that are not listed there.
 *
 * @module content/projects
 */

import type { Project } from '../types/content';
import type { Placeholder } from '../utils/placeholder';

/**
 * Project entry with placeholder support for unset fields.
 * Summary and role may be placeholders until final copy is authored.
 */
export type ProjectEntry = Omit<Project, 'summary' | 'role'> & {
  summary: string | Placeholder<string>;
  role: string | Placeholder<string>;
};

/** Role label for the Aura Tech Services client platforms. */
const AURA_ROLE = 'Primary engineer · Full-Stack (Aura Tech Services)';

/**
 * Featured Projects in canonical dock order.
 */
export const projects: ProjectEntry[] = [
  {
    slug: 'bvisionr',
    title: 'BVisionr',
    summary:
      'A multi-tenant WhatsApp Cloud API SaaS. Since May 2026 it has handled 62K+ webhook events, 36K+ chat messages and 33K+ LLM calls, with campaigns of up to 2,001 recipients. HMAC-verified, replay-guarded webhooks, a Postgres job queue that keeps working if Redis fails, and an append-only billing ledger.',
    role: AURA_ROLE,
    primaryTech: [
      'Node.js 20',
      'Express 5',
      'PostgreSQL 16',
      'Redis',
      'BullMQ',
      'Socket.IO',
      'React 19',
      'Docker',
      'Oracle Cloud',
    ],
    caseStudySlug: 'bvisionr',
    status: 'published',
    thumbnail: '/projects/Overview.webp',
    liveUrl: 'https://connect.bvisionr.com/',
    tags: ['saas', 'messaging', 'multi-tenant', 'whatsapp', 'postgresql'],
  },
  {
    slug: 'aurastack-crm',
    title: 'AuraStack CRM',
    summary:
      'A multi-tenant CRM for real-estate developers, rebuilt in 3 months (356 commits). For Bhagwati Group it holds 5,400+ leads, 47K+ lead activities, 2,389 site visits and 152 bookings, used by ~30 active staff a month. Server-enforced role scopes (13 roles × 16 modules), blue/green deploys and a nightly restore drill.',
    role: AURA_ROLE,
    primaryTech: [
      'Next.js 14',
      'TypeScript',
      'MongoDB',
      'Redis',
      'BullMQ',
      'SSE',
      'Capacitor',
      'Docker',
      'Oracle Cloud',
    ],
    caseStudySlug: 'aurastack-crm',
    status: 'published',
    liveUrl: 'https://crm.aurastack.in/',
    tags: ['crm', 'real-estate', 'multi-tenant', 'mobile'],
  },
  {
    slug: 'future-fortune-hrms',
    title: 'Future & Fortune HRMS',
    summary:
      'A database-per-tenant HRMS: Express + TypeScript API, Next.js 15 web app and an Expo iOS/Android app and PWA. For Bhagwati Group it covers 82 employees across 25 sites, 1,900+ GPS + selfie check-ins and monthly payroll for ~80 staff (TDS, Form 16, Form 24Q, bank files).',
    role: AURA_ROLE,
    primaryTech: [
      'Express',
      'TypeScript',
      'Next.js 15',
      'Expo',
      'PWA',
      'Jest',
    ],
    caseStudySlug: 'future-fortune-hrms',
    status: 'published',
    liveUrl: 'https://hr.futureandfortune.in/',
    tags: ['hrtech', 'payroll', 'attendance', 'multi-tenant', 'mobile'],
  },
  {
    slug: 'radioque',
    title: 'Radioque',
    summary:
      'A multi-centre teleradiology platform for a US-based client, in acceptance testing with 6 centres onboarded. Cached frame loads went from ~1.4 s to ~3 ms through a CPU-bounded decode queue, request coalescing and a shared Redis frame cache. In-browser MPR in Web Workers and 73 modality templates.',
    role: AURA_ROLE,
    primaryTech: [
      'Next.js 16',
      'Node.js',
      'TypeScript',
      'MongoDB',
      'Redis',
      'Orthanc',
      'Cornerstone3D',
      'AWS EC2',
    ],
    caseStudySlug: 'radioque',
    status: 'published',
    thumbnail: '/projects/Radioque.png',
    tags: ['healthcare', 'teleradiology', 'dicom', 'performance'],
  },
  {
    slug: 'aura-tech-platform',
    title: 'Aura Tech Commerce',
    summary:
      'Laptop rental, sales and buyback at auratechservices.in: 220+ REST endpoints, 27 models and 45+ pages across customer, Admin, Dealer and Partner portals. HMAC-verified Razorpay callbacks and webhooks run in MongoDB transactions with once-only inventory finalization. Moved from AWS EC2 to ARM64 Docker on Oracle Cloud.',
    role: AURA_ROLE,
    primaryTech: [
      'React 18',
      'Node.js 20',
      'Express',
      'MongoDB',
      'Razorpay',
      'Docker',
      'Oracle Cloud',
      'S3 / MinIO',
    ],
    caseStudySlug: 'aura-tech-platform',
    status: 'published',
    thumbnail: '/projects/AuraTech.png',
    liveUrl: 'https://auratechservices.in/',
    tags: ['commerce', 'payments', 'rbac', 'devops'],
  },
  {
    slug: 'bhagwati-group-website',
    title: 'Bhagwati Group Website + CMS',
    summary:
      'A company website with a 27-screen admin and a CMS API (22 models, RBAC, virus-scanned uploads, scheduled publishing). 70 deploys in 4 weeks on a 1 vCPU / 4 GB VPS. A 518-image scroll sequence (30.6 MB) was replaced by one 13.3 MB AV1 stream decoded with WebCodecs. Launching soon.',
    role: AURA_ROLE,
    primaryTech: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Express',
      'MongoDB',
      'Redis',
      'Docker',
      'Traefik',
    ],
    caseStudySlug: 'bhagwati-group-website',
    status: 'published',
    tags: ['cms', 'web', 'performance', 'media'],
  },
  {
    slug: 'stopsearch',
    title: 'StopSearch',
    summary:
      'A 3-role hiring marketplace for candidates, hiring managers and recruitment consultants: 148 REST endpoints, 36 models and 41 pages. Rule-based ranked feeds, Socket.IO chat with a Redis adapter, and Jitsi interview rooms with BullMQ reminders. Moved from AWS EC2/S3 to Oracle Cloud ARM + MinIO over 80 deploys.',
    role: 'Software Engineer · Full-Stack (StopSearch Technologies)',
    primaryTech: [
      'Next.js 14',
      'Express 5',
      'TypeScript',
      'MongoDB',
      'Redis',
      'BullMQ',
      'Socket.IO',
    ],
    caseStudySlug: 'stopsearch',
    status: 'published',
    thumbnail: '/projects/StopSearch.png',
    liveUrl: 'https://stopsearch.co/',
    tags: ['hiring', 'marketplace', 'real-time'],
  },
];
