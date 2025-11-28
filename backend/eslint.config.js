import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{ts,js}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enforce explicit return types (per CLAUDE.md requirement)
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],

      // Enforce explicit module boundary types
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // Strict type safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Prevent unused variables (align with strict TS config)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Naming conventions (per CLAUDE.md patterns)
      '@typescript-eslint/naming-convention': [
        'error',
        // Functions: camelCase
        {
          selector: 'function',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Variables: camelCase or UPPER_CASE for constants
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // Types/Interfaces: PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // Enum members: PascalCase or UPPER_CASE
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
      ],

      // Require consistent type imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      // Prevent floating promises
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // General code quality
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      semi: ['error', 'always'],
    },
  },
]);
