/**
 * Content Schema Validation
 * 
 * Zod schemas mirroring src/types/content.ts for runtime validation.
 * Field names and optionality are kept identical to the TypeScript types.
 * 
 * @module content/schemas
 */

import { z } from 'zod';

/**
 * Content publication status schema
 */
export const ContentStatusSchema = z.enum(['draft', 'published']);

/**
 * Base schema for all content entities
 */
export const ContentBaseSchema = z.object({
  /** URL-friendly identifier */
  slug: z.string(),
  /** Display title */
  title: z.string(),
  /** Brief description */
  summary: z.string(),
  /** Publication status */
  status: ContentStatusSchema,
  /** Topic/technology tags */
  tags: z.array(z.string()),
});

/**
 * Structured rich text node schema
 */
export const RichTextNodeSchema: z.ZodType = z.lazy(() =>
  z.object({
    /** Node type (paragraph, heading, list, code, etc.) */
    type: z.enum(['paragraph', 'heading', 'list', 'code', 'blockquote', 'image']),
    /** Node content */
    content: z.string().optional(),
    /** Nested children nodes */
    children: z.array(RichTextNodeSchema).optional(),
    /** Additional attributes (level for headings, language for code, etc.) */
    attrs: z.record(z.string(), z.unknown()).optional(),
  })
);

/**
 * Rich text content schema
 * Can be a simple string or an array of structured nodes
 */
export const RichTextSchema = z.union([
  z.string(),
  z.array(RichTextNodeSchema),
]);

/**
 * Metric display data schema
 */
export const MetricSchema = z.object({
  /** Metric label */
  label: z.string(),
  /** Metric value (rendered verbatim, never derived) */
  value: z.string(),
  /** Optional unit suffix */
  unit: z.string().optional(),
  /** Visual tone for the metric */
  tone: z.enum(['neutral', 'positive']).optional(),
});

/**
 * Table of contents entry schema
 */
export const TocEntrySchema = z.object({
  /** Anchor ID */
  id: z.string(),
  /** Display label */
  label: z.string(),
  /** Heading level */
  level: z.union([z.literal(2), z.literal(3)]),
});

/**
 * Project entity schema
 * Represents a portfolio project with optional case study link
 */
export const ProjectSchema = ContentBaseSchema.extend({
  /** Role in the project */
  role: z.string(),
  /** Slug of associated case study, or null if none exists */
  caseStudySlug: z.string().nullable(),
  /** Primary technologies used */
  primaryTech: z.array(z.string()),
  /** Optional thumbnail image path */
  thumbnail: z.string().optional(),
  /** Optional live/production URL for the project */
  liveUrl: z.string().url().optional(),
});

/**
 * Case study sections schema
 * All sections are optional; unset sections render as placeholders
 */
export const CaseStudySectionsSchema = z.object({
  /** Project overview */
  overview: RichTextSchema.optional(),
  /** Project context and background */
  context: RichTextSchema.optional(),
  /** Problem statement */
  problem: RichTextSchema.optional(),
  /** Technical and business constraints */
  constraints: RichTextSchema.optional(),
  /** Architecture description */
  architecture: RichTextSchema.optional(),
  /** Key technical decisions */
  decisions: RichTextSchema.optional(),
  /** Tradeoffs and considerations */
  tradeoffs: RichTextSchema.optional(),
  /** Project outcomes and results */
  outcomes: RichTextSchema.optional(),
  /** Lessons learned */
  lessons: RichTextSchema.optional(),
});

/**
 * Gallery image schema — project/case-study screenshot
 */
export const GalleryImageSchema = z.object({
  /** Image source path */
  src: z.string(),
  /** Required alt text */
  alt: z.string(),
  /** Optional caption */
  caption: z.string().optional(),
});

/**
 * Case study entity schema
 * Detailed writeup of a project with structured sections
 */
export const CaseStudySchema = ContentBaseSchema.extend({
  /** Associated project slug */
  projectSlug: z.string(),
  /** Role in the project */
  role: z.string(),
  /** Project duration */
  duration: z.string(),
  /** Optional diagram identifier for architecture visualization */
  diagramId: z.string().optional(),
  /** Optional metrics to display */
  metrics: z.array(MetricSchema).optional(),
  /** Optional image gallery */
  gallery: z.array(GalleryImageSchema).optional(),
  /** Case study content sections */
  sections: CaseStudySectionsSchema,
});

/**
 * Architecture topic entity schema
 * Technical deep-dive with diagram and prose
 */
export const ArchitectureTopicSchema = ContentBaseSchema.extend({
  /** Diagram identifier for visualization */
  diagramId: z.string(),
  /** Topic prose content */
  prose: RichTextSchema.optional(),
  /** Related case study slugs */
  relatedCaseStudySlugs: z.array(z.string()),
});

/**
 * Article entity schema
 * Long-form writing piece
 */
export const ArticleSchema = ContentBaseSchema.extend({
  /** Article body content */
  body: RichTextSchema.optional(),
  /** Optional table of contents */
  toc: z.array(TocEntrySchema).optional(),
  /** Estimated reading time in minutes */
  readingTimeMinutes: z.number(),
  /** Publication date (ISO 8601 format) */
  publishedAt: z.string().optional(),
});

/**
 * Type exports for convenience
 * These infer the TypeScript types from the Zod schemas
 */
export type ContentStatus = z.infer<typeof ContentStatusSchema>;
export type ContentBase = z.infer<typeof ContentBaseSchema>;
export type RichTextNode = z.infer<typeof RichTextNodeSchema>;
export type RichText = z.infer<typeof RichTextSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type TocEntry = z.infer<typeof TocEntrySchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type CaseStudySections = z.infer<typeof CaseStudySectionsSchema>;
export type CaseStudy = z.infer<typeof CaseStudySchema>;
export type ArchitectureTopic = z.infer<typeof ArchitectureTopicSchema>;
export type Article = z.infer<typeof ArticleSchema>;
