import assert from 'node:assert/strict';
import test from 'node:test';
import { orderMethods, runMethods } from './method-runner.js';

function createLogger() {
  const entries = [];
  return {
    entries,
    info: (...args) => entries.push(['info', ...args]),
    warn: (...args) => entries.push(['warn', ...args]),
    error: (...args) => entries.push(['error', ...args]),
    debug() {},
  };
}

test('a failed method falls back and stops after the first applied method', async () => {
  const logger = createLogger();
  const attempted = [];
  const result = await runMethods('sample feature', [
    {
      name: 'injection',
      async run() {
        attempted.push('injection');
        throw new Error('blocked');
      },
    },
    {
      name: 'post-processing',
      run() {
        attempted.push('post-processing');
        return { applied: true };
      },
    },
    {
      name: 'unused-fallback',
      run() {
        attempted.push('unused-fallback');
        return { applied: true };
      },
    },
  ], { logger });

  assert.deepEqual(attempted, ['injection', 'post-processing']);
  assert.equal(result.method, 'post-processing');
  assert.equal(result.applied, true);
  assert.ok(logger.entries.some((entry) => entry[0] === 'warn' && String(entry[1]).includes('injection')));
});

test('method order honors configured preference and retains omitted fallbacks', () => {
  const methods = [
    { id: 'post-processing', name: 'Post-processing' },
    { id: 'injection', name: 'Injection' },
    { id: 'observer', name: 'Observer' },
  ];

  assert.deepEqual(
    orderMethods(methods, ['injection', 'post-processing', 'missing']),
    [methods[1], methods[0], methods[2]],
  );
});