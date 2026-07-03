#!/usr/bin/env node

/**
 * Content Validation Script
 *
 * Validates all content modules against their zod schemas and ensures
 * that published entries have no placeholder values in required fields.
 *
 * This script:
 * 1. Imports content modules via tsx (TypeScript execution)
 * 2. Runs each entry through its corresponding zod schema
 * 3. For entries with status === 'published', asserts no required field
 *    contains a Placeholder<T> value
 * 4. Exits non-zero with offending slug, field, and zod issue path on failure
 *
 * Usage:
 *   node scripts/validate-content.mjs    # Run manually
 *   npm run build                        # Runs automatically via prebuild hook
 *
 * Exit codes:
 * - 0: All content valid
 * - 1: Validation failed (schema errors or placeholders in published entries)
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

/**
 * The TypeScript validation logic that tsx will execute.
 */
const VALIDATION_SCRIPT = `
import { projects } from './src/content/projects';
import { caseStudies } from './src/content/caseStudies';
import { architectureTopics } from './src/content/architectureTopics';
import { articles } from './src/content/articles';
import {
  ProjectSchema,
  CaseStudySchema,
  ArchitectureTopicSchema,
  ArticleSchema,
} from './src/content/schemas';
import { isPlaceholder } from './src/utils/placeholder';

interface ValidationError {
  collection: string;
  slug: string;
  field: string;
  message: string;
  path?: string;
}

const errors: ValidationError[] = [];

/**
 * Recursively check an object for placeholder values.
 * Returns an array of field paths that contain placeholders.
 */
function findPlaceholders(obj: unknown, path: string = ''): string[] {
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
      found.push(...findPlaceholders(obj[i], path ? path + '[' + i + ']' : '[' + i + ']'));
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      found.push(...findPlaceholders(value, path ? path + '.' + key : key));
    }
  }

  return found;
}

/**
 * Strip placeholder values from an object, replacing them with valid
 * stand-in values so zod schema validation can check structure.
 * Placeholders in draft entries are expected and valid.
 */
function stripPlaceholders(obj: unknown): unknown {
  if (isPlaceholder(obj)) {
    return '__placeholder__';
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => stripPlaceholders(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = stripPlaceholders(value);
  }
  return result;
}

/**
 * Validate a collection against its schema and check published entries for placeholders.
 */
function validateCollection(
  name: string,
  entries: any[],
  schema: any,
) {
  for (const entry of entries) {
    const slug = entry.slug || '(unknown)';

    // Step 1: Strip placeholders before schema validation since placeholders
    // are branded objects that won't pass zod string/object checks.
    const stripped = stripPlaceholders(entry);
    const result = schema.safeParse(stripped);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          collection: name,
          slug,
          field: issue.path.join('.') || '(root)',
          message: issue.message,
          path: issue.path.join('.'),
        });
      }
    }

    // Step 2: For published entries, assert no required field is a placeholder
    if (entry.status === 'published') {
      const placeholderPaths = findPlaceholders(entry);
      for (const fieldPath of placeholderPaths) {
        if (fieldPath === 'status') continue;
        errors.push({
          collection: name,
          slug,
          field: fieldPath,
          message: 'Published entry contains a placeholder value that requires user authorship',
          path: fieldPath,
        });
      }
    }
  }
}

// Run validation for each collection
validateCollection('projects', projects as any[], ProjectSchema);
validateCollection('caseStudies', caseStudies as any[], CaseStudySchema);
validateCollection('architectureTopics', architectureTopics as any[], ArchitectureTopicSchema);
validateCollection('articles', articles as any[], ArticleSchema);

// Output results as JSON
const totalEntries =
  (projects as any[]).length +
  (caseStudies as any[]).length +
  (architectureTopics as any[]).length +
  (articles as any[]).length;

const output = {
  errors,
  summary: errors.length === 0
    ? 'All ' + totalEntries + ' content entries validated successfully.'
    : errors.length + ' validation error(s) found.',
};

process.stdout.write(JSON.stringify(output));
process.exit(errors.length > 0 ? 1 : 0);
`;

async function main() {
  console.log(`${colors.cyan}🔍 Validating content modules...${colors.reset}\n`);

  // Write the validation script to a temporary file at the project root
  // so that relative imports (./src/...) resolve correctly
  const tmpFile = join(rootDir, '.validate-content-runner.ts');

  try {
    writeFileSync(tmpFile, VALIDATION_SCRIPT, 'utf-8');

    const result = execSync(`npx tsx ${tmpFile}`, {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Parse the JSON result from the validation script
    const output = JSON.parse(result.trim());

    if (output.errors.length > 0) {
      printErrors(output.errors);
      cleanup(tmpFile);
      process.exit(1);
    }

    console.log(`${colors.green}✅ Content validation PASSED${colors.reset}`);
    console.log(`${colors.green}   ${output.summary}${colors.reset}\n`);
    cleanup(tmpFile);
    process.exit(0);
  } catch (error) {
    // If tsx execution fails, check if it's a validation failure with JSON output
    if (error.stdout) {
      try {
        const output = JSON.parse(error.stdout.trim());
        if (output.errors && output.errors.length > 0) {
          printErrors(output.errors);
          cleanup(tmpFile);
          process.exit(1);
        }
      } catch {
        // Not JSON output, fall through to generic error
      }
    }

    // Generic error (tsx not found, syntax error, etc.)
    const stderr = error.stderr || error.message || '';
    console.error(`${colors.red}❌ Error during content validation:${colors.reset}`);
    console.error(stderr);
    cleanup(tmpFile);
    process.exit(1);
  }
}

function printErrors(errors) {
  console.log(`${colors.red}❌ Content validation FAILED${colors.reset}\n`);
  for (const error of errors) {
    console.log(`${colors.red}  ✗ [${error.collection}] ${error.slug}${colors.reset}`);
    console.log(`    Field: ${error.field}`);
    console.log(`    Issue: ${error.message}`);
    if (error.path) {
      console.log(`    Path:  ${error.path}`);
    }
    console.log();
  }
}

function cleanup(tmpFile) {
  try {
    unlinkSync(tmpFile);
  } catch {
    // Ignore cleanup errors
  }
}

main();
