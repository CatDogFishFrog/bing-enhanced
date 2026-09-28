import assert from 'node:assert/strict';
import test from 'node:test';
import { startFeatures } from './feature-runner.js';

test('startup failures are reported without preventing other features', async () => {
  const originalError = console.error;
  const errors = [];
  const started = [];
  console.error = (...args) => errors.push(args);

  try {
    await startFeatures([
      {
        name: 'sync-failure',
        start() {
          throw new Error('sync failure');
        },
      },
      {
        name: 'working-feature',
        start() {
          started.push('working-feature');
        },
      },
      {
        name: 'async-failure',
        async start() {
          throw new Error('async failure');
        },
      },
    ]);
  } finally {
    console.error = originalError;
  }

  assert.deepEqual(started, ['working-feature']);
  assert.equal(errors.length, 2);
  assert.match(errors[0][0], /sync-failure/);
  assert.match(errors[1][0], /async-failure/);
});