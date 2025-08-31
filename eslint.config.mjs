// Flat ESLint config for ESLint v9 (no Next wrapper). Covers TS, React, a11y, imports.
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import a11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      '.turbo/**',
      'coverage/**',
      'public/**/*.min.*',
      // Config and build scripts that shouldn't be linted by TS project service
      'eslint.config.mjs',
      'postcss.config.mjs',
      'tailwind.config.js',
      'tailwind.config.ts',
      'scripts/validateEnv.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': a11y,
      import: importPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
        // Allow non-project files (like config .mjs) to be linted without TS project association
        allowDefaultProject: true,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'import/order': ['warn', { 'newlines-between': 'always', groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Ensure the rule used in code comments exists; we can tune later
      '@next/next/no-img-element': 'warn',
    },
  },
]
