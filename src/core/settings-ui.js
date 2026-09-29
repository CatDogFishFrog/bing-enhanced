import {
  getLanguage,
  locales,
  setLanguage,
  subscribeLanguage,
  translate,
  translateFeature,
} from './localization.js';

const SETTINGS_ROUTES = ['/search', '/videos', '/images', '/news'];
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const styles = `
  :host {
    --be-surface: var(--smtc-background-web-page-primary, #fff);
    --be-control-surface: var(--smtc-background-ctrl-subtle-rest, var(--be-surface));
    --be-foreground: var(--smtc-foreground-content-neutral-primary, #292827);
    --be-foreground-secondary: var(--smtc-foreground-content-neutral-secondary, #616161);
    --be-divider: var(--smtc-stroke-divider-subtle, rgb(0 0 0 / 12%));
    display: inline-flex;
    height: 44px;
    flex: 0 0 auto;
    margin-inline-start: 4px;
    vertical-align: middle;
    color: var(--be-foreground);
    font: 14px "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  button, input, select { font: inherit; }
  button { color: inherit; }
  .gear, .toolbar-toggle {
    display: grid;
    width: 44px;
    height: 44px;
    padding: 0;
    place-items: center;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
  }
  .gear:hover, .toolbar-toggle:hover, .icon-button:hover { background: var(--cardsbk2, var(--smtc-background-ctrl-subtle-hover, #f3f3f3)); }
  .toolbar-toggle:disabled { cursor: default; opacity: .45; }
  button:focus-visible, input:focus-visible, select:focus-visible {
    outline: 2px solid #0078d4;
    outline-offset: 2px;
  }
  svg { display: block; width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .backdrop {
    position: fixed;
    z-index: 2147483646;
    inset: 0;
    display: grid;
    align-items: start;
    justify-items: center;
    overflow: auto;
    padding: max(8vh, 24px) 16px 24px;
    background: rgb(0 0 0 / 38%);
  }
  .dialog {
    width: min(560px, 100%);
    max-height: 84vh;
    overflow: auto;
    border: 1px solid var(--be-divider);
    border-radius: 8px;
    background: var(--be-surface);
    color: var(--be-foreground);
    box-shadow: 0 12px 36px rgb(0 0 0 / 24%);
  }
  .dialog-header, .module-header, .method-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .dialog-header { padding: 20px 22px 16px; border-bottom: 1px solid var(--be-divider); flex-wrap: wrap; }
  .language-picker { display: flex; align-items: center; gap: 8px; color: var(--be-foreground-secondary); font-size: 13px; }
  .language-picker .select-control { width: auto; min-width: 112px; }
  h1 { margin: 0; font-size: 20px; font-weight: 600; }
  .icon-button {
    display: grid;
    width: 36px;
    height: 36px;
    flex: 0 0 auto;
    place-items: center;
    border: 0;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
  }
  .modules { padding: 4px 22px 18px; }
  .module { padding: 18px 0; border-bottom: 1px solid var(--be-divider); }
  .module:last-child { border-bottom: 0; }
  .module-header { align-items: flex-start; }
  h2 { margin: 0; font-size: 16px; font-weight: 600; }
  .description, .field-description, .error { margin: 5px 0 0; color: var(--be-foreground-secondary); font-size: 13px; line-height: 1.4; }
  .status { display: block; margin-top: 7px; color: var(--be-foreground-secondary); font-size: 12px; }
  .error { color: var(--smtc-status-danger-tint-foreground, #a4262c); }
  .toggle { position: relative; display: inline-flex; width: 42px; height: 24px; flex: 0 0 auto; }
  .toggle input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .track { width: 42px; height: 24px; border: 1px solid var(--smtc-stroke-ctrl-on-neutral-rest, #777); border-radius: 12px; background: var(--smtc-background-ctrl-subtle-hover, #777); transition: background-color .15s ease; }
  .track::after { display: block; width: 16px; height: 16px; margin: 3px; border-radius: 50%; background: white; content: ""; transition: transform .15s ease; }
  .toggle input:checked + .track { border-color: #0078d4; background: #0078d4; }
  .toggle input:checked + .track::after { transform: translateX(18px); }
  .toggle input:focus-visible + .track { outline: 2px solid #0078d4; outline-offset: 2px; }
  .fields { display: grid; gap: 16px; margin-top: 17px; }
  .field-label { display: block; margin-bottom: 6px; font-weight: 600; }
  .text-control, .select-control { width: 100%; min-height: 36px; padding: 6px 9px; border: 1px solid var(--smtc-ctrl-input-stroke-rest, #8a8886); border-radius: 4px; background: var(--be-control-surface); color: var(--be-foreground); }
  .number-control { width: 112px; min-height: 36px; padding: 6px 9px; border: 1px solid var(--smtc-ctrl-input-stroke-rest, #8a8886); border-radius: 4px; background: var(--be-control-surface); color: var(--be-foreground); }
  .method-list { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
  .method-row { min-height: 36px; padding: 4px 6px 4px 10px; border: 1px solid var(--be-divider); border-radius: 4px; }
  .method-actions { display: inline-flex; gap: 2px; }
  .method-actions button { display: grid; width: 30px; height: 30px; place-items: center; border: 0; border-radius: 3px; background: transparent; cursor: pointer; }
  .method-actions button:disabled { cursor: default; opacity: .35; }
  .method-actions svg { width: 16px; height: 16px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; } }
  @media (max-width: 520px) {
    .backdrop { padding: 0; }
    .dialog { width: 100%; min-height: 100%; max-height: none; border: 0; border-radius: 0; }
    .dialog-header { padding-inline: 16px; }
    .modules { padding-inline: 16px; }
  }
`;

