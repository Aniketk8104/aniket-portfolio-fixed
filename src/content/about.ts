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
  headline: 'Backend / Full-Stack Engineer · Navi Mumbai',
  roles: ['Backend Engineer', 'Full-Stack Engineer'],
  introParagraph:
    "I'm a backend / full-stack engineer at Aura Tech Services, where I'm the primary engineer on 5 production platforms used by 5+ client businesses, including Bhagwati Group and a US-based teleradiology company.",
  approachParagraph:
    'I approach every system by mapping the failure modes first: where data flows, what happens when a dependency goes down, and how we recover without losing state. From there I design for clear boundaries, strong typing, and automation that removes toil so teams can move quickly without breaking things.',
  backgroundParagraph:
    'I completed a B.Sc. in Computer Science at CKT ACS College, New Panvel (2023–2026) with a CGPA of 9.79/10 and first rank in the final year, and won E-Fest first prizes in Rapid Application Development (2024) and Kill the Bugs (2025). I am open to backend, full-stack, founding or forward-deployed roles in Navi Mumbai, Mumbai or remote, and can join immediately.',
  skills: [
    'Systems Thinker',
    'Backend Depth',
    'Platform Mindset',
    'AI / Automation',
  ],
  timeline: [
    { period: 'Jul 2025 – Present', label: 'Full-Stack Engineer · Aura Tech Services (hybrid)' },
    { period: 'Apr – Jun 2025', label: 'Software Engineer Intern · The StopSearch Technologies (remote)' },
    { period: '2023 – 2026', label: 'B.Sc. Computer Science · CKT ACS College (CGPA 9.79/10)' },
  ],
};
