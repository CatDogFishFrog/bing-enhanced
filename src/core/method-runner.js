export async function runMethods(featureName, methods, context) {
  const logger = context.logger;

  for (const method of methods) {
    logger.info(`Trying method "${method.name}" for "${featureName}".`);

    try {
      const result = await method.run(context);
      if (result?.applied) {
        logger.info(`Method "${method.name}" applied for "${featureName}".`);
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