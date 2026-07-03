/**
 * Property 7: Published Entry Validation
 *
 * **Validates: Requirements 11.5**
 *
 * For collections with at least one published entry containing a placeholder
 * in a required field, the validator exits non-zero.
 *
 * For collections where every published entry has all required fields set,
 * the validator exits zero.
 *
 * Feature: portfolio-engineering-rebrand, Property 7: Published Entry Validation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { placeholder, isPlaceholder } from './placeholder';
import {
  findPlaceholders,
  validatePublishedEntries,
  getValidatorExitCode,
} from './contentValidation';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Arbitrary: a non-empty, non-placeholder string value for a required field.
 */
const realStringArb = fc.string({ minLength: 1, maxLength: 80 }).filter(
  (s) => s.trim().length > 0
);

/**
 * Arbitrary: a valid slug (lowercase alphanumeric + hyphens).
 */
const slugArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{0,40}$/)
  .filter((s) => s.length >= 2);

/**
 * Build a minimal "published" content entry where every required field
 * is a real (non-placeholder) value.
 */
const publishedCleanEntryArb = fc.record({
  slug: slugArb,
  title: realStringArb,
  summary: realStringArb,
  status: fc.constant('published' as const),
  tags: fc.array(realStringArb, { minLength: 0, maxLength: 5 }),
  role: realStringArb,
});

/**
 * Build a minimal "draft" content entry.
 * Draft entries are allowed to have placeholders in any field.
 */
const draftEntryArb = fc.record({
  slug: slugArb,
  title: realStringArb,
  summary: fc.oneof(realStringArb, fc.constant(placeholder<string>('summary'))),
  status: fc.constant('draft' as const),
  tags: fc.array(realStringArb, { minLength: 0, maxLength: 5 }),
  role: fc.oneof(realStringArb, fc.constant(placeholder<string>('role'))),
});

/**
 * Build a "published" entry with AT LEAST ONE required field as a placeholder.
 * The placeholder is injected into one of: summary, role, or a custom extra field.
 */
const publishedDirtyEntryArb = fc
  .record({
    slug: slugArb,
    title: realStringArb,
    status: fc.constant('published' as const),
    tags: fc.array(realStringArb, { minLength: 0, maxLength: 5 }),
  })
  .chain((base) =>
    // Randomly put a placeholder in summary, role, or both
    fc
      .record({
        summary: fc.oneof(
          fc.constant(placeholder<string>('summary')),
          realStringArb
        ),
        role: fc.oneof(
          fc.constant(placeholder<string>('role')),
          realStringArb
        ),
      })
      .filter(
        ({ summary, role }) =>
          // At least one of the two must be a placeholder
          isPlaceholder(summary) || isPlaceholder(role)
      )
      .map(({ summary, role }) => ({ ...base, summary, role }))
  );

// ---------------------------------------------------------------------------
// Helper: turn an entry into a plain Record so the validator can traverse it
// ---------------------------------------------------------------------------
type AnyEntry = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Property tests
// ---------------------------------------------------------------------------

