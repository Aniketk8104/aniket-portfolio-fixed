/**
 * Content Validation Utilities
 *
 * Pure validation logic for build-time content checks.
 * Extracted from scripts/validate-content.mjs to enable testability.
 *
 * @module utils/contentValidation
 */

import { isPlaceholder } from './placeholder';

/**
 * A validation error found in a content entry.
 */
export interface ContentValidationError {
  collection: string;
  slug: string;
  field: string;
  message: string;
  path?: string;
}

/**
 * Recursively search an object for placeholder values.
 *
 * @param obj - The value to inspect
 * @param path - The dot-path prefix (used to build human-readable field paths)
 * @returns Array of dot-path strings pointing at placeholder values
 */
export function findPlaceholders(obj: unknown, path: string = ''): string[] {
  const found: string[] = [];

  if (isPlaceholder(obj)) {
    found.push(path || '(root)');
    return found;
  }

  if (typeof obj !== 'object' || obj === null) {
    return found;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      found.push(
        ...findPlaceholders(obj[i], path ? `${path}[${i}]` : `[${i}]`)
      );
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      found.push(...findPlaceholders(value, path ? `${path}.${key}` : key));
    }
  }

  return found;
}

/**
 * Validate a content collection.
 *
 * For every entry whose `status === 'published'`, this function checks that
 * no field in the entry is a `Placeholder<T>`. Draft entries are allowed to
 * carry placeholders freely.
 *
 * @param collectionName - Human-readable name for error messages
 * @param entries - The content entries to check
 * @returns Array of validation errors (empty means all entries are valid)
 */
export function validatePublishedEntries(
  collectionName: string,
  entries: Array<Record<string, unknown>>
): ContentValidationError[] {
  const errors: ContentValidationError[] = [];

  for (const entry of entries) {
    const slug = typeof entry['slug'] === 'string' ? entry['slug'] : '(unknown)';

    if (entry['status'] === 'published') {
      const placeholderPaths = findPlaceholders(entry);
      for (const fieldPath of placeholderPaths) {
        if (fieldPath === 'status') continue;
        errors.push({
          collection: collectionName,
          slug,
          field: fieldPath,
          message:
            'Published entry contains a placeholder value that requires user authorship',
          path: fieldPath,
        });
      }
    }
  }

  return errors;
}

/**
 * Determine the validator exit code for a set of content collections.
 *
 * Mirrors the semantics of `scripts/validate-content.mjs`:
 * - Returns 0 when no published entry contains any placeholder
 * - Returns 1 when at least one published entry contains a placeholder
 *
 * @param collections - Map of collection name → entries
 * @returns 0 or 1
 */
export function getValidatorExitCode(
  collections: Record<string, Array<Record<string, unknown>>>
): 0 | 1 {
  for (const [name, entries] of Object.entries(collections)) {
    const errors = validatePublishedEntries(name, entries);
    if (errors.length > 0) return 1;
  }
  return 0;
}