function isSettingsRoute(pathname) {
  return SETTINGS_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function matchesToolbarRoute(pathname, routes) {
  return !Array.isArray(routes)
    || routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function makeIcon(pathData) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NAMESPACE, 'path');
  path.setAttribute('d', pathData);
  svg.append(path);
  return svg;
}

function createSettingsHost(manager) {
  const host = document.createElement('span');
  host.setAttribute('data-bing-enhanced-settings', '');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = makeElement('style', '', styles);
  const gear = makeElement('button', 'gear');
  gear.type = 'button';
  gear.setAttribute('aria-label', translate('settingsLabel'));
  gear.title = translate('settingsLabel');
  gear.append(makeIcon('M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-6v2m0 15v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z'));
  shadow.append(style, gear);
  const toolbarButtons = new Map();

  function updateToolbarToggles(features = manager.getFeaturesState()) {
    const activeControls = new Set();
    for (const feature of features) {
      if (!feature.enabled || !['starting', 'running'].includes(feature.status)) continue;
      for (const setting of feature.settings) {
        if (setting.type !== 'toggle'
          || !setting.toolbarToggle
          || !matchesToolbarRoute(location.pathname, setting.toolbarToggle.routes)) continue;
        const controlId = JSON.stringify([feature.id, setting.key]);
        activeControls.add(controlId);
        let button = toolbarButtons.get(controlId);
        if (!button) {
          button = makeElement('button', 'toolbar-toggle');
          button.type = 'button';
          button.dataset.toolbarToggle = controlId;
          button.dataset.featureId = feature.id;
          button.dataset.settingKey = setting.key;
          button.addEventListener('click', () => {
            const { featureId, settingKey } = button.dataset;
            const currentFeature = manager.getFeaturesState().find((item) => item.id === featureId);
            if (currentFeature?.enabled) {
              void manager.setSetting(featureId, settingKey, currentFeature.values[settingKey] !== true);
            }
          });
          toolbarButtons.set(controlId, button);
        }
        const enabled = feature.values[setting.key] === true;
        const labelKey = enabled ? setting.toolbarToggle.trueLabel : setting.toolbarToggle.falseLabel;
        const label = translate(labelKey);
        button.title = label;
        button.setAttribute('aria-label', label);
        button.replaceChildren(makeIcon(enabled ? setting.toolbarToggle.trueIcon : setting.toolbarToggle.falseIcon));
      }
    }

    for (const [controlId, button] of toolbarButtons) {
      if (!activeControls.has(controlId)) {
        button.remove();
        toolbarButtons.delete(controlId);
      }
    }
    let previousButton = gear;
    for (const button of toolbarButtons.values()) {
      previousButton.after(button);
      previousButton = button;
    }
  }

  let backdrop = null;
  let previouslyFocused = null;

  function closeDialog() {
    backdrop?.remove();
    backdrop = null;
    if (previouslyFocused?.isConnected) previouslyFocused.focus();
  }

  function statusText(status) {
    return translate(({
      pending: 'pending',
      starting: 'starting',
      running: 'running',
      disabled: 'disabled',
      'not-applicable': 'notApplicable',
      error: 'error',
    })[status] || 'unknownStatus');
  }

  function renderMethodOrder(setting, value, featureId) {
    const list = makeElement('ol', 'method-list');
    for (const [index, methodId] of value.entries()) {
      const option = (setting.options || []).find((item) => item.value === methodId);
      if (!option) continue;
      const item = makeElement('li', 'method-row');
      item.append(makeElement('span', '', option.label));
      const actions = makeElement('span', 'method-actions');
      for (const [direction, label, iconPath] of [
        [-1, translate('moveUp'), 'm7 14 5-5 5 5'],
        [1, translate('moveDown'), 'm7 10 5 5 5-5'],
      ]) {
        const button = makeElement('button', '');
        button.type = 'button';
        button.title = label;
        button.setAttribute('aria-label', `${label}: ${option.label}`);
        button.disabled = index + direction < 0 || index + direction >= value.length;
        button.append(makeIcon(iconPath));
        button.addEventListener('click', async () => {
          const reordered = [...value];
          [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]];
          await manager.setSetting(featureId, setting.key, reordered);
          refreshDialog(`${featureId}:${setting.key}`);
        });
        actions.append(button);
      }
      item.append(actions);
      list.append(item);
    }
    return list;
  }

  function renderField(setting, feature) {
    const field = makeElement('div', 'field');
    const fieldId = `${feature.id}:${setting.key}`;
    const label = makeElement(setting.type === 'method-order' ? 'p' : 'label', 'field-label', setting.label);
    if (setting.type !== 'method-order') label.htmlFor = fieldId;
    field.append(label);

    let control;
    if (setting.type === 'toggle') {
      control = makeElement('input', '');
      control.type = 'checkbox';
      control.checked = feature.values[setting.key] === true;
      control.setAttribute('aria-label', setting.label);
      control.addEventListener('change', () => manager.setSetting(feature.id, setting.key, control.checked));
    } else if (setting.type === 'select') {
      control = makeElement('select', 'select-control');
      for (const option of setting.options || []) {
        const item = makeElement('option', '', option.label);
        item.value = option.value;
        control.append(item);
      }
      control.value = feature.values[setting.key];
      control.addEventListener('change', () => manager.setSetting(feature.id, setting.key, control.value));
    } else if (setting.type === 'text' || setting.type === 'number') {
      control = makeElement('input', setting.type === 'number' ? 'number-control' : 'text-control');
      control.type = setting.type;
      control.value = feature.values[setting.key] ?? '';
      if (setting.type === 'number') {
        if (setting.min !== undefined) control.min = setting.min;
        if (setting.max !== undefined) control.max = setting.max;
        if (setting.step !== undefined) control.step = setting.step;
      } else {
        control.maxLength = setting.maxLength || 2000;
        if (setting.placeholder) control.placeholder = setting.placeholder;
      }
      control.addEventListener('change', () => {
        const value = setting.type === 'number' ? control.valueAsNumber : control.value;
        manager.setSetting(feature.id, setting.key, value);
      });
    } else if (setting.type === 'method-order') {
      field.append(renderMethodOrder(setting, feature.values[setting.key] || [], feature.id));
    } else {
      field.append(makeElement('p', 'field-description', translate('unsupportedSetting')));
    }

    if (control) {
      control.id = fieldId;
      control.dataset.settingControl = fieldId;
      if (setting.type === 'toggle') {
        const toggle = makeElement('label', 'toggle');
        toggle.append(control, makeElement('span', 'track'));
        field.append(toggle);
      } else {
        field.append(control);
      }
    }
    if (setting.description) field.append(makeElement('p', 'field-description', setting.description));
    return field;
  }

  function renderDialog(focusKey = null) {
    if (!backdrop) return;
    const dialog = makeElement('section', 'dialog');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'bing-enhanced-settings-title');
    dialog.tabIndex = -1;

    const header = makeElement('header', 'dialog-header');
    header.append(makeElement('h1', '', translate('dialogTitle')));
    header.firstElementChild.id = 'bing-enhanced-settings-title';
    const languageLabel = makeElement('label', 'language-picker');
    languageLabel.append(makeElement('span', '', translate('language')));
    const languageSelect = makeElement('select', 'select-control');
    languageSelect.setAttribute('aria-label', translate('language'));
    for (const locale of locales) {
      const option = makeElement('option', '', locale.name);
      option.value = locale.code;
      languageSelect.append(option);
    }
    languageSelect.value = getLanguage();
    languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
    languageLabel.append(languageSelect);
    header.append(languageLabel);
    const close = makeElement('button', 'icon-button');
    close.type = 'button';
    close.title = translate('close');
    close.setAttribute('aria-label', translate('closeSettings'));
    close.append(makeIcon('m6 6 12 12M18 6 6 18'));
    close.addEventListener('click', closeDialog);
    header.append(close);
    dialog.append(header);

    const modules = makeElement('div', 'modules');
    for (const rawFeature of manager.getFeaturesState()) {
      const feature = translateFeature(rawFeature);
      const module = makeElement('section', 'module');
      const moduleHeader = makeElement('div', 'module-header');
      const text = makeElement('div', '');
      text.append(makeElement('h2', '', feature.name));
      if (feature.description) text.append(makeElement('p', 'description', feature.description));
      const status = makeElement('span', 'status', statusText(feature.status));
      status.dataset.featureStatus = feature.id;
      text.append(status);
      const toggleLabel = makeElement('label', 'toggle');
      toggleLabel.title = translate(feature.enabled ? 'disableModule' : 'enableModule');
      const toggle = makeElement('input', '');
      toggle.type = 'checkbox';
      toggle.checked = feature.enabled;
      toggle.setAttribute('aria-label', `${translate(feature.enabled ? 'disable' : 'enable')}: ${feature.name}`);
      toggle.dataset.featureToggle = feature.id;
      toggle.addEventListener('change', () => manager.setEnabled(feature.id, toggle.checked));
      toggleLabel.append(toggle, makeElement('span', 'track'));
      moduleHeader.append(text, toggleLabel);
      module.append(moduleHeader);

      const error = makeElement('p', 'error', feature.error || '');
      error.hidden = !feature.error;
      error.dataset.featureError = feature.id;
      module.append(error);

      if (feature.settings.length > 0) {
        const fields = makeElement('div', 'fields');
        for (const setting of feature.settings) fields.append(renderField(setting, feature));
        module.append(fields);
      }
      modules.append(module);
    }
    if (manager.getFeaturesState().length === 0) {
      modules.append(makeElement('p', 'description', translate('noModules')));
    }
    dialog.append(modules);
    backdrop.replaceChildren(dialog);

    if (focusKey) {
      [...dialog.querySelectorAll('[data-setting-control]')]
        .find((control) => control.dataset.settingControl === focusKey)
        ?.focus();
    }
  }

  function refreshDialog(focusKey) {
    if (!backdrop) return;
    renderDialog(focusKey);
  }

  function updateStatuses(features) {
    updateToolbarToggles(features);
    if (!backdrop) return;
    for (const feature of features) {
      const displayFeature = translateFeature(feature);
      const status = [...shadow.querySelectorAll('[data-feature-status]')]
        .find((element) => element.dataset.featureStatus === feature.id);
      if (status) status.textContent = statusText(feature.status);
      const error = [...shadow.querySelectorAll('[data-feature-error]')]
        .find((element) => element.dataset.featureError === feature.id);
      if (error) {
        error.textContent = feature.error || '';
        error.hidden = !feature.error;
      }
      const toggle = [...shadow.querySelectorAll('[data-feature-toggle]')]
        .find((element) => element.dataset.featureToggle === feature.id);
      if (toggle) {
        toggle.checked = feature.enabled;
        toggle.setAttribute('aria-label', `${translate(feature.enabled ? 'disable' : 'enable')}: ${displayFeature.name}`);
        toggle.parentElement.title = translate(feature.enabled ? 'disableModule' : 'enableModule');
      }
    }
  }

  function openDialog() {
    if (backdrop) return;
    previouslyFocused = shadow.activeElement;
    backdrop = makeElement('div', 'backdrop');
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeDialog();
    });
    backdrop.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
      }
      if (event.key !== 'Tab') return;
      const focusable = [...backdrop.querySelectorAll('button, input, select')]
        .filter((element) => !element.disabled);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && shadow.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && shadow.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    shadow.append(backdrop);
    renderDialog();
    const dialog = shadow.querySelector('.dialog');
    const firstControl = dialog?.querySelector('button:not(:disabled), input:not(:disabled), select:not(:disabled)');
    (firstControl || dialog)?.focus();
  }

  gear.addEventListener('click', openDialog);
  const unsubscribe = manager.subscribe(updateStatuses);
  const unsubscribeLanguage = subscribeLanguage(() => {
    gear.setAttribute('aria-label', translate('settingsLabel'));
    gear.title = translate('settingsLabel');
    updateToolbarToggles();
    refreshDialog();
  });
  return {
    host,
    refreshToolbarToggles: updateToolbarToggles,
    destroy() {
      unsubscribe();
      unsubscribeLanguage();
      host.remove();
      closeDialog();
    },
  };
}

