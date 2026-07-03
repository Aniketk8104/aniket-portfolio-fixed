#!/usr/bin/env node

/**
 * Token Parity Check Script
 * 
 * This script ensures that src/design-system/tokens.ts and src/assets/styles/tokens.css
 * are in sync. It parses both files and compares the keys to detect drift.
 * 
 * The design system tokens are defined in two places:
 * 1. tokens.css - CSS custom properties for runtime styling
 * 2. tokens.ts - TypeScript constants for computed styles and type safety
 * 
 * This script enforces that every CSS custom property has a corresponding
 * TypeScript constant, and vice versa. This prevents drift between the two
 * sources of truth.
 * 
 * Usage:
 *   npm run check:tokens        # Run manually
 *   npm run build               # Runs automatically via prebuild hook
 * 
 * Exit codes:
 * - 0: Parity check passed (all tokens in sync)
 * - 1: Parity check failed (drift detected)
 */

import { readFileSync } from 'fs';
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
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Parse CSS custom properties from tokens.css
 * @returns {Set<string>} Set of CSS variable names (without -- prefix)
 */
function parseCSSTokens() {
  const cssPath = join(rootDir, 'src/assets/styles/tokens.css');
  const cssContent = readFileSync(cssPath, 'utf-8');
  
  const tokens = new Set();
  
  // Match CSS custom properties: --token-name: value;
  const cssVarRegex = /--([a-z0-9-]+)\s*:/gi;
  let match;
  
  while ((match = cssVarRegex.exec(cssContent)) !== null) {
    tokens.add(match[1]);
  }
  
  return tokens;
}

/**
 * Parse TypeScript token exports from tokens.ts
 * @returns {Set<string>} Set of token keys in kebab-case format
 */
function parseTypeScriptTokens() {
  const tsPath = join(rootDir, 'src/design-system/tokens.ts');
  const tsContent = readFileSync(tsPath, 'utf-8');
  
  const tokens = new Set();
  
  // Map of TS object names to CSS prefixes
  const tokenMappings = {
    colors: 'color',
    fonts: 'font',
    fontSizes: 'font-size',
    lineHeights: 'line-height',
    spacing: 'space',
    radii: 'radius',
    shadows: 'shadow',
    durations: 'duration',
    easings: 'ease',
    distances: 'distance',
  };
  
  // Parse each token category
  for (const [objectName, cssPrefix] of Object.entries(tokenMappings)) {
    // Match object properties: propertyName: 'value',
    const objectRegex = new RegExp(
      `export const ${objectName}\\s*=\\s*\\{([^}]+)\\}`,
      's'
    );
    const objectMatch = tsContent.match(objectRegex);
    
    if (objectMatch) {
      const objectBody = objectMatch[1];
      // Match property names (camelCase or numeric)
      const propRegex = /^\s*(?:\/\/.*\n\s*)?(\w+):/gm;
      let propMatch;
      
      while ((propMatch = propRegex.exec(objectBody)) !== null) {
        const propName = propMatch[1];
        // Convert camelCase to kebab-case
        const kebabName = propName.replace(/([A-Z])/g, '-$1').toLowerCase();
        const cssVarName = `${cssPrefix}-${kebabName}`;
        tokens.add(cssVarName);
      }
    }
  }
  
  // Handle special case: glassSurface -> glass-surface
  if (tsContent.includes('export const glassSurface')) {
    tokens.add('glass-surface');
  }
  
  return tokens;
}

/**
 * Compare two sets and return differences
 */
function compareSets(cssTokens, tsTokens) {
  const inCSSOnly = new Set([...cssTokens].filter(t => !tsTokens.has(t)));
  const inTSOnly = new Set([...tsTokens].filter(t => !cssTokens.has(t)));
  
  return { inCSSOnly, inTSOnly };
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.cyan}🔍 Checking token parity...${colors.reset}\n`);
  
  try {
    const cssTokens = parseCSSTokens();
    const tsTokens = parseTypeScriptTokens();
    
    console.log(`${colors.blue}📊 Token counts:${colors.reset}`);
    console.log(`  CSS tokens: ${cssTokens.size}`);
    console.log(`  TS tokens:  ${tsTokens.size}\n`);
    
    const { inCSSOnly, inTSOnly } = compareSets(cssTokens, tsTokens);
    
    let hasErrors = false;
    
    if (inCSSOnly.size > 0) {
      hasErrors = true;
      console.log(`${colors.red}❌ Tokens in CSS but missing in TypeScript:${colors.reset}`);
      for (const token of [...inCSSOnly].sort()) {
        console.log(`  - --${token}`);
      }
      console.log();
    }
    
    if (inTSOnly.size > 0) {
      hasErrors = true;
      console.log(`${colors.red}❌ Tokens in TypeScript but missing in CSS:${colors.reset}`);
      for (const token of [...inTSOnly].sort()) {
        console.log(`  - --${token}`);
      }
      console.log();
    }
    
    if (hasErrors) {
      console.log(`${colors.red}❌ Token parity check FAILED${colors.reset}`);
      console.log(`${colors.yellow}⚠️  Please ensure tokens.css and tokens.ts are in sync.${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`${colors.green}✅ Token parity check PASSED${colors.reset}`);
      console.log(`${colors.green}   All tokens are in sync!${colors.reset}\n`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error during token parity check:${colors.reset}`);
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
