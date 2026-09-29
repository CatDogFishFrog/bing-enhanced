import assert from 'node:assert/strict';
import test from 'node:test';
import { getResultSurface, handleResultClick, searchResultOpening } from './feature.js';

const resultSurfaces = [
  { pathname: '/search', settingKey: 'openInNewTab', selector: '#b_results a[href][target="_blank"]' },
  { pathname: '/videos/search', settingKey: 'openVideoResultsInNewTab', selector: '#vm_c a.mc_vtvc_link[href]' },
  { pathname: '/news/search', settingKey: 'openNewsResultsInNewTab', selector: '#main .news-card a.title[href], #main .news-card a.imagelink[href]' },
];

function createLink(target = '_blank') {
  return {
    href: 'https://example.com/result',
    target,
    getAttribute(name) {
      return name === 'target' ? this.target : null;
    },
    removeAttribute(name) {
      if (name === 'target') this.target = null;
    },
  };
}

function createEvent(link, selector, overrides = {}) {
  return {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopImmediatePropagation() {
      this.immediatePropagationStopped = true;
    },
    target: {
      closest(candidate) {
        return candidate === selector ? link : null;
      },
    },
    ...overrides,
  };
}

function createLogger() {
  const entries = [];
  return { entries, debug: (...args) => entries.push(args) };
}

test('matches the three result routes and selectors', () => {
  for (const surface of resultSurfaces) {
    assert.deepEqual(
      (({ settingKey, linkSelector }) => ({ settingKey, linkSelector }))(getResultSurface(surface.pathname)),
      { settingKey: surface.settingKey, linkSelector: surface.selector },
    );
  }
  assert.equal(getResultSurface('/images/search'), null);
});

test('declares three independent new-tab defaults and route-scoped toolbar toggles', () => {
  const settings = Object.fromEntries(searchResultOpening.settings.map((setting) => [setting.key, setting]));
  assert.deepEqual(Object.keys(settings), [
    'openInNewTab',
    'openVideoResultsInNewTab',
    'openNewsResultsInNewTab',
  ]);

  for (const surface of resultSurfaces) {
    const setting = settings[surface.settingKey];
    assert.equal(setting.defaultValue, true);
    assert.deepEqual(setting.toolbarToggle.routes, [surface.pathname.split('/')[1] === 'search' ? '/search' : `/${surface.pathname.split('/')[1]}`]);
    assert.equal(typeof setting.toolbarToggle.trueIcon, 'string');
    assert.equal(typeof setting.toolbarToggle.falseIcon, 'string');
  }
});

test('uses each surface setting only for its own result links', () => {
  for (const surface of resultSurfaces) {
    const link = createLink(surface.settingKey === 'openVideoResultsInNewTab' ? null : '_blank');
    const logger = createLogger();
    const settings = {
      openInNewTab: true,
      openVideoResultsInNewTab: true,
      openNewsResultsInNewTab: true,
      [surface.settingKey]: false,
    };

    let currentUrl = null;
    let newTabUrl = null;
    const event = createEvent(link, surface.selector);
    assert.equal(handleResultClick(event, surface.pathname, settings, logger, {
      openInNewTab(url) {
        newTabUrl = url;
      },
      openInCurrentTab(url) {
        currentUrl = url;
      },
    }), true);
    assert.equal(currentUrl, link.href);
    assert.equal(newTabUrl, null);
    assert.equal(event.defaultPrevented, true);
    assert.equal(event.immediatePropagationStopped, true);
    assert.equal(logger.entries.length, 1);
  }
});

test('opens each surface in a new tab when selected, even without a blank target', () => {
  for (const surface of resultSurfaces) {
    const link = createLink(surface.settingKey === 'openVideoResultsInNewTab' ? null : '_blank');
    const event = createEvent(link, surface.selector);
    let newTabUrl = null;
    assert.equal(handleResultClick(event, surface.pathname, {}, createLogger(), {
      openInNewTab(url) {
        newTabUrl = url;
      },
      openInCurrentTab() {
        assert.fail('Current-tab navigation should not be used.');
      },
    }), true);
    assert.equal(newTabUrl, link.href);
    assert.equal(event.defaultPrevented, true);
  }
});

test('preserves modified clicks, unrelated links, and non-blank targets', () => {
  const { pathname, selector } = resultSurfaces[0];
  const settings = { openInNewTab: false };
  for (const overrides of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
    const link = createLink();
    assert.equal(handleResultClick(createEvent(link, selector, overrides), pathname, settings, createLogger()), false);
    assert.equal(link.target, '_blank');
  }

  const unrelatedLink = createLink();
  const unrelatedEvent = createEvent(unrelatedLink, selector);
  unrelatedEvent.target.closest = () => null;
  assert.equal(handleResultClick(unrelatedEvent, pathname, settings, createLogger()), false);
  assert.equal(unrelatedLink.target, '_blank');

  const sameTabLink = createLink('_self');
  let currentUrl = null;
  assert.equal(handleResultClick(createEvent(sameTabLink, selector), pathname, settings, createLogger(), {
    openInNewTab() {
      assert.fail('Current-tab navigation should not open a new tab.');
    },
    openInCurrentTab(url) {
      currentUrl = url;
    },
  }), true);
  assert.equal(currentUrl, sameTabLink.href);
  assert.equal(sameTabLink.target, '_self');
});