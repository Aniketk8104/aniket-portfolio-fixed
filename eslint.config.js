import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

// Clean globals to remove any with whitespace issues
const cleanGlobals = Object.fromEntries(
  Object.entries(globals.browser).filter(([key]) => key.trim() === key)
);

// Shared base configuration for all files
// This ensures rules don't drift between JS and TS configurations
const sharedConfig = {
  settings: { 
    react: { version: '18.3' } 
  },
  plugins: {
    react,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    // Base JavaScript rules
    ...js.configs.recommended.rules,
    // React rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
    // React Hooks rules
    ...reactHooks.configs.recommended.rules,
    // Custom overrides
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};

export default [
  { ignores: ['dist'] },

  // ── Legacy JSX components (src/components/**/*.jsx, src/utils/*.jsx)
  // These are pre-existing files that are not part of the TS migration.
  // Relax prop-types, display-name, and unused-vars for legacy code.
  {
    files: [
      'src/components/**/*.{js,jsx}',
      'src/utils/*.{js,jsx}',
      'src/App.jsx',
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...cleanGlobals,
        process: 'readonly',
        dataLayer: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    ...sharedConfig,
    rules: {
      ...sharedConfig.rules,
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'no-unused-vars': 'warn',
      'react/no-unknown-property': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  // ── Test files (*.test.*, *.pbt.test.*) — allow looser rules
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.pbt.test.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...cleanGlobals,
        IdleRequestCallback: 'readonly',
        IdleDeadline: 'readonly',
        RequestIdleCallbackHandle: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    ...sharedConfig,
    rules: {
      ...sharedConfig.rules,
      'react/display-name': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },

  // ── TypeScript test files that use @typescript-eslint rules
  {
    files: ['**/*.test.{ts,tsx}', '**/*.pbt.test.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      globals: cleanGlobals,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      ...sharedConfig.plugins,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...sharedConfig.rules,
      ...tseslint.configs.recommended.rules,
      'react/display-name': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
    settings: sharedConfig.settings,
  },

  // ── Regular JavaScript/JSX (non-legacy, non-test) files
  {
    files: ['**/*.{js,jsx}'],
    ignores: [
      'src/components/**',
      'src/utils/*.{js,jsx}',
      'src/App.jsx',
      '**/*.test.*',
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: cleanGlobals,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    ...sharedConfig,
  },
  
  // ── TypeScript/TSX source files (non-test)
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.*', '**/*.pbt.test.*', 'vitest.config.ts'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      globals: cleanGlobals,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      ...sharedConfig.plugins,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Inherit all shared rules
      ...sharedConfig.rules,
      // Add TypeScript-specific rules
      ...tseslint.configs.recommended.rules,
      // Allow explicit any in a few specific cases
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
      // prop-types is redundant when TypeScript is used
      'react/prop-types': 'off',
    },
    settings: sharedConfig.settings,
  },
];