export function startSettingsUI(manager, logger = console) {
  let settingsHost = null;
  let observedRoots = [];
  let scrollFrame = null;
  const observer = new MutationObserver(syncSafely);

  function syncSafely() {
    try {
      sync();
    } catch (error) {
      logger.error('The module settings interface encountered an error.', error);
    }
  }

  function getActiveSearchForm() {
    const miniHeader = document.querySelector('#miniheader');
    const miniForm = miniHeader?.querySelector('form#sb_form');
    const miniStyle = miniHeader ? window.getComputedStyle(miniHeader) : null;
    if (miniForm
      && miniHeader.getAttribute('aria-hidden') !== 'true'
      && miniStyle.display !== 'none'
      && miniStyle.visibility !== 'hidden') {
      return miniForm;
    }
    return document.querySelector('#b_header form#sb_form')
      || document.querySelector('form#sb_form');
  }

  function observeHeaders() {
    const roots = [...document.querySelectorAll('#b_header, #miniheader')];
    if (roots.length === 0 && document.documentElement) roots.push(document.documentElement);
    if (roots.length === observedRoots.length
      && roots.every((root, index) => root === observedRoots[index])) return;
    observer.disconnect();
    for (const root of roots) observer.observe(root, { childList: true, subtree: true });
    observedRoots = roots;
  }

  function sync() {
    const routeAllowed = isSettingsRoute(location.pathname);
    const form = routeAllowed ? getActiveSearchForm() : null;
    const searchbox = routeAllowed ? form?.querySelector('.b_searchboxForm[role="search"]') : null;

    if (settingsHost && !routeAllowed) {
      settingsHost.destroy();
      settingsHost = null;
    }
    if (searchbox && form) {
      if (!settingsHost) settingsHost = createSettingsHost(manager);
      if (settingsHost.host.parentElement !== form || settingsHost.host.previousElementSibling !== searchbox) {
        searchbox.after(settingsHost.host);
      }
    } else {
      settingsHost?.host.remove();
    }

    observeHeaders();
  }

  function onScroll() {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = null;
      syncSafely();
      settingsHost?.refreshToolbarToggles();
    });
  }

  function onNavigation() {
    syncSafely();
    settingsHost?.refreshToolbarToggles();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('popstate', onNavigation);
  window.addEventListener('urlchange', onNavigation);
  syncSafely();

  return () => {
    observer.disconnect();
    if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('popstate', onNavigation);
    window.removeEventListener('urlchange', onNavigation);
    settingsHost?.destroy();
  };
}