describe('Property 7: Published Entry Validation', () => {
  // -------------------------------------------------------------------------
  // findPlaceholders — unit-level sanity checks
  // -------------------------------------------------------------------------
  describe('findPlaceholders()', () => {
    it('returns empty array for plain objects with no placeholders', () => {
      fc.assert(
        fc.property(
          fc.record({ name: realStringArb, value: fc.integer() }),
          (obj) => {
            expect(findPlaceholders(obj)).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('detects a top-level placeholder', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (field) => {
          const p = placeholder<string>(field);
          const result = findPlaceholders(p);
          expect(result).toContain('(root)');
        }),
        { numRuns: 100 }
      );
    });

    it('detects a nested placeholder under any field name', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z]+$/.test(s)),
          fc.string({ minLength: 1 }),
          (fieldKey, fieldName) => {
            const p = placeholder<string>(fieldName);
            const obj = { [fieldKey]: p, unrelated: 'hello' };
            const found = findPlaceholders(obj);
            expect(found).toContain(fieldKey);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('does NOT detect non-placeholder objects as placeholders', () => {
      fc.assert(
        fc.property(
          fc.record({
            a: realStringArb,
            b: fc.integer(),
            c: fc.array(realStringArb),
          }),
          (obj) => {
            expect(findPlaceholders(obj)).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // -------------------------------------------------------------------------
  // validatePublishedEntries — collection-level
  // -------------------------------------------------------------------------
  describe('validatePublishedEntries()', () => {
    it(
      'returns NO errors for a collection of published entries with all required fields set',
      () => {
        fc.assert(
          fc.property(
            fc.array(publishedCleanEntryArb, { minLength: 1, maxLength: 10 }),
            (entries) => {
              const errors = validatePublishedEntries(
                'test-collection',
                entries as AnyEntry[]
              );
              expect(errors).toHaveLength(0);
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      'returns AT LEAST ONE error for a collection where a published entry has a placeholder',
      () => {
        fc.assert(
          fc.property(
            publishedDirtyEntryArb,
            fc.array(publishedCleanEntryArb, { minLength: 0, maxLength: 5 }),
            (dirtyEntry, cleanEntries) => {
              // Collection: one dirty published entry + any number of clean published entries
              const collection: AnyEntry[] = [
                dirtyEntry as AnyEntry,
                ...(cleanEntries as AnyEntry[]),
              ];
              const errors = validatePublishedEntries('test-collection', collection);
              expect(errors.length).toBeGreaterThan(0);
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      'does NOT report errors for draft entries even when they have placeholders',
      () => {
        fc.assert(
          fc.property(
            fc.array(draftEntryArb, { minLength: 1, maxLength: 10 }),
            (entries) => {
              const errors = validatePublishedEntries(
                'test-collection',
                entries as AnyEntry[]
              );
              expect(errors).toHaveLength(0);
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      'correctly identifies the offending slug in the error report',
      () => {
        fc.assert(
          fc.property(publishedDirtyEntryArb, (dirtyEntry) => {
            const errors = validatePublishedEntries(
              'projects',
              [dirtyEntry as AnyEntry]
            );
            expect(errors.length).toBeGreaterThan(0);
            // Every error must reference the entry's slug
            for (const err of errors) {
              expect(err.slug).toBe(dirtyEntry.slug);
              expect(err.collection).toBe('projects');
            }
          }),
          { numRuns: 100 }
        );
      }
    );
  });

  // -------------------------------------------------------------------------
  // getValidatorExitCode — mirrors script's overall exit behaviour
  // -------------------------------------------------------------------------
  describe('getValidatorExitCode()', () => {
    it(
      'exits 0 when every published entry in every collection has no placeholders',
      () => {
        fc.assert(
          fc.property(
            fc.record({
              projects: fc.array(publishedCleanEntryArb, { minLength: 1, maxLength: 5 }),
              caseStudies: fc.array(publishedCleanEntryArb, { minLength: 1, maxLength: 5 }),
              articles: fc.array(publishedCleanEntryArb, { minLength: 1, maxLength: 5 }),
            }),
            (collections) => {
              const exitCode = getValidatorExitCode(
                collections as Record<string, AnyEntry[]>
              );
              expect(exitCode).toBe(0);
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      'exits 1 when at least one collection has a published entry with a placeholder',
      () => {
        fc.assert(
          fc.property(
            publishedDirtyEntryArb,
            fc.array(publishedCleanEntryArb, { minLength: 0, maxLength: 5 }),
            fc.array(publishedCleanEntryArb, { minLength: 0, maxLength: 5 }),
            (dirtyEntry, cleanProjects, cleanArticles) => {
              const exitCode = getValidatorExitCode({
                projects: [dirtyEntry as AnyEntry, ...(cleanProjects as AnyEntry[])],
                articles: cleanArticles as AnyEntry[],
              });
              expect(exitCode).toBe(1);
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      'exits 0 for entirely draft collections (placeholders allowed in drafts)',
      () => {
        fc.assert(
          fc.property(
            fc.array(draftEntryArb, { minLength: 1, maxLength: 10 }),
            (drafts) => {
              const exitCode = getValidatorExitCode({
                mixed: drafts as AnyEntry[],
              });
              expect(exitCode).toBe(0);
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      'exits 1 when a dirty published entry is present alongside otherwise-clean collections',
      () => {
        fc.assert(
          fc.property(
            publishedDirtyEntryArb,
            fc.array(publishedCleanEntryArb, { minLength: 0, maxLength: 5 }),
            (dirty, clean) => {
              // Mix: one collection with a dirty entry, others all clean
              const exitCode = getValidatorExitCode({
                articles: clean as AnyEntry[],
                architectureTopics: [dirty as AnyEntry],
              });
              expect(exitCode).toBe(1);
            }
          ),
          { numRuns: 100 }
        );
      }
    );
  });
});
