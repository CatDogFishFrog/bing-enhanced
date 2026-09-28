function cloneDefault(value) {
  return Array.isArray(value) ? [...value] : value;
}

function fallbackValue(setting) {
  if (setting.type === 'select' && !setting.options?.some((option) => option.value === setting.defaultValue)) {
    return setting.options?.[0]?.value;
  }
  return cloneDefault(setting.defaultValue);
}

export function normalizeSettingValue(setting, value) {
  if (setting.type === 'toggle') {
    return typeof value === 'boolean' ? value : fallbackValue(setting);
  }

  if (setting.type === 'select') {
    return setting.options?.some((option) => option.value === value)
      ? value
      : fallbackValue(setting);
  }

  if (setting.type === 'method-order') {
    const available = setting.options?.map((option) => option.value) || [];
    const requested = Array.isArray(value) ? value : [];
    return [
      ...new Set(requested.filter((entry) => available.includes(entry))),
      ...available.filter((entry) => !requested.includes(entry)),
    ];
  }

  if (setting.type === 'text') {
    return typeof value === 'string'
      ? value.slice(0, setting.maxLength || 2000)
      : fallbackValue(setting);
  }

  if (setting.type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return fallbackValue(setting);
    if (typeof setting.min === 'number' && value < setting.min) return fallbackValue(setting);
    if (typeof setting.max === 'number' && value > setting.max) return fallbackValue(setting);
    return value;
  }

  return fallbackValue(setting);
}

export function normalizeFeatureConfiguration(feature, stored = {}) {
  const definitions = feature?.settings ?? [];
  if (!Array.isArray(definitions)) {
    throw new TypeError('Feature settings must be an array.');
  }

  const storedSettings = stored?.settings && typeof stored.settings === 'object'
    ? stored.settings
    : {};
  const settings = {};
  const keys = new Set();

  for (const setting of definitions) {
    if (!setting || typeof setting.key !== 'string' || !setting.key || typeof setting.label !== 'string') {
      throw new TypeError('Every feature setting must have a key and label.');
    }
    if (keys.has(setting.key)) throw new TypeError(`Duplicate feature setting key: ${setting.key}`);
    keys.add(setting.key);
    if (['select', 'method-order'].includes(setting.type)) {
      const options = setting.options;
      if (!Array.isArray(options) || options.some((option) => (
        !option || typeof option.value !== 'string' || typeof option.label !== 'string'
      ))) {
        throw new TypeError(`Setting "${setting.key}" must define valid options.`);
      }
      const optionValues = options.map((option) => option.value);
      if (new Set(optionValues).size !== optionValues.length) {
        throw new TypeError(`Setting "${setting.key}" contains duplicate option values.`);
      }
    }
    settings[setting.key] = normalizeSettingValue(setting, storedSettings[setting.key]);
  }

  return {
    enabled: typeof stored?.enabled === 'boolean' ? stored.enabled : true,
    settings,
  };
}