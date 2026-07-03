/**
 * Content Schema Types
 * 
 * TypeScript types for all content entities in the portfolio.
 * These types define the structure for projects, case studies, architecture topics, and articles.
 * 
 * @module types/content
 */

/**
 * Content publication status
 */
export type ContentStatus = 'draft' | 'published';

/**
 * Base interface for all content entities
 */
export interface ContentBase {
  /** URL-friendly identifier */
  slug: string;
  /** Display title */
  title: string;
  /** Brief description */
  summary: string;
  /** Publication status */
  status: ContentStatus;
  /** Topic/technology tags */
  tags: string[];
}

/**
 * Rich text content representation
 * Can be a simple string or an array of structured nodes
 */
export type RichText = string | RichTextNode[];

/**
 * Structured rich text node
 * Supports various content types for rich formatting
 */
export interface RichTextNode {
  /** Node type (paragraph, heading, list, code, etc.) */
  type: 'paragraph' | 'heading' | 'list' | 'code' | 'blockquote' | 'image';
  /** Node content */
  content?: string;
  /** Nested children nodes */
  children?: RichTextNode[];
  /** Additional attributes (level for headings, language for code, etc.) */
  attrs?: Record<string, unknown>;
}

/**
 * Metric display data
 */
export interface Metric {
  /** Metric label */
  label: string;
  /** Metric value (rendered verbatim, never derived) */
  value: string;
  /** Optional unit suffix */
  unit?: string;
  /** Visual tone for the metric */
  tone?: 'neutral' | 'positive';
}

/**
 * Table of contents entry
 */
export interface TocEntry {
  /** Anchor ID */
  id: string;
  /** Display label */
  label: string;
  /** Heading level */
  level: 2 | 3;
}

/**
 * Project entity
 * Represents a portfolio project with optional case study link
 */
export interface Project extends ContentBase {
  /** Role in the project */
  role: string;
  /** Slug of associated case study, or null if none exists */
  caseStudySlug: string | null;
  /** Primary technologies used */
  primaryTech: string[];
  /** Optional thumbnail image path */
  thumbnail?: string;
  /** Optional live/production URL for the project */
  liveUrl?: string;
}

/**
 * Case study sections
 * All sections are optional; unset sections render as placeholders
 */
export interface CaseStudySections {
  /** Project overview */
  overview?: RichText;
  /** Project context and background */
  context?: RichText;
  /** Problem statement */
  problem?: RichText;
  /** Technical and business constraints */
  constraints?: RichText;
  /** Architecture description */
  architecture?: RichText;
  /** Key technical decisions */
  decisions?: RichText;
  /** Tradeoffs and considerations */
  tradeoffs?: RichText;
  /** Project outcomes and results */
  outcomes?: RichText;
  /** Lessons learned */
  lessons?: RichText;
}

/**
 * A single image in a project/case-study gallery.
 */
export interface GalleryImage {
  /** Image source path (e.g. "/projects/bvisionr-dashboard.png") */
  src: string;
  /** Required alt text for accessibility */
  alt: string;
  /** Optional caption shown beneath the image */
  caption?: string;
}

/**
 * Case study entity
 * Detailed writeup of a project with structured sections
 */
export interface CaseStudy extends ContentBase {
  /** Associated project slug */
  projectSlug: string;
  /** Role in the project */
  role: string;
  /** Project duration */
  duration: string;
  /** Optional diagram identifier for architecture visualization */
  diagramId?: string;
  /** Optional metrics to display */
  metrics?: Metric[];
  /** Optional image gallery — add as many project screenshots as needed */
  gallery?: GalleryImage[];
  /** Case study content sections */
  sections: CaseStudySections;
}

/**
 * Architecture topic entity
 * Technical deep-dive with diagram and prose
 */
export interface ArchitectureTopic extends ContentBase {
  /** Diagram identifier for visualization */
  diagramId: string;
  /** Topic prose content */
  prose?: RichText;
  /** Related case study slugs */
  relatedCaseStudySlugs: string[];
}

/**
 * Article entity
 * Long-form writing piece
 */
export interface Article extends ContentBase {
  /** Article body content */
  body?: RichText;
  /** Optional table of contents */
  toc?: TocEntry[];
  /** Estimated reading time in minutes */
  readingTimeMinutes: number;
  /** Publication date (ISO 8601 format) */
  publishedAt?: string;
}
