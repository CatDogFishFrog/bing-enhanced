import assert from 'node:assert/strict';
import test from 'node:test';
import { createFeatureManager, startFeatures } from './feature-runner.js';

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

test('feature settings persist and restart only their feature', async () => {
  const storage = {
    value: {},
    get() {
      return this.value;
    },
    set(value) {
      this.value = JSON.parse(JSON.stringify(value));
    },
  };
  const logger = { debug() {}, info() {}, warn() {}, error() {} };
  const starts = [];
  const cleanups = [];
  const manager = createFeatureManager([{
    id: 'sample',
    name: 'Sample module',
    settings: [{ key: 'strategy', type: 'select', label: 'Strategy', defaultValue: 'first', options: [
      { value: 'first', label: 'First' },
      { value: 'second', label: 'Second' },
    ] }],
    start({ settings }) {
      starts.push(settings.strategy);
      return { cleanup: () => cleanups.push(settings.strategy) };
    },
  }], { logger, storage });

  await manager.start();
  await manager.setSetting('sample', 'strategy', 'second');
  assert.deepEqual(starts, ['first', 'second']);
  assert.deepEqual(cleanups, ['first']);
  assert.equal(storage.value.sample.settings.strategy, 'second');

  await manager.setEnabled('sample', false);
  assert.deepEqual(cleanups, ['first', 'second']);
  assert.equal(manager.getFeaturesState()[0].status, 'disabled');
});

test('invalid metadata is isolated to its feature', async () => {
  const started = [];
  const logger = { debug() {}, info() {}, warn() {}, error() {} };
  const manager = createFeatureManager([
    {
      id: 'invalid',
      name: 'Invalid module',
      settings: [null],
      start() {
        started.push('invalid');
      },
    },
    {
      id: 'valid',
      name: 'Valid module',
      start() {
        started.push('valid');
      },
    },
  ], { logger, storage: { get: () => ({}), set() {} } });

  const states = await manager.start();

  assert.deepEqual(started, ['valid']);
  assert.equal(states[0].status, 'error');
  assert.deepEqual(states[0].settings, []);
  assert.equal(states[1].status, 'running');
});