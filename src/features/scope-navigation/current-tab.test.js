import assert from 'node:assert/strict';
import test from 'node:test';
import { handleScopeNavigationClick } from './current-tab.js';

function createLink(target = '_blank') {
  return {
    href: 'https://www.bing.com/images/search?q=test',
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
      closest() {
        return link;
      },
    },
    ...overrides,
  };
}

function createLogger() {
  const entries = [];
  return { entries, debug: (...args) => entries.push(args) };
}

test('removes the new-window target for an ordinary scope-tab click', () => {
  const link = createLink();
  const logger = createLogger();

  assert.equal(handleScopeNavigationClick(createEvent(link), logger), true);
  assert.equal(link.target, null);
  assert.equal(logger.entries.length, 1);
});

test('leaves modified clicks and middle clicks unchanged', () => {
  for (const overrides of [
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
    { defaultPrevented: true },
  ]) {
    const link = createLink();
    assert.equal(handleScopeNavigationClick(createEvent(link, overrides), createLogger()), false);
    assert.equal(link.target, '_blank');
  }
});

test('leaves unrelated links and links without a blank target unchanged', () => {
  const unrelatedLink = createLink();
  const unrelatedEvent = createEvent(unrelatedLink);
  unrelatedEvent.target.closest = () => null;
  assert.equal(handleScopeNavigationClick(unrelatedEvent, createLogger()), false);
  assert.equal(unrelatedLink.target, '_blank');

  const sameTabLink = createLink('_self');
  assert.equal(handleScopeNavigationClick(createEvent(sameTabLink), createLogger()), false);
  assert.equal(sameTabLink.target, '_self');
});