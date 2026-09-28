const LANGUAGE_STORAGE_KEY = 'bing-enhanced:language';
const localeModules = import.meta.glob('../locales/*_lang.js', {
  eager: true,
  import: 'default',
});

export const locales = Object.values(localeModules)
  .filter((locale) => locale && typeof locale.code === 'string')
  .sort((left, right) => left.code.localeCompare(right.code));

const englishLocale = locales.find((locale) => locale.code === 'EN') || locales[0];
const localeByCode = new Map(locales.map((locale) => [locale.code, locale]));
const storedLanguage = (() => {
  try {
    return GM_getValue(LANGUAGE_STORAGE_KEY, '');
  } catch {
    return '';
  }
})();
const browserLanguage = globalThis.navigator?.language?.slice(0, 2).toUpperCase();
const initialLanguage = localeByCode.has(storedLanguage)
  ? storedLanguage
  : localeByCode.has(browserLanguage) ? browserLanguage : englishLocale?.code;
let activeLocale = localeByCode.get(initialLanguage) || englishLocale;
const listeners = new Set();

export function translate(key, variables = {}) {
  const value = activeLocale?.strings?.[key] ?? englishLocale?.strings?.[key] ?? key;
  return value.replace(/\{(\w+)\}/g, (match, name) => String(variables[name] ?? match));
}

export function translateFeature(feature) {
  const base = englishLocale?.features?.[feature.id];
  const translated = activeLocale?.features?.[feature.id];
  if (!base && !translated) return feature;

  return {
    ...feature,
    name: translated?.name ?? base?.name ?? feature.name,
    description: translated?.description ?? base?.description ?? feature.description,
    settings: feature.settings?.map((setting) => {
      const baseSetting = base?.settings?.[setting.key];
      const translatedSetting = translated?.settings?.[setting.key];
      const settingTranslation = translatedSetting || baseSetting;
      if (!settingTranslation) return setting;
      return {
        ...setting,
        ...settingTranslation,
        options: setting.options?.map((option) => ({
          ...option,
          label: settingTranslation.options?.[option.value] ?? option.label,
        })),
      };
    }),
  };
}

export function getLanguage() {
  return activeLocale?.code ?? 'EN';
}

export function setLanguage(code) {
  const nextLocale = localeByCode.get(code);
  if (!nextLocale || nextLocale === activeLocale) return;
  activeLocale = nextLocale;
  try {
    GM_setValue(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // Keep the current language for this page even when storage is unavailable.
  }
  for (const listener of listeners) listener(code);
}

export function subscribeLanguage(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}