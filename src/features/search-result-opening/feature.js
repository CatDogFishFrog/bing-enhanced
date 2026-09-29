const SEARCH_RESULT_LINK_SELECTOR = '#b_results a[href]';

function isUnmodifiedLeftClick(event) {
  return event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
    && !event.defaultPrevented;
}

export function handleSearchResultClick(event, openInNewTab, logger) {
  if (openInNewTab || !isUnmodifiedLeftClick(event)) return false;

  const link = event.target?.closest?.(SEARCH_RESULT_LINK_SELECTOR);
  if (!link || link.getAttribute('target')?.toLowerCase() !== '_blank') return false;

  link.removeAttribute('target');
  logger.debug('Opening a Bing search result in the current tab.', { href: link.href });
  return true;
}

export const searchResultOpening = {
  id: 'search-result-opening',
  name: 'Search result opening behavior',
  description: 'Choose whether Bing search results open in a new or the current tab.',
  settings: [{
    key: 'openInNewTab',
    type: 'toggle',
    label: 'Open search results in a new tab',
    defaultValue: true,
    toolbarToggle: {
      trueLabel: 'searchResultsNewTab',
      falseLabel: 'searchResultsCurrentTab',
      trueIcon: 'M14 4h6v6M20 4l-9 9M18 13v6H4V5h6',
      falseIcon: 'M4 5h16v14H4zM8 12h8m-3-3 3 3-3 3',
    },
  }],
  matches() {
    return location.pathname === '/search';
  },
  start({ logger, settings }) {
    const onClick = (event) => handleSearchResultClick(event, settings.openInNewTab, logger);
    document.addEventListener('click', onClick, true);
    logger.info(`Opening Bing search results in a ${settings.openInNewTab ? 'new' : 'current'} tab.`);
    return {
      applied: true,
      cleanup() {
        document.removeEventListener('click', onClick, true);
      },
    };
  },
};