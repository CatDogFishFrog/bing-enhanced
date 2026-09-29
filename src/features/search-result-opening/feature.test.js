import assert from 'node:assert/strict';
import test from 'node:test';
import { handleSearchResultClick, searchResultOpening } from './feature.js';

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

function createEvent(link, overrides = {}) {
  return {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    target: {
      closest(selector) {
        return selector === '#b_results a[href]' ? link : null;
      },
    },
    ...overrides,
  };
}

function createLogger() {
  const entries = [];
  return { entries, debug: (...args) => entries.push(args) };
}

test('declares the new-tab default and a generic toolbar toggle', () => {
  assert.equal(searchResultOpening.settings[0].defaultValue, true);
  assert.equal(typeof searchResultOpening.settings[0].toolbarToggle.trueIcon, 'string');
  assert.equal(typeof searchResultOpening.settings[0].toolbarToggle.falseIcon, 'string');
});

test('opens search results in the current tab when selected', () => {
  const link = createLink();
  const logger = createLogger();

  assert.equal(handleSearchResultClick(createEvent(link), false, logger), true);
  assert.equal(link.target, null);
  assert.equal(logger.entries.length, 1);
});

test('keeps Bing new-tab behavior by default', () => {
  const link = createLink();

  assert.equal(handleSearchResultClick(createEvent(link), true, createLogger()), false);
  assert.equal(link.target, '_blank');
});

test('preserves modified clicks, unrelated links, and non-blank targets', () => {
  for (const overrides of [
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
    { defaultPrevented: true },
  ]) {
    const link = createLink();
    assert.equal(handleSearchResultClick(createEvent(link, overrides), false, createLogger()), false);
    assert.equal(link.target, '_blank');
  }

  const unrelatedLink = createLink();
  const unrelatedEvent = createEvent(unrelatedLink);
  unrelatedEvent.target.closest = () => null;
  assert.equal(handleSearchResultClick(unrelatedEvent, false, createLogger()), false);
  assert.equal(unrelatedLink.target, '_blank');

  const sameTabLink = createLink('_self');
  assert.equal(handleSearchResultClick(createEvent(sameTabLink), false, createLogger()), false);
  assert.equal(sameTabLink.target, '_self');
});