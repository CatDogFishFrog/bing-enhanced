import { subscribeLanguage, translate } from './localization.js';

const DEBUG_STORAGE_KEY = 'bing-enhanced:debug-logging';
let debugEnabled = false;
let menuCommandId;

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
    if (debugEnabled) console.trace('[Bing Enhanced]', ...args);
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

function registerDebugMenuCommand() {
  try {
    if (menuCommandId !== undefined && typeof GM_unregisterMenuCommand === 'function') {
      GM_unregisterMenuCommand(menuCommandId);
    }
    menuCommandId = GM_registerMenuCommand(
      translate(debugEnabled ? 'debugMenuOn' : 'debugMenuOff'),
      () => {
        debugEnabled = !debugEnabled;
        try {
          GM_setValue(DEBUG_STORAGE_KEY, debugEnabled);
        } catch (error) {
          logger.error('Could not save the debug logging setting.', error);
        }
        logger.info(translate(debugEnabled ? 'debugEnabled' : 'debugDisabled'));
        registerDebugMenuCommand();
      },
    );
  } catch (error) {
    logger.warn('Could not register the debug logging menu command.', error);
  }
}

export function installDebugToggle() {
  registerDebugMenuCommand();
  subscribeLanguage(() => registerDebugMenuCommand());
  logger.info(translate('debugState', { state: translate(debugEnabled ? 'on' : 'off') }));
}