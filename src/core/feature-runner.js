import {
  normalizeFeatureConfiguration,
  normalizeSettingValue,
} from "./feature-settings.js";

const SETTINGS_STORAGE_KEY = "bing-enhanced:feature-settings";

function featureId(feature) {
  return feature?.id || feature?.name || "unknown-feature";
}

function defaultStorage() {
  return {
    get() {
      return typeof GM_getValue === "function"
        ? GM_getValue(SETTINGS_STORAGE_KEY, {})
        : {};
    },
    set(value) {
      if (typeof GM_setValue === "function")
        GM_setValue(SETTINGS_STORAGE_KEY, value);
    },
  };
}

export function createFeatureManager(features, context = {}) {
  const logger = context.logger || {
    debug() {},
    info() {},
    warn() {},
    error(...args) {
      console.error(...args);
    },
  };
  const storage = context.storage || defaultStorage();
  const runtime = new Map();
  let stored = {};

  try {
    stored = storage.get() || {};
  } catch (error) {
    logger.warn("Could not load feature settings; using defaults.", error);
  }

  for (const feature of features) {
    const id = featureId(feature);
    let configuration;
    let configurationError = null;
    try {
      configuration = normalizeFeatureConfiguration(feature, stored[id]);
    } catch (error) {
      configuration = { enabled: true, settings: {} };
      configurationError = error;
      logger.error(
        `[Bing Enhanced] Feature "${id}" has invalid settings metadata.`,
        error,
      );
    }
    runtime.set(id, {
      feature,
      configuration,
      configurationError,
      status: configurationError ? "error" : "pending",
      error: configurationError?.message || null,
      cleanup: null,
      operation: Promise.resolve(),
    });
  }

  const listeners = new Set();

  function notify() {
    const state = getFeaturesState();
    for (const listener of listeners) {
      try {
        listener(state);
      } catch (error) {
        logger.warn("A feature settings listener failed.", error);
      }
    }
  }

  function persist() {
    const value = Object.fromEntries(
      [...runtime].map(([id, entry]) => [id, entry.configuration]),
    );
    try {
      storage.set(value);
    } catch (error) {
      logger.error("Could not save feature settings.", error);
    }
  }

  function getFeaturesState() {
    return [...runtime].map(([id, entry]) => ({
      id,
      name: entry.feature?.name || id,
      description: entry.feature?.description || "",
      enabled: entry.configuration.enabled,
      settings: entry.configurationError
        ? []
        : Array.isArray(entry.feature?.settings)
          ? entry.feature.settings
          : [],
      values: { ...entry.configuration.settings },
      status: entry.status,
      error: entry.error,
    }));
  }

  function enqueue(entry, operation) {
    const nextOperation = entry.operation.then(operation, operation);
    entry.operation = nextOperation.catch((error) => {
      logger.error(
        `[Bing Enhanced] Feature "${featureId(entry.feature)}" operation failed.`,
        error,
      );
    });
    return entry.operation;
  }

  async function stopEntry(entry) {
    if (!entry.cleanup) return;
    try {
      await entry.cleanup();
    } catch (error) {
      logger.error(
        `Feature "${entry.feature.name}" failed during cleanup.`,
        error,
      );
    }
    entry.cleanup = null;
  }

  async function startEntry(entry) {
    const feature = entry.feature;
    const name = feature?.name || featureId(feature);
    entry.error = null;

    if (entry.configurationError) {
      entry.status = "error";
      entry.error =
        entry.configurationError.message ||
        "Invalid feature settings metadata.";
      notify();
      return;
    }

    if (!entry.configuration.enabled) {
      entry.status = "disabled";
      notify();
      return;
    }

    try {
      if (typeof feature?.start !== "function") {
        throw new TypeError("Feature must provide a start() function.");
      }
      if (typeof feature.matches === "function" && !feature.matches(context)) {
        entry.status = "not-applicable";
        logger.debug(`Skipping feature "${name}" on this route.`);
        notify();
        return;
      }

      entry.status = "starting";
      notify();
      logger.info(`Starting feature "${name}".`);
      const result = await feature.start({
        ...context,
        settings: { ...entry.configuration.settings },
      });

      if (result?.applied === false) {
        entry.status = "error";
        entry.error = "No implementation method could be applied.";
      } else {
        entry.status = "running";
        entry.cleanup = result?.cleanup || result?.result?.cleanup || null;
        logger.info(`Feature "${name}" started.`);
      }
    } catch (error) {
      entry.status = "error";
      entry.error = error?.message || String(error);
      logger.error(
        `[Bing Enhanced] Feature "${name}" failed during startup; other features will continue.`,
        error,
      );
    }
    notify();
  }

  async function start() {
    await Promise.all(
      [...runtime.values()].map((entry) =>
        enqueue(entry, () => startEntry(entry)),
      ),
    );
    return getFeaturesState();
  }

  function setEnabled(id, enabled) {
    const entry = runtime.get(id);
    if (!entry || typeof enabled !== "boolean") return;
    return enqueue(entry, async () => {
      entry.configuration.enabled = enabled;
      persist();
      await stopEntry(entry);
      await startEntry(entry);
    });
  }

  function setSetting(id, key, value) {
    const entry = runtime.get(id);
    const definition = entry?.feature?.settings?.find(
      (setting) => setting.key === key,
    );
    if (!entry || !definition) return;

    return enqueue(entry, async () => {
      entry.configuration.settings[key] = normalizeSettingValue(
        definition,
        value,
      );
      persist();
      if (entry.configuration.enabled && entry.status === "running") {
        await stopEntry(entry);
        await startEntry(entry);
        return;
      }
      notify();
    });
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { start, getFeaturesState, setEnabled, setSetting, subscribe };
}

export function startFeatures(features, context = {}) {
  return createFeatureManager(features, context).start();
}
