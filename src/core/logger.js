const DEBUG_STORAGE_KEY = 'bing-enhanced:debug-logging';
let debugEnabled = false;

try {
  debugEnabled = GM_getValue(DEBUG_STORAGE_KEY, false) === true;
} catch {
  debugEnabled = false;
}

function write(method, args) {
  console[method]('[Bing Enhanced]', ...args);
}

export const logger = {
  debug(...args) {
    if (debugEnabled) write('debug', args);
  },
  info(...args) {
    write('info', args);
  },
  warn(...args) {
    write('warn', args);
  },
  error(...args) {
    write('error', args);
  },
};

export function installDebugToggle() {
  try {
    GM_registerMenuCommand('Toggle Bing Enhanced debug logging', () => {
      debugEnabled = !debugEnabled;
      try {
        GM_setValue(DEBUG_STORAGE_KEY, debugEnabled);
      } catch (error) {
        logger.error('Could not save the debug logging setting.', error);
      }

      logger.info(`Debug logging ${debugEnabled ? 'enabled' : 'disabled'}.`);
    });
  } catch (error) {
    logger.warn('Could not register the debug logging menu command.', error);
  }

  logger.info(`Debug logging is ${debugEnabled ? 'enabled' : 'disabled'}.`);
}