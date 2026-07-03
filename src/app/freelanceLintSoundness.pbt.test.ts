/**
 * Property 30: Freelance-String Lint Soundness
 *
 * **Validates: Requirements 14.4, 20.5**
 *
 * For test fixtures with/without prohibited strings inserted, the scanner
 * exits non-zero iff at least one prohibited string is present.
 *
 * Strategy:
 *   - Extract the core scan logic (matching `check-freelance-strings.mjs`)
 *     inline so tests run entirely in-process without spawning subprocesses
 *     or touching the real `dist/` / `public/` directories.
 *   - Use fast-check to generate file contents with varying combinations of
 *     prohibited / neutral strings and assert the soundness invariant:
 *       hasProhibitedString(content) ↔ scanContent(content).length > 0
 *
 * @module app/freelanceLintSoundness.pbt.test
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');
const SCANNER_PATH = path.join(REPO_ROOT, 'scripts', 'check-freelance-strings.mjs');

// ---------------------------------------------------------------------------
// Prohibited strings — must match the scanner exactly (case-sensitive)
// ---------------------------------------------------------------------------

const PROHIBITED_STRINGS = [
  'Freelance MERN',
  'MERN Stack Developer',
  'Hire MERN',
] as const;

type ProhibitedString = (typeof PROHIBITED_STRINGS)[number];

// ---------------------------------------------------------------------------
// Core scan logic (mirrors check-freelance-strings.mjs, in-process)
// ---------------------------------------------------------------------------

interface ScanMatch {
  line: number;
  col: number;
  string: string;
}

/**
 * Scan a string of file content for prohibited strings.
 * Returns all matches found (line/col/string).
 * This mirrors the `scanFile` logic in check-freelance-strings.mjs.
 */
function scanContent(content: string): ScanMatch[] {
  const matches: ScanMatch[] = [];
  const lines = content.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    for (const str of PROHIBITED_STRINGS) {
      let searchFrom = 0;
      let col: number;
      while ((col = line.indexOf(str, searchFrom)) !== -1) {
        matches.push({ line: lineIdx + 1, col: col + 1, string: str });
        searchFrom = col + str.length;
      }
    }
  }

  return matches;
}

/**
 * Returns true iff the content contains at least one prohibited string.
 */
function hasProhibited(content: string): boolean {
  return PROHIBITED_STRINGS.some((s) => content.includes(s));
}

// ---------------------------------------------------------------------------
// Subprocess helper: run the scanner script against a temp directory
// ---------------------------------------------------------------------------

/**
 * Creates a temporary directory with a single file containing `content`,
 * then runs the real scanner script against that directory.
 *
 * The scanner is patched via an environment variable (SCAN_OVERRIDE_DIRS)
 * so it scans our temp dir instead of dist/public/src/content.
 *
 * Since the scanner does not support env-var overrides, we use a thin
 * wrapper approach: write the file into a real scan target (dist/tmp_test_*)
 * so the scanner can pick it up, then clean up afterwards.
 *
 * For cleanliness, the subprocess tests use a completely isolated approach:
 * they create a temp file inside `dist/` (which is a real scan target) with a
 * unique name, run the scanner, and then delete the file regardless of outcome.
 */
