export function orderMethods(methods, preferredOrder = []) {
  const methodsById = new Map(methods.map((method) => [method.id, method]));
  const ordered = [];
  const included = new Set();
  for (const id of preferredOrder) {
    const method = methodsById.get(id);
    if (method && !included.has(method)) {
      ordered.push(method);
      included.add(method);
    }
  }
  return [...ordered, ...methods.filter((method) => !included.has(method))];
}

export async function runMethods(featureName, methods, context) {
  const logger = context.logger;

  for (const method of methods) {
    logger.debug(`Trying method "${method.name}" for "${featureName}".`);

    try {
      const result = await method.run(context);
      if (result?.applied) {
        logger.debug(`Method "${method.name}" applied for "${featureName}".`);
        return { applied: true, method: method.name, result };
      }

      logger.warn(`Method "${method.name}" did not apply for "${featureName}"; trying the next method.`);
    } catch (error) {
      logger.warn(`Method "${method.name}" failed for "${featureName}"; trying the next method.`, error);
    }
  }

  logger.error(`No method could apply feature "${featureName}".`);
  return { applied: false, method: null };
}