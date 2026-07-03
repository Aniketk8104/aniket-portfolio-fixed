/**
 * Property 6: Placeholder Rendering Round-Trip
 *
 * **Validates: Requirements 3.3, 5.3, 6.3, 6.4, 7.3, 11.3, 11.4**
 *
 * For any content entry × optional field, rendered output equals the authored
 * value when set, equals "TODO: <field>" when unset. System never substitutes
 * generated prose.
 *
 * @module utils/placeholder.property.test
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { placeholder, isPlaceholder } from './placeholder';
import type { Placeholder } from './placeholder';
import { projects } from '../content/projects';
import { caseStudies } from '../content/caseStudies';
import { architectureTopics } from '../content/architectureTopics';
import { articles } from '../content/articles';
import type { RichText } from '../types/content';

// ---------------------------------------------------------------------------
// Helper: the template rendering logic
// This is what every page template does: isPlaceholder(v) → "TODO: <field>", else v
// ---------------------------------------------------------------------------

type OptionalField<T> = T | Placeholder<T>;

/**
 * Renders a field value the same way templates do:
 *   isPlaceholder(v) → `"TODO: ${v.__field}"`
 *   else             → the authored value (string coerced to string, or JSON for RichText)
 */
function renderField<T>(value: OptionalField<T>): string {
  if (isPlaceholder(value)) {
    return `TODO: ${value.__field}`;
  }
  if (typeof value === 'string') {
    return value;
  }
  // For RichText arrays or other non-string authored values, return a stable marker
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** An arbitrary non-empty field name */
const fieldNameArb = fc
  .string({ minLength: 1, maxLength: 40 })
  .filter((s) => s.trim().length > 0);

/** An arbitrary authored string (non-empty, not produced by the placeholder system) */
const authoredStringArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter(
    (s) =>
      // Must not look like generated "TODO: ..." prose to keep the test honest
      !s.startsWith('TODO:') && s.trim().length > 0,
  );

/**
 * An arbitrary OptionalField<string> — either a real authored string or a placeholder.
 * The `tag` property lets us tell which case was sampled.
 */
const optionalStringFieldArb = fc.oneof(
  authoredStringArb.map((v) => ({ kind: 'authored' as const, value: v as OptionalField<string> })),
  fieldNameArb.map((f) => ({
    kind: 'placeholder' as const,
    value: placeholder<string>(f) as OptionalField<string>,
    field: f,
  })),
);

/**
 * An arbitrary OptionalField<RichText> — either a real authored string-rich-text or a placeholder.
 */
const optionalRichTextFieldArb = fc.oneof(
  authoredStringArb.map((v) => ({ kind: 'authored' as const, value: v as OptionalField<RichText> })),
  fieldNameArb.map((f) => ({
    kind: 'placeholder' as const,
    value: placeholder<RichText>(f) as OptionalField<RichText>,
    field: f,
  })),
);

// ---------------------------------------------------------------------------
// Property 6 — Core round-trip invariants
// ---------------------------------------------------------------------------

describe('Property 6: Placeholder Rendering Round-Trip', () => {
  /**
   * P6-a: When a field is authored (not a placeholder), renderField returns the
   * authored value verbatim. The system never substitutes or transforms the content.
   */
  it('P6-a: authored value is rendered verbatim', () => {
    fc.assert(
      fc.property(authoredStringArb, (authored) => {
        const result = renderField<string>(authored);
        expect(result).toBe(authored);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * P6-b: When a field is unset (placeholder), renderField returns "TODO: <field>".
   * The result starts with "TODO: " and includes the field name exactly.
   */
  it('P6-b: placeholder value renders as "TODO: <field>"', () => {
    fc.assert(
      fc.property(fieldNameArb, (fieldName) => {
        const p = placeholder<string>(fieldName);
        const result = renderField<string>(p);
        expect(result).toBe(`TODO: ${fieldName}`);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * P6-c: The two branches are mutually exclusive.
   * If a value is a placeholder, renderField must never return the authored path.
   * If a value is authored, renderField must never return a "TODO: ..." string.
   */
  it('P6-c: authored and placeholder branches are mutually exclusive', () => {
    fc.assert(
      fc.property(optionalStringFieldArb, (sample) => {
        const result = renderField(sample.value);
        if (sample.kind === 'placeholder') {
          // Must render as "TODO: <field>", NOT as the authored path
          expect(result).toMatch(/^TODO: /);
          expect(result).toBe(`TODO: ${(sample as { field: string }).field}`);
        } else {
          // Must render verbatim — must NOT look like a TODO sentinel
          expect(result).not.toMatch(/^TODO: /);
        }
      }),
      { numRuns: 200 },
    );
  });

  /**
   * P6-d: No generated prose. The output of renderField for a placeholder is
   * strictly `"TODO: <field>"` — never a longer sentence, never a fabricated value.
   */
  it('P6-d: placeholder output is strictly "TODO: <field>" — no generated prose', () => {
    fc.assert(
      fc.property(fieldNameArb, (fieldName) => {
        const p = placeholder<string>(fieldName);
        const result = renderField<string>(p);
        // Exact format, nothing extra
        expect(result).toBe(`TODO: ${fieldName}`);
        // Cannot be confused with authored copy
        expect(result.length).toBe('TODO: '.length + fieldName.length);
      }),
      { numRuns: 200 },
    );
  });

  /**
   * P6-e: RichText fields obey the same round-trip guarantee.
   */
  it('P6-e: RichText fields round-trip correctly', () => {
    fc.assert(
      fc.property(optionalRichTextFieldArb, (sample) => {
        const result = renderField(sample.value);
        if (sample.kind === 'placeholder') {
          expect(result).toBe(`TODO: ${(sample as { field: string }).field}`);
        } else {
          expect(result).not.toMatch(/^TODO: /);
        }
      }),
      { numRuns: 200 },
    );
  });

  /**
   * P6-f: Field name is preserved exactly through the placeholder round-trip.
   * Creating a placeholder with field "foo" and rendering it must return "TODO: foo".
   * The field name must not be truncated, transformed, or interpolated differently.
   */
  it('P6-f: field name is preserved exactly (no truncation or transformation)', () => {
    fc.assert(
      fc.property(fieldNameArb, (fieldName) => {
        const p = placeholder<string>(fieldName);
        // Check field stored correctly
        expect(p.__field).toBe(fieldName);
        // Check rendering is exact
        const result = renderField<string>(p);
        expect(result.slice('TODO: '.length)).toBe(fieldName);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 — Integration: canonical content entries
// ---------------------------------------------------------------------------

describe('Property 6: Canonical Content Entries Round-Trip', () => {
  /**
   * All canonical project entries: optional fields that are placeholders render
   * as "TODO: <field>", and any set fields render verbatim.
   */
  it('projects: summary and role fields obey placeholder round-trip', () => {
    for (const project of projects) {
      // summary
      if (isPlaceholder(project.summary)) {
        expect(renderField(project.summary)).toBe(`TODO: ${project.summary.__field}`);
      } else {
        expect(renderField(project.summary)).toBe(project.summary);
        expect(renderField(project.summary)).not.toMatch(/^TODO: /);
      }

      // role
      if (isPlaceholder(project.role)) {
        expect(renderField(project.role)).toBe(`TODO: ${project.role.__field}`);
      } else {
        expect(renderField(project.role)).toBe(project.role);
        expect(renderField(project.role)).not.toMatch(/^TODO: /);
      }
    }
  });

  /**
   * All canonical case study entries: optional section fields obey the round-trip.
   */
  it('caseStudies: section fields obey placeholder round-trip', () => {
    const sectionNames = [
      'overview', 'context', 'problem', 'constraints',
      'architecture', 'decisions', 'tradeoffs', 'outcomes', 'lessons',
    ] as const;

    for (const cs of caseStudies) {
      for (const sectionName of sectionNames) {
        const field = cs.sections[sectionName] as OptionalField<RichText> | undefined;
        if (field === undefined) continue;

        if (isPlaceholder(field)) {
          expect(renderField(field)).toBe(`TODO: ${field.__field}`);
        } else {
          expect(renderField(field)).not.toMatch(/^TODO: /);
        }
      }
    }
  });

  /**
   * All canonical architecture topics: prose field obeys the round-trip.
   */
  it('architectureTopics: prose field obeys placeholder round-trip', () => {
    for (const topic of architectureTopics) {
      if (topic.prose === undefined) continue;
      const field = topic.prose as OptionalField<RichText>;

      if (isPlaceholder(field)) {
        expect(renderField(field)).toBe(`TODO: ${field.__field}`);
      } else {
        expect(renderField(field)).not.toMatch(/^TODO: /);
      }
    }
  });

  /**
   * All canonical articles: body field obeys the round-trip.
   */
  it('articles: body field obeys placeholder round-trip', () => {
    for (const article of articles) {
      if (article.body === undefined) continue;
      const field = article.body as OptionalField<RichText>;

      if (isPlaceholder(field)) {
        expect(renderField(field)).toBe(`TODO: ${field.__field}`);
      } else {
        expect(renderField(field)).not.toMatch(/^TODO: /);
      }
    }
  });

  /**
   * No canonical content entry renders a "TODO: ..." value for an actually
   * authored (non-placeholder) field. This ensures the real content is always
   * returned verbatim when authored.
   */
  it('no authored content field is incorrectly treated as a placeholder', () => {
    // Projects
    for (const project of projects) {
      if (!isPlaceholder(project.summary)) {
        expect(renderField(project.summary)).toBe(project.summary);
      }
      if (!isPlaceholder(project.role)) {
        expect(renderField(project.role)).toBe(project.role);
      }
    }

    // Case studies
    const sectionNames = [
      'overview', 'context', 'problem', 'constraints',
      'architecture', 'decisions', 'tradeoffs', 'outcomes', 'lessons',
    ] as const;
    for (const cs of caseStudies) {
      for (const sectionName of sectionNames) {
        const field = cs.sections[sectionName] as OptionalField<RichText> | undefined;
        if (field !== undefined && !isPlaceholder(field)) {
          expect(renderField(field)).not.toMatch(/^TODO: /);
        }
      }
    }

    // Articles
    for (const article of articles) {
      if (article.body !== undefined && !isPlaceholder(article.body)) {
        expect(renderField(article.body as OptionalField<RichText>)).not.toMatch(/^TODO: /);
      }
    }
  });
});
