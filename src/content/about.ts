/**
 * About content module.
 *
 * Stores the "About Me" section copy used by AboutSection.jsx.
 * Fields that have not yet been authored are marked with placeholder().
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 11.2, 11.3
 */

import type { Placeholder } from '../utils/placeholder';

export interface AboutContent {
  /** One-line positioning headline – always authored */
  headline: string;
  /** Primary role labels, comma-separated */
  roles: string[];
  /** Opening paragraph – authored by user */
  introParagraph: string | Placeholder<string>;
  /** Second paragraph – authored by user */
  approachParagraph: string | Placeholder<string>;
  /** Third paragraph – authored by user */
  backgroundParagraph: string | Placeholder<string>;
  /** Skill / trait badges displayed alongside the code panel */
  skills: string[];
  /** Experience timeline entries */
  timeline: Array<{
    period: string;
    label: string;
  }>;
}

export const aboutContent: AboutContent = {
  headline: 'Software Engineer · Backend · Platform · AI Automation',
  roles: [
    'Software Engineer',
    'Backend Engineer',
    'Platform Engineer',
    'AI Automation Builder',
  ],
  introParagraph:
    "I'm a software engineer focused on backend and platform systems — the kind of infrastructure that has to stay reliable when traffic, data, and complexity grow. I care about clean architecture, observable systems, and shipping software that holds up in production.",
  approachParagraph:
    'I approach every system by mapping the failure modes first: where data flows, what happens when a dependency goes down, and how we recover without losing state. From there I design for clear boundaries, strong typing, and automation that removes toil so teams can move quickly without breaking things.',
  backgroundParagraph:
    "I'm currently pursuing a B.Sc in Computer Science while building production systems across SaaS, healthcare, and automation domains. My long-term focus is distributed systems and developer platforms — infrastructure that makes other engineers faster and products more resilient.",
  skills: [
    'Systems Thinker',
    'Backend Depth',
    'Platform Mindset',
    'AI / Automation',
  ],
  timeline: [
    { period: '2024 – Present', label: 'Software Engineer · Platform & Backend' },
    { period: '2023 – 2024', label: 'Full-Stack Engineering — React, Node.js, Cloud' },
    { period: '2023 – Present', label: 'B.Sc Computer Science — CKT College' },
  ],
};
