export default [
  {
    files: ['src/**/*.js', 'tools/**/*.js', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Blob: 'readonly',
        console: 'readonly',
        clearTimeout: 'readonly',
        crypto: 'readonly',
        document: 'readonly',
        Element: 'readonly',
        HTMLScriptElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        location: 'readonly',
        Node: 'readonly',
        MutationObserver: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        window: 'readonly',
        GM_deleteValue: 'readonly',
        GM_getValue: 'readonly',
        GM_registerMenuCommand: 'readonly',
        GM_setValue: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
];