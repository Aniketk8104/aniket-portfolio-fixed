/**
 * Featured Projects Content
 *
 * Canonical project entries for the portfolio.
 * Each project has a slug, title, summary, role, primary tech tags,
 * and an optional case study link.
 *
 * Source of truth: Aniket Kushwaha's résumé. All summaries, roles, tech
 * stacks, and metrics are drawn directly from documented project work — no
 * fabricated projects, stacks, or numbers.
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

/**
 * Featured Projects in canonical dock order:
 * BVISIONR · Radique · Aura Tech Platform · StopSearch
 */
export const projects: ProjectEntry[] = [
  {
    slug: 'bvisionr',
    title: 'BVISIONR',
    summary:
      'A multi-tenant AI WhatsApp infrastructure platform for businesses and agencies to run, automate, and scale customer communication. I built it from scratch — a BullMQ queue-based campaign pipeline, real-time Socket.IO messaging, isolated tenant environments, an event-driven RBAC team inbox, AI campaign generation, and a no-code automation builder.',
    role: 'Full-Stack Engineer · Backend & Platform',
    primaryTech: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'Socket.IO',
      'BullMQ',
      'Meta Cloud API',
      'OCI',
    ],
    caseStudySlug: 'bvisionr',
    status: 'published',
    thumbnail: '/projects/Overview.webp',
    liveUrl: 'https://connect.bvisionr.com/',
    tags: ['saas', 'ai', 'messaging', 'multi-tenant', 'whatsapp', 'real-time'],
  },
  {
    slug: 'radique',
    title: 'Radique',
    summary:
      'A radiology workflow SaaS that integrates PACS-style DICOM imaging through Orthanc and coordinates case assignment, report generation, and multi-centre audit tracking. I built the workflow engine and the audit-logged, state-managed backend that keeps every diagnostic case traceable across distributed radiology operations.',
    role: 'Full-Stack Engineer · Workflow & Backend',
    primaryTech: ['Next.js', 'Node.js', 'MongoDB', 'Orthanc', 'Docker'],
    caseStudySlug: 'radique',
    status: 'published',
    thumbnail: '/projects/Radique%20Screenshots/3d9fd8ec98402b9f9568f52c482ee965-ezgif-com-optimize-copy.gif',
    tags: ['healthcare', 'radiology', 'workflow', 'dicom', 'pacs'],
  },
  {
    slug: 'aura-tech-platform',
    title: 'Aura Tech Platform',
    summary:
      'A live laptop rental and sales platform (auratechservices.in) with a React frontend and a hardened Node.js/Express API on MongoDB. I built the buy/rent catalog, signature-verified Razorpay checkout, JWT + Google OAuth with RBAC dashboards, AWS S3 image storage, and containerized Docker/Kubernetes deployment with health and metrics endpoints.',
    role: 'Full-Stack Engineer · Platform & Payments',
    primaryTech: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'Razorpay',
      'AWS S3',
      'Docker',
      'Kubernetes',
    ],
    caseStudySlug: 'aura-tech-platform',
    status: 'published',
    thumbnail: '/projects/AuraTech.png',
    liveUrl: 'https://auratechservices.in/',
    tags: ['commerce', 'payments', 'inventory', 'rbac', 'devops'],
  },
  {
    slug: 'stopsearch',
    title: 'StopSearch',
    summary:
      'A swipe-based, AI-powered job matchmaking platform for tech and sales hiring in India. Three independent user flows (Job Seekers, Hiring Managers, Recruitment Consultants) plus an isolated SuperAdmin console — with Gemini-ranked feeds, OTP auth, Socket.IO real-time, and production-grade observability and security.',
    role: 'Software Engineer · Full-Stack',
    primaryTech: [
      'Next.js',
      'React',
      'TypeScript',
      'Express.js',
      'MongoDB',
      'Redis',
      'Socket.IO',
      'Gemini AI',
    ],
    caseStudySlug: 'stopsearch',
    status: 'published',
    thumbnail: '/projects/StopSearch.png',
    tags: ['hiring', 'ai', 'real-time', 'marketplace', 'authentication'],
  },
  {
    slug: 'labour-link',
    title: 'Labour Link HRM',
    summary:
      'A multi-role workforce management platform for manpower supply businesses that deploy workers across many client sites daily. I built QR/NFC on-site attendance, real-time cross-site worker allocation, a modular payroll engine (hourly, 8/12-hour shifts, overtime, deductions), centralized KYC, and a client portal — replacing paper registers with a real-time, auditable system.',
    role: 'Full-Stack Engineer · Workforce Platform',
    primaryTech: [
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'MongoDB',
      'QR / NFC',
      'Real-time',
    ],
    caseStudySlug: 'labour-link',
    status: 'published',
    thumbnail: '/projects/Labour%20Link%20Screenshots/imagea.png',
    tags: ['hrtech', 'workforce', 'attendance', 'payroll', 'multi-site'],
  },
];