function runScannerOnTempFile(content: string): { exitCode: number; stdout: string } {
  // Create a uniquely-named temp file inside dist/ so the scanner picks it up.
  // If dist/ doesn't exist, create it for the test.
  const distDir = path.join(REPO_ROOT, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Use a name that matches *.test.* so the scanner SKIPS it — actually we want
  // the scanner to SCAN it (not skip). So we use a non-test filename.
  const tempFile = path.join(distDir, `_pbt_fixture_${Date.now()}_${Math.random().toString(36).slice(2)}.html`);

  try {
    fs.writeFileSync(tempFile, content, 'utf-8');

    let stdout = '';
    let exitCode = 0;
    try {
      stdout = execFileSync('node', [SCANNER_PATH], {
        encoding: 'utf-8',
        cwd: REPO_ROOT,
      });
      exitCode = 0;
    } catch (err: unknown) {
      const execErr = err as { status?: number; stdout?: string };
      exitCode = execErr.status ?? 1;
      stdout = execErr.stdout ?? '';
    }

    return { exitCode, stdout };
  } finally {
    // Always clean up
    try { fs.unlinkSync(tempFile); } catch { /* ignore */ }
  }
}

// ---------------------------------------------------------------------------
// fast-check arbitraries
// ---------------------------------------------------------------------------

/** Generates safe "neutral" content that contains none of the prohibited strings. */
const neutralContentArb = fc
  .array(
    fc.string({ minLength: 0, maxLength: 80 }).filter(
      (s) => PROHIBITED_STRINGS.every((p) => !s.includes(p)),
    ),
    { minLength: 0, maxLength: 20 },
  )
  .map((lines) => lines.join('\n'));

/** Generates a single prohibited string chosen from the list. */
const prohibitedStringArb: fc.Arbitrary<ProhibitedString> = fc.constantFrom(
  ...PROHIBITED_STRINGS,
);

/** Generates content that definitely contains exactly one prohibited string. */
const contentWithProhibitedArb = fc
  .tuple(neutralContentArb, prohibitedStringArb, neutralContentArb)
  .map(([before, prohibited, after]) => `${before}\n${prohibited}\n${after}`);

/** Generates content with multiple (1–3) prohibited strings. */
const contentWithMultipleProhibitedArb = fc
  .tuple(
    fc.array(prohibitedStringArb, { minLength: 1, maxLength: 3 }),
    neutralContentArb,
  )
  .map(([prohibited, padding]) =>
    prohibited.join('\n') + '\n' + padding,
  );

// ---------------------------------------------------------------------------
// Unit tests — in-process scanContent() logic
// ---------------------------------------------------------------------------

describe('Property 30: Freelance-String Lint Soundness — scanContent() logic', () => {
  /**
   * P30-a: scanContent() returns no matches for content with no prohibited strings.
   * (Soundness — no false positives)
   */
  it('P30-a (PBT): neutral content → zero scan matches (no false positives)', () => {
    fc.assert(
      fc.property(neutralContentArb, (content) => {
        const matches = scanContent(content);
        expect(
          matches,
          `Expected no matches for neutral content but got ${JSON.stringify(matches)}`,
        ).toHaveLength(0);
      }),
      { numRuns: 500 },
    );
  });

  /**
   * P30-b: scanContent() returns at least one match when content contains a
   * prohibited string. (Soundness — no false negatives)
   */
  it('P30-b (PBT): content with a prohibited string → at least one match (no false negatives)', () => {
    fc.assert(
      fc.property(contentWithProhibitedArb, (content) => {
        const matches = scanContent(content);
        expect(
          matches.length,
          `Expected ≥1 match in content containing a prohibited string, got 0.\nContent: ${content.slice(0, 200)}`,
        ).toBeGreaterThan(0);
      }),
      { numRuns: 500 },
    );
  });

  /**
   * P30-c: scanContent() finds all three prohibited strings when present.
   * Tests each string individually.
   */
  it('P30-c: each prohibited string is detected individually', () => {
    for (const prohibited of PROHIBITED_STRINGS) {
      const content = `Some neutral text\n${prohibited}\nMore neutral text`;
      const matches = scanContent(content);
      expect(
        matches.length,
        `Expected a match for "${prohibited}"`,
      ).toBeGreaterThan(0);
      expect(matches[0].string).toBe(prohibited);
    }
  });

  /**
   * P30-d: content without any prohibited strings → zero matches, regardless of
   * how many neutral lines are present.
   */
  it('P30-d: purely neutral content never triggers a match', () => {
    const neutralExamples = [
      '',
      'Hello World',
      'MERN is a technology stack', // partial — not "Freelance MERN"
      'hire mern', // wrong case
      'freelance mern', // wrong case
      'mern stack developer', // wrong case
      'Freelance', // incomplete
      'MERN', // incomplete
      'Stack Developer', // incomplete
      'Hire', // incomplete
      '<title>Software Engineer Portfolio</title>',
      '{"@type": "Person", "name": "Aniket Kushwaha"}',
    ];

    for (const content of neutralExamples) {
      const matches = scanContent(content);
      expect(
        matches,
        `Expected no matches for: "${content}"`,
      ).toHaveLength(0);
    }
  });

  /**
   * P30-e: Case-sensitivity — only exact-case matches are detected.
   * The scanner is case-sensitive per spec.
   */
  it('P30-e: scanner is case-sensitive — lowercase variants are NOT detected', () => {
    const caseVariants = [
      'freelance mern',
      'FREELANCE MERN',
      'mern stack developer',
      'MERN STACK DEVELOPER',
      'hire mern',
      'HIRE MERN',
    ];

    for (const variant of caseVariants) {
      const matches = scanContent(variant);
      expect(
        matches,
        `Expected no match for wrong-case variant: "${variant}"`,
      ).toHaveLength(0);
    }
  });

  /**
   * P30-f: Multiple occurrences on the same line are all reported.
   */
  it('P30-f: multiple occurrences on the same line are all found', () => {
    const line = 'Freelance MERN and also Freelance MERN';
    const matches = scanContent(line);
    expect(matches).toHaveLength(2);
    expect(matches[0].col).toBe(1);
    expect(matches[1].col).toBe(line.indexOf('Freelance MERN', 15) + 1);
  });

  /**
   * P30-g: Bidirectional invariant — hasProhibited(content) ↔ scanContent(content).length > 0
   * This is the core soundness property: the scanner detects exactly the
   * content that contains prohibited strings.
   */
  it('P30-g (PBT): soundness invariant — hasProhibited ↔ matches found', () => {
    // Test with both neutral and prohibited content interleaved
    const mixedArb = fc.oneof(neutralContentArb, contentWithProhibitedArb, contentWithMultipleProhibitedArb);

    fc.assert(
      fc.property(mixedArb, (content) => {
        const prohibited = hasProhibited(content);
        const matches = scanContent(content);
        const detected = matches.length > 0;
        expect(
          detected,
          `Soundness violation: hasProhibited=${prohibited} but detected=${detected}\nContent: ${content.slice(0, 300)}`,
        ).toBe(prohibited);
      }),
      { numRuns: 1000 },
    );
  });
});

// ---------------------------------------------------------------------------
// Integration tests — subprocess (real scanner script)
// ---------------------------------------------------------------------------

describe('Property 30: Freelance-String Lint Soundness — real scanner subprocess', () => {
  /**
   * P30-h: Scanner exits 0 for a fixture file with no prohibited strings.
   */
  it('P30-h: scanner exits 0 when fixture file has no prohibited strings', () => {
    const content = '<html><title>Software Engineer Portfolio</title><body>Hello World</body></html>';
    const { exitCode } = runScannerOnTempFile(content);
    expect(exitCode).toBe(0);
  });

  /**
   * P30-i: Scanner exits non-zero when fixture contains "Freelance MERN".
   */
  it('P30-i: scanner exits non-zero when fixture contains "Freelance MERN"', () => {
    const content = '<title>Freelance MERN Developer</title>';
    const { exitCode } = runScannerOnTempFile(content);
    expect(exitCode).not.toBe(0);
  });

  /**
   * P30-j: Scanner exits non-zero when fixture contains "MERN Stack Developer".
   */
  it('P30-j: scanner exits non-zero when fixture contains "MERN Stack Developer"', () => {
    const content = '<meta name="description" content="I am a MERN Stack Developer" />';
    const { exitCode } = runScannerOnTempFile(content);
    expect(exitCode).not.toBe(0);
  });

  /**
   * P30-k: Scanner exits non-zero when fixture contains "Hire MERN".
   */
  it('P30-k: scanner exits non-zero when fixture contains "Hire MERN"', () => {
    const content = '<h1>Hire MERN Stack Engineer</h1>';
    const { exitCode } = runScannerOnTempFile(content);
    expect(exitCode).not.toBe(0);
  });

  /**
   * P30-l: Files with *.test.* extension are SKIPPED by the scanner (allow rule).
   * A test fixture file containing prohibited strings but named *.test.* must
   * not cause a non-zero exit.
   */
  it('P30-l: *.test.* files are allowed — scanner does not flag them', () => {
    // This test file itself contains prohibited strings for documentation
    // purposes, and since it is named *.test.* the scanner must skip it.
    // We verify by checking the scanner against a temp *.test.html file.
    const distDir = path.join(REPO_ROOT, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const tempTestFile = path.join(
      distDir,
      `_pbt_test_fixture_${Date.now()}.test.html`,
    );
    const content = 'Freelance MERN Stack Developer content in a test file';

    try {
      fs.writeFileSync(tempTestFile, content, 'utf-8');

      let exitCode = 0;
      try {
        execFileSync('node', [SCANNER_PATH], { encoding: 'utf-8', cwd: REPO_ROOT });
        exitCode = 0;
      } catch (err: unknown) {
        const execErr = err as { status?: number };
        exitCode = execErr.status ?? 1;
      }

      // Scanner should exit 0 because *.test.* files are skipped
      expect(exitCode).toBe(0);
    } finally {
      try { fs.unlinkSync(tempTestFile); } catch { /* ignore */ }
    }
  });

  /**
   * P30-m: *.map files are SKIPPED by the scanner.
   * A fixture *.map file containing prohibited strings must not cause non-zero exit.
   */
  it('P30-m: *.map files are skipped — scanner does not flag them', () => {
    const distDir = path.join(REPO_ROOT, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const tempMapFile = path.join(
      distDir,
      `_pbt_map_fixture_${Date.now()}.js.map`,
    );
    const content = JSON.stringify({ mappings: '', sources: ['Freelance MERN'] });

    try {
      fs.writeFileSync(tempMapFile, content, 'utf-8');

      let exitCode = 0;
      try {
        execFileSync('node', [SCANNER_PATH], { encoding: 'utf-8', cwd: REPO_ROOT });
        exitCode = 0;
      } catch (err: unknown) {
        const execErr = err as { status?: number };
        exitCode = execErr.status ?? 1;
      }

      expect(exitCode).toBe(0);
    } finally {
      try { fs.unlinkSync(tempMapFile); } catch { /* ignore */ }
    }
  });
});

// ---------------------------------------------------------------------------
// Additional unit-level edge cases
// ---------------------------------------------------------------------------

describe('Property 30: Freelance-String Lint Soundness — edge cases', () => {
  /**
   * P30-n: Empty content → zero matches.
   */
  it('P30-n: empty content produces no matches', () => {
    expect(scanContent('')).toHaveLength(0);
  });

  /**
   * P30-o: Content with only whitespace/newlines → zero matches.
   */
  it('P30-o: whitespace-only content produces no matches', () => {
    expect(scanContent('   \n\t\n  ')).toHaveLength(0);
  });

  /**
   * P30-p: Match position (line/col) is correctly reported.
   */
  it('P30-p: match positions are correct (1-indexed line and col)', () => {
    const content = 'first line\nHire MERN developer\nthird line';
    const matches = scanContent(content);
    expect(matches).toHaveLength(1);
    expect(matches[0].line).toBe(2);
    expect(matches[0].col).toBe(1);
    expect(matches[0].string).toBe('Hire MERN');
  });

  /**
   * P30-q: Prohibited string in the middle of a line → col reflects correct position.
   */
  it('P30-q: col is correct when prohibited string is not at start of line', () => {
    const prefix = 'Prefix text here — ';
    const content = prefix + 'MERN Stack Developer';
    const matches = scanContent(content);
    expect(matches).toHaveLength(1);
    expect(matches[0].col).toBe(prefix.length + 1);
  });

  /**
   * P30-r: All three prohibited strings appearing on separate lines are all found.
   */
  it('P30-r: all three prohibited strings in one file are all detected', () => {
    const content = [
      'Freelance MERN developer available',
      'I am a MERN Stack Developer',
      'Hire MERN engineer today',
    ].join('\n');
    const matches = scanContent(content);
    expect(matches).toHaveLength(3);
    const detectedStrings = matches.map((m) => m.string);
    expect(detectedStrings).toContain('Freelance MERN');
    expect(detectedStrings).toContain('MERN Stack Developer');
    expect(detectedStrings).toContain('Hire MERN');
  });
});
