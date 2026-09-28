import { createFeatureManager } from './core/feature-runner.js';
import { features } from './features/index.js';
import { installDebugToggle, logger } from './core/logger.js';
import { startSettingsUI } from './core/settings-ui.js';

installDebugToggle();
logger.info(`Starting ${features.length} page features.`);
const featureManager = createFeatureManager(features, { logger });
void featureManager.start();

try {
	startSettingsUI(featureManager, logger);
} catch (error) {
	logger.error('The module settings interface failed to start.', error);
}