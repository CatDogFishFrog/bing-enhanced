async function startFeature(feature, context) {
  let name = 'unknown';

  try {
    name = feature?.name || name;
    if (typeof feature?.start !== 'function') {
      throw new TypeError('Feature must provide a start() function.');
    }

    if (typeof feature.matches === 'function' && !feature.matches(context)) {
      context?.logger?.debug(`Skipping feature "${name}" on this route.`);
      return;
    }

    context?.logger?.info(`Starting feature "${name}".`);
    await feature.start(context);
    context?.logger?.info(`Feature "${name}" started.`);
  } catch (error) {
    const log = context?.logger?.error || console.error;
    log(`[Bing Enhanced] Feature "${name}" failed during startup; other features will continue.`, error);
  }
}

export function startFeatures(features, context = {}) {
  return Promise.all(features.map((feature) => startFeature(feature, context)));
}