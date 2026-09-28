import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeFeatureConfiguration, normalizeSettingValue } from './feature-settings.js';

const methodOrderSetting = {
  key: 'methodOrder',
  type: 'method-order',
  label: 'Method order',
  defaultValue: ['post-processing', 'injection'],
  options: [
    { value: 'injection', label: 'Injection' },
    { value: 'post-processing', label: 'Post-processing' },
  ],
};

test('normalizes stored method order and appends new valid methods', () => {
  assert.deepEqual(
    normalizeSettingValue(methodOrderSetting, ['post-processing', 'unknown', 'post-processing']),
    ['post-processing', 'injection'],
  );
});

test('normalizes every field and enablement independently', () => {
  const feature = {
    settings: [
      { key: 'enabledOption', type: 'toggle', label: 'Extra toggle', defaultValue: true },
      { key: 'strategy', type: 'select', label: 'Strategy', defaultValue: 'first', options: [{ value: 'first', label: 'First' }, { value: 'second', label: 'Second' }] },
      { key: 'query', type: 'text', label: 'Query', defaultValue: '', maxLength: 5 },
      { key: 'limit', type: 'number', label: 'Limit', defaultValue: 4, min: 1, max: 8 },
    ],
  };

  assert.deepEqual(normalizeFeatureConfiguration(feature, {
    enabled: false,
    settings: { enabledOption: 'yes', strategy: 'unknown', query: 'toolong', limit: 99 },
  }), {
    enabled: false,
    settings: { enabledOption: true, strategy: 'first', query: 'toolo', limit: 4 },
  });
});