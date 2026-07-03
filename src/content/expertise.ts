/**
 * Core Expertise Content
 *
 * Typed module export for the CoreExpertiseSection on the Home page.
 * Each expertise area groups a title, description, and a set of technology tags.
 * This module is the canonical source of truth consumed by the section component.
 *
 * @module content/expertise
 */

export interface ExpertiseArea {
  /** Unique identifier for this area */
  id: string;
  /** Short, engineering-positioned title */
  title: string;
  /** One-paragraph description of the expertise area */
  description: string;
  /** Technology and concept tags for this area */
  tags: string[];
}

/**
 * The core engineering expertise areas displayed on the home page.
 * Ordered by primary domain strength.
 */
export const expertiseAreas: ExpertiseArea[] = [
  {
    id: 'backend-platform',
    title: 'Backend & Platform Engineering',
    description:
      'Designing and operating distributed services, queue-based pipelines, and multi-tenant SaaS platforms. Experience spanning Node.js, Express.js, BullMQ, Redis, MongoDB, and PostgreSQL, with Docker deployment on AWS EC2 and OCI.',
    tags: [
      'Node.js',
      'Express.js',
      'BullMQ',
      'Redis',
      'MongoDB',
      'Multi-Tenant SaaS',
      'REST APIs',
      'AWS EC2',
      'OCI',
    ],
  },
  {
    id: 'ai-automation',
    title: 'AI Automation & Campaigns',
    description:
      'Building AI campaign generation and no-code automation systems on event-driven, queue-backed pipelines. Focused on production-grade workflows that stay observable, with webhook handling and an RBAC team inbox.',
    tags: [
      'AI Campaign Generation',
      'No-Code Automation',
      'Automation Pipelines',
      'Webhook Systems',
      'Event-Driven',
      'Observability',
    ],
  },
  {
    id: 'messaging-realtime',
    title: 'Distributed Messaging & Real-Time Systems',
    description:
      'Architecting event-driven systems and high-throughput messaging infrastructure, including Meta WhatsApp Cloud API integration, queue-based orchestration, and real-time analytics dashboards.',
    tags: [
      'Meta WhatsApp Cloud API',
      'Event-Driven Architecture',
      'BullMQ Queues',
      'Real-Time Analytics',
      'Socket.IO',
      'Message Pipelines',
    ],
  },
  {
    id: 'healthcare-workflow',
    title: 'Healthcare Workflow Systems',
    description:
      'Implementing audit-compliant workflow orchestration for clinical environments, including DICOM handling, distributed operations coordination, and role-based access control for sensitive data.',
    tags: [
      'DICOM',
      'Workflow Orchestration',
      'RBAC',
      'Audit Logging',
      'Healthcare Compliance',
      'Distributed Operations',
    ],
  },
  {
    id: 'devops-infra',
    title: 'DevOps & Infrastructure',
    description:
      'Delivering end-to-end CI/CD pipelines, infrastructure-as-code, and deployment automation. Keeping systems observable, scalable, and secure from day one to production at scale.',
    tags: [
      'CI/CD',
      'Docker',
      'Infrastructure as Code',
      'Deployment Automation',
      'Security Hardening',
      'Monitoring & Alerting',
    ],
  },
  {
    id: 'full-stack',
    title: 'Full-Stack Product Engineering',
    description:
      'Shipping complete product surfaces from schema design through API to React UI. Applying design systems, performance budgets, and accessibility standards across the whole stack.',
    tags: [
      'React',
      'TypeScript',
      'Design Systems',
      'Performance Optimization',
      'Accessibility',
      'API Design',
    ],
  },
];
