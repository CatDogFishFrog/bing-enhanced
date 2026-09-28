import { startFeatures } from './core/feature-runner.js';
import { features } from './features/index.js';
import { installDebugToggle, logger } from './core/logger.js';

installDebugToggle();
logger.info(`Starting ${features.length} page features.`);
void startFeatures(features, { logger });