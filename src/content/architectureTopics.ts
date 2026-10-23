/**
 * Architecture Topics Content
 *
 * The six canonical architecture topics for the portfolio.
 * Each topic links to a composed diagram and optional related case studies.
 *
 * Source of truth: the "Approved facts" in the local TASKS.md.
 *
 * @module content/architectureTopics
 */

import type { ArchitectureTopic, RichText } from '../types/content';
import type { Placeholder } from '../utils/placeholder';

/**
 * Architecture topic entry with placeholder support for unset prose.
 * (All topics are currently authored; the Placeholder union is retained so
 * future draft topics can be added without a type change.)
 */
export type ArchitectureTopicEntry = Omit<ArchitectureTopic, 'summary' | 'prose'> & {
  summary: string | Placeholder<string>;
  prose?: RichText | Placeholder<RichText>;
};

/**
 * The six Architecture Topics:
 * Distributed Messaging, AI Routing, Multi-Tenant SaaS,
 * WhatsApp Infrastructure, Healthcare Workflow, Deployment Infrastructure
 */
export const architectureTopics: ArchitectureTopicEntry[] = [
  {
    slug: 'distributed-messaging',
    title: 'Distributed Messaging',
    summary:
      'How BVisionr queues campaign sends and inbound events on BullMQ, keeps a PostgreSQL SKIP LOCKED queue for when Redis fails, and replays dead letters per tenant.',
    diagramId: 'distributed-messaging',
    prose:
      'BVisionr does not call the WhatsApp Cloud API from request handlers. Sends and inbound events become jobs on BullMQ (Redis), and workers drain them with throttling that can be set anywhere from 1 to 500 messages a second; the largest campaign so far had 2,001 recipients. If Redis fails, a PostgreSQL queue using SKIP LOCKED keeps jobs moving, so Redis speeds things up but is not a single point of failure. Jobs that keep failing go to a dead-letter store scoped to the tenant, and can be replayed for that tenant only. Since May 2026 the pipeline has handled 62K+ webhook events and 36K+ chat messages.',
    relatedCaseStudySlugs: ['bvisionr'],
    status: 'published',
    tags: ['messaging', 'distributed-systems', 'bullmq', 'redis', 'postgresql'],
  },
  {
    slug: 'ai-routing',
    title: 'LLM Routing',
    summary:
      'The LLM router behind BVisionr: one layer that spreads calls across Gemini, Groq, DeepSeek and OpenAI-compatible providers with cooldowns, caching and failover.',
    diagramId: 'ai-routing',
    prose:
      'BVisionr has made 33K+ LLM calls since May 2026, and no single provider is reliable enough to depend on alone. All calls go through one router that supports Gemini, Groq, DeepSeek and OpenAI-compatible APIs. When a provider errors or rate-limits, it is put on a cooldown and the request fails over to the next provider. Repeated requests are served from a cache. Keeping this in one layer means a provider outage slows the product down instead of breaking it, and adding a provider is a configuration change.',
    relatedCaseStudySlugs: ['bvisionr'],
    status: 'published',
    tags: ['ai', 'routing', 'llm', 'failover'],
  },
  {
    slug: 'multi-tenant-saas',
    title: 'Multi-Tenant SaaS',
    summary:
      'Three ways of keeping tenants apart: tenant-scoped data and an append-only billing ledger in BVisionr, a foreign-key tenant guard in AuraStack CRM, and a database per tenant in the Future & Fortune HRMS.',
    diagramId: 'multi-tenant-saas',
    prose:
      'BVisionr runs every tenant on one PostgreSQL 16 database (148 tables, 59 migrations). Jobs, dead-letter replay and data access are all scoped to the tenant, and billing is an append-only ledger enforced by database triggers, so a charge can be corrected only by a new entry. AuraStack CRM uses a foreign-key tenant guard, so a record cannot exist without its tenant, plus server-enforced role scopes across 13 roles and 16 modules. The Future & Fortune HRMS gives each tenant its own database, which suits payroll data, at the cost of running migrations and backups per tenant. The common rule is that isolation is enforced by the data layer or the server, never only by the UI.',
    relatedCaseStudySlugs: ['bvisionr', 'aurastack-crm', 'future-fortune-hrms'],
    status: 'published',
    tags: ['saas', 'multi-tenant', 'architecture', 'isolation'],
  },
  {
    slug: 'whatsapp-infrastructure',
    title: 'WhatsApp Infrastructure',
    summary:
      'Operating on the WhatsApp Cloud API: HMAC-verified, replay-guarded webhooks, throttled sends and asynchronous delivery state.',
    diagramId: 'whatsapp-infrastructure',
    prose:
      'The WhatsApp Cloud API reports everything through webhooks, and a webhook can be forged or delivered more than once. BVisionr verifies each webhook\u2019s HMAC signature and rejects replays before any processing, then hands the event to the same queue system that handles outbound sends. Outbound campaigns are throttled per send between 1 and 500 messages a second. Since May 2026 the platform has processed 62K+ webhook events.',
    relatedCaseStudySlugs: ['bvisionr'],
    status: 'published',
    tags: ['whatsapp', 'cloud-api', 'messaging', 'webhooks'],
  },
  {
    slug: 'healthcare-workflow',
    title: 'Healthcare Workflow',
    summary:
      'How Radioque serves DICOM frames from Orthanc fast enough to read comfortably, and keeps reports and audit logs consistent across centres.',
    diagramId: 'healthcare-workflow',
    prose:
      'Radioque stores studies in Orthanc and shows them in a Cornerstone3D viewer. Decoding DICOM is CPU-heavy, so frames are decoded through a queue bounded by CPU count, identical requests are coalesced into one decode, and decoded frames are kept in a shared Redis cache; cached frame loads went from about 1.4 s to about 3 ms. Multiplanar reformatting runs in the browser in Web Workers. Reports move through a state machine with TTL edit locks and optimistic versioning, and use 73 modality templates. Audit logs are scoped to each centre. The platform is in acceptance testing with 6 centres onboarded.',
    relatedCaseStudySlugs: ['radioque'],
    status: 'published',
    tags: ['healthcare', 'workflow', 'dicom', 'performance', 'pacs'],
  },
  {
    slug: 'deployment-infrastructure',
    title: 'Deployment Infrastructure',
    summary:
      'How the Aura Tech commerce platform moved from AWS EC2 to ARM64 Docker on Oracle Cloud, and how the newer platforms deploy with blue/green releases and restore drills.',
    diagramId: 'deployment-infrastructure',
    prose:
      'Aura Tech commerce (auratechservices.in) used to run on AWS EC2 with PM2. It now runs as ARM64 Docker containers on Oracle Cloud, with files in S3/MinIO. StopSearch made a similar move from AWS EC2 and S3 to Oracle Cloud ARM with MinIO over 80 deploys. AuraStack CRM ships with blue/green deploys and a nightly drill that restores the backup to prove it works. The Bhagwati Group website runs on Docker and Traefik on a 1 vCPU / 4 GB VPS and shipped 70 deploys in 4 weeks.',
    relatedCaseStudySlugs: ['aura-tech-platform', 'aurastack-crm', 'bhagwati-group-website'],
    status: 'published',
    tags: ['deployment', 'infrastructure', 'docker', 'oracle-cloud', 'devops'],
  },
];
