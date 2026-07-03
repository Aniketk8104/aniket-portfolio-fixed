#!/usr/bin/env node

/**
 * Freelance-String Scanner
 *
 * Scans dist/, public/, and src/content/ for prohibited strings that represent
 * the old "Freelance MERN" positioning. Exits non-zero if any hit is found.
 *
 * Prohibited strings:
 *   - "Freelance MERN"
 *   - "MERN Stack Developer"
 *   - "Hire MERN"
 *
 * Skip rules:
 *   - node_modules/
 *   - .git/
 *   - dev-dist/
 *   - *.map files
 *
 * Allow rules:
 *   - *.test.* files (so tests can assert the scanner's own behaviour)
 *
 * Validates: Requirements 14.4, 20.5
 *
 * Usage:
 *   node scripts/check-freelance-strings.mjs    # run manually
 *   npm run build                               # runs automatically via postbuild hook
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, relative, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ANSI colour codes
const c = {
  reset:  '\x1b[0m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
};

const ROOT = join(__dirname, '..');

/** Directories to scan (relative to project root) */
const SCAN_DIRS = ['dist', 'public', 'src/content'];

/** Prohibited strings — case-sensitive, as per spec */
const PROHIBITED = [
  'Freelance MERN',
  'MERN Stack Developer',
  'Hire MERN',
];

/** Directory-name segments to skip entirely */
const SKIP_DIR_NAMES = new Set(['node_modules', '.git', 'dev-dist']);

/**
 * Returns true if the file path should be skipped.
 * @param {string} absPath  Absolute path to file
 * @param {string} relPath  Path relative to project root
 */
function shouldSkipFile(absPath, relPath) {
  // Skip source-map files
  if (extname(absPath) === '.map') return true;

  // Allow test files even if they mention the prohibited strings
  const base = basename(absPath);
  if (/\.test\./.test(base)) return true;

  return false;
}

/**
 * Returns true if the directory should be skipped.
 * @param {string} dirName  Bare directory name (not full path)
 */
function shouldSkipDir(dirName) {
  return SKIP_DIR_NAMES.has(dirName);
}

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

/**
 * Recursively walks a directory and collects all scannable files.
 * @param {string} dir   Absolute path to directory
 * @returns {string[]}   Array of absolute file paths
 */
function collectFiles(dir) {
  if (!existsSync(dir)) return [];

  const results = [];
  for (const entry of readdirSync(dir)) {
    if (shouldSkipDir(entry)) continue;

    const absPath = join(dir, entry);
    const stat = statSync(absPath);

    if (stat.isDirectory()) {
      results.push(...collectFiles(absPath));
    } else if (stat.isFile()) {
      const relPath = relative(ROOT, absPath);
      if (!shouldSkipFile(absPath, relPath)) {
        results.push(absPath);
      }
    }
  }
  return results;
}

/**
 * Scans a single file for prohibited strings.
 * @param {string} absPath  Absolute path to file
 * @returns {{ line: number, col: number, string: string }[]}  Array of matches
 */
function scanFile(absPath) {
  let content;
  try {
    content = readFileSync(absPath, 'utf-8');
  } catch {
    // Binary or unreadable files — skip silently
    return [];
  }

  const matches = [];
  const lines = content.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    for (const str of PROHIBITED) {
      let searchFrom = 0;
      let col;
      while ((col = line.indexOf(str, searchFrom)) !== -1) {
        matches.push({ line: lineIdx + 1, col: col + 1, string: str });
        searchFrom = col + str.length;
      }
    }
  }

  return matches;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log(`${c.cyan}${c.bold}🔍 Freelance-string scanner${c.reset}\n`);
  console.log(`${c.blue}Scanning directories:${c.reset} ${SCAN_DIRS.join(', ')}`);
  console.log(`${c.blue}Prohibited strings:${c.reset}  ${PROHIBITED.map(s => `"${s}"`).join(', ')}\n`);

  // Collect all files from every scan directory
  const allFiles = SCAN_DIRS.flatMap(dir => collectFiles(join(ROOT, dir)));

  console.log(`${c.blue}Files scanned:${c.reset} ${allFiles.length}\n`);

  let totalHits = 0;
  const offendingFiles = [];

  for (const absPath of allFiles) {
    const hits = scanFile(absPath);
    if (hits.length === 0) continue;

    const relPath = relative(ROOT, absPath);
    offendingFiles.push({ relPath, hits });
    totalHits += hits.length;

    // Print per-file matches immediately
    console.log(`${c.red}✗ ${relPath}${c.reset}`);
    for (const { line, col, string } of hits) {
      console.log(`    ${c.yellow}line ${line}, col ${col}:${c.reset} "${string}"`);
    }
    console.log();
  }

  if (totalHits === 0) {
    console.log(`${c.green}✅ No prohibited strings found. All clear!${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(
      `${c.red}${c.bold}❌ Found ${totalHits} prohibited string${totalHits === 1 ? '' : 's'} ` +
      `across ${offendingFiles.length} file${offendingFiles.length === 1 ? '' : 's'}.${c.reset}`
    );
    console.log(
      `${c.yellow}⚠️  Remove all "Freelance MERN", "MERN Stack Developer", and "Hire MERN" ` +
      `strings before publishing.${c.reset}\n`
    );
    process.exit(1);
  }
}

main();
