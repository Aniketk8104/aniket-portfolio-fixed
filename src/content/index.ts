/**
 * Content Module Barrel Export
 *
 * Re-exports all content collections and their entry types
 * for convenient consumption by routes and sections.
 *
 * @module content
 */

export { projects } from './projects';
export type { ProjectEntry } from './projects';

export { caseStudies } from './caseStudies';
export type { CaseStudyEntry } from './caseStudies';

export { architectureTopics } from './architectureTopics';
export type { ArchitectureTopicEntry } from './architectureTopics';

export { articles } from './articles';
export type { ArticleEntry } from './articles';

export { expertiseAreas } from './expertise';
export type { ExpertiseArea } from './expertise';
