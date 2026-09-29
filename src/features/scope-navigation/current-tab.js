const SCOPE_LINK_SELECTOR = [
  '#b-scopeListItem-images a',
  '#b-scopeListItem-video a',
  '#b-scopeListItem-local a',
  '#b-scopeListItem-news a',
  '#b-scopeListItem-flights a',
].join(', ');

function isUnmodifiedLeftClick(event) {
  return event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
    && !event.defaultPrevented;
}

export function handleScopeNavigationClick(event, logger) {
  if (!isUnmodifiedLeftClick(event)) return false;

  const link = event.target?.closest?.(SCOPE_LINK_SELECTOR);
  if (!link || link.getAttribute('target')?.toLowerCase() !== '_blank') return false;

  link.removeAttribute('target');
  logger.debug('Navigating from general search to a Bing section in the current tab.', { href: link.href });
  return true;
}

export const scopeNavigationCurrentTab = {
  id: 'scope-navigation-current-tab',
  name: 'Bing section tabs open in the current tab',
  description: 'From the main general-search tab, open the Videos, Images, Maps, News, and Flights sections in the current tab instead of a new window.',
  matches() {
    return location.pathname === '/search';
  },
  start({ logger }) {
    const onClick = (event) => handleScopeNavigationClick(event, logger);
    document.addEventListener('click', onClick, true);
    logger.info('Bing section tabs selected from general search will stay in the current tab.');
    return {
      applied: true,
      cleanup() {
        document.removeEventListener('click', onClick, true);
      },
    };
  },
};