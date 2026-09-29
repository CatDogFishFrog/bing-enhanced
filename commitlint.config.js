export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'docs',
        'test',
        'ci',
        'build',
        'style',
        'chore',
        'refactor',
        'revert',
        'deps',
      ],
    ],
  },
};