import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const legacyFiles = [
  'src/components/Login.js',
  'src/components/Trivia.js',
  'src/components/ui/**',
  'src/data/triviaQuestions.js',
  'src/hooks/useAnalytics.js',
  'src/reportWebVitals.js',
  'src/services/analyticsService.js',
  'src/services/authService.js',
  'src/utils/icons.js',
];

export default [
  { ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', ...legacyFiles] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'api/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['src/**/*.test.js', 'src/setupTests.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.vitest } },
  },
];
