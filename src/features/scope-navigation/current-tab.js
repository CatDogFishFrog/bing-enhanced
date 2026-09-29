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
  logger.debug('Opening a Bing scope tab in the current window.', { href: link.href });
  return true;
}

export const scopeNavigationCurrentTab = {
  id: 'scope-navigation-current-tab',
  name: 'Bing tabs in the current window',
  description: 'Open the Images, Videos, Maps, News, and Flights tabs in the current window from search results.',
  matches() {
    return location.pathname === '/search';
  },
  start({ logger }) {
    const onClick = (event) => handleScopeNavigationClick(event, logger);
    document.addEventListener('click', onClick, true);
    logger.info('Keeping Bing scope tabs in the current window on search results.');
    return {
      applied: true,
      cleanup() {
        document.removeEventListener('click', onClick, true);
      },
    };
  },
};