/**
 * Architecture Topics Content
 *
 * The six canonical architecture topics for the portfolio.
 * Each topic links to a composed diagram and optional related case studies.
 * User authors prose content later.
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
      'How BVISIONR turns a synchronous messaging channel into a durable, queue-based pipeline that absorbs bursts, retries safely, and stays fair across tenants.',
    diagramId: 'distributed-messaging',
    prose:
      'Sending WhatsApp messages one synchronous API call at a time collapses under real load: rate limits trigger, requests time out, and retries duplicate messages. BVISIONR decouples request handling from delivery with BullMQ queues on Redis. API requests enqueue jobs and return immediately, while dedicated workers drain the queues at a controlled rate with exponential backoff, idempotent retries, and dead-letter handling for poison jobs. Inbound webhooks — delivery receipts, read status, and replies — are verified, normalized, and fed back through the same queue system, so inbound and outbound work share one observable pipeline. The queue boundary provides natural backpressure and fair scheduling, which keeps one noisy tenant from starving the rest and lets the system trace a single message across every state from queued to delivered.',
    relatedCaseStudySlugs: ['bvisionr'],
    status: 'published',
    tags: ['messaging', 'distributed-systems', 'bullmq', 'redis'],
  },
  {
    slug: 'ai-routing',
    title: 'AI Routing & Automation',
    summary:
      'The automation layer that generates campaigns with AI and routes each inbound message to the right no-code automation, template response, or the RBAC team inbox.',
    diagramId: 'ai-routing',
    prose:
      'Not every inbound message should be handled the same way. BVISIONR pairs AI campaign generation with a no-code automation builder so operators can define how messages are handled without engineering support. Inbound messages are routed to the right automation, an approved template reply, or escalated to the event-driven RBAC team inbox. Routing runs as a stage in the message pipeline rather than inline in a request handler, so a slow step never blocks delivery and can be retried independently. Decisions are scoped per tenant, honoring that tenant’s automations, templates, and team roles. Because routing is queue-driven, it inherits the same retry, backpressure, and observability guarantees as the rest of the system — every decision is traceable, and adding a new automation is a configuration change rather than a rewrite.',
    relatedCaseStudySlugs: ['bvisionr'],
    status: 'published',
    tags: ['ai', 'routing', 'automation', 'llm'],
  },
  {
    slug: 'multi-tenant-saas',
    title: 'Multi-Tenant SaaS',
    summary:
      'How a single backend serves many isolated tenants — with per-tenant data scoping and an event-driven RBAC model baked into the architecture.',
    diagramId: 'multi-tenant-saas',
    prose:
      'BVISIONR runs one backend for many organizations, so isolation cannot depend on remembering to filter a query. Tenant scoping is enforced at the data-access layer and an event-driven role-based access control model is checked on every action, which makes "no tenant can read or affect another tenant’s data" a structural property of the system rather than a convention. Each tenant carries its own users, roles, templates, and automations, and the team inbox stays scoped per tenant. New tenants are onboarded through configuration rather than code changes. Centralizing isolation this way required more upfront design than scattering filters through controllers, but it removed an entire category of cross-tenant bugs that are catastrophic in shared-backend SaaS.',
    relatedCaseStudySlugs: ['bvisionr'],
    status: 'published',
    tags: ['saas', 'multi-tenant', 'architecture', 'isolation'],
  },
  {
    slug: 'whatsapp-infrastructure',
    title: 'WhatsApp Infrastructure',
    summary:
      'Operating on top of the WhatsApp Cloud API: webhook verification, template rules, rate limits, and reconciling asynchronous delivery state.',
    diagramId: 'whatsapp-infrastructure',
    prose:
      'The WhatsApp Cloud API is low-level — it speaks in webhooks, template approvals, rate limits, and per-message delivery callbacks. BVISIONR wraps that into a managed product. Outbound sends respect Cloud API rate limits through the rate-aware worker pool, so the platform never trips limits even during campaign bursts. Incoming webhooks are signature-verified, normalized into internal events, and reconciled against a message-state machine (queued → sent → delivered → read → failed) so the UI and analytics reflect true delivery status instead of a single optimistic boolean. Template handling and approval state are modeled explicitly so tenants only send what WhatsApp will accept. Treating webhooks as just another queue source unified inbound and outbound flows under one reliable, observable pipeline.',
    relatedCaseStudySlugs: ['bvisionr'],
    status: 'published',
    tags: ['whatsapp', 'cloud-api', 'messaging', 'webhooks'],
  },
  {
    slug: 'healthcare-workflow',
    title: 'Healthcare Workflow',
    summary:
      'How Radique integrates PACS-style DICOM imaging through Orthanc and drives a diagnostic case from assignment to a signed report — with an audit log that keeps every step traceable across multiple radiology centres.',
    diagramId: 'healthcare-workflow',
    prose:
      'Teleradiology is a coordination problem wrapped around medical imaging. Radique integrates PACS-style DICOM imaging through Orthanc and drives each diagnostic case through an explicit lifecycle — received, assigned, in-progress, reported, signed-off — across 3+ radiology centres. The workflow engine and an audit-logged, state-managed backend keep case state consistent under concurrent activity, while every meaningful action (assignment, report change, sign-off) is written to an audit log so a case’s full history can be reconstructed at any time. Case, report, and audit records live in MongoDB, and the system is containerized with Docker for reproducible deployment. Traceability is treated as a structural property, designed in from the start rather than bolted on, because in a clinical context accountability is non-negotiable.',
    relatedCaseStudySlugs: ['radique'],
    status: 'published',
    tags: ['healthcare', 'workflow', 'dicom', 'orchestration', 'pacs'],
  },
  {
    slug: 'deployment-infrastructure',
    title: 'Deployment Infrastructure',
    summary:
      'How AuraTechServices.in is packaged and operated — containerized with Docker, deployable via PM2 or Kubernetes behind Nginx, with health, readiness, and metrics endpoints, structured logging, and layered security.',
    diagramId: 'deployment-infrastructure',
    prose:
      'Aura’s backend is built to run in production, not just locally. The Node.js and Express service is containerized with Docker and can be deployed with PM2 on a VPS or as a Kubernetes deployment behind an Nginx reverse proxy. Operability is first-class: /healthz reports database, memory, and CPU status, /readyz gates traffic until dependencies are ready, and /metrics exposes request counts, latency, and error rates — all alongside structured JSON logs via Pino. Performance comes from MongoDB indexes on hot fields, connection pooling, gzip compression, query projection, and in-memory caching with TTL, together holding p95 responses under 200ms at 1,000+ RPS against a 99.9% uptime target. Security is layered in rather than bolted on: Helmet/CSP headers, CORS, per-endpoint rate limiting, NoSQL-injection sanitization, validated inputs, and TLS with HSTS.',
    relatedCaseStudySlugs: ['aura-tech-platform'],
    status: 'published',
    tags: ['deployment', 'infrastructure', 'docker', 'kubernetes', 'devops'],
  },
];
