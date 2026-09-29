const RESULT_SURFACES = [
  {
    route: '/search',
    settingKey: 'openInNewTab',
    linkSelector: '#b_results a[href][target="_blank"]',
    logName: 'search results',
  },
  {
    route: '/videos',
    settingKey: 'openVideoResultsInNewTab',
    linkSelector: '#vm_c a.mc_vtvc_link[href]',
    logName: 'video results',
  },
  {
    route: '/news',
    settingKey: 'openNewsResultsInNewTab',
    linkSelector: '#main .news-card a.title[href], #main .news-card a.imagelink[href]',
    logName: 'news posts',
  },
];

function matchesRoute(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function getResultSurface(pathname) {
  return RESULT_SURFACES.find((surface) => matchesRoute(pathname, surface.route)) || null;
}

function isUnmodifiedLeftClick(event) {
  return event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
    && !event.defaultPrevented;
}

export function handleResultClick(event, pathname, settings, logger, navigation = {}) {
  const surface = getResultSurface(pathname);
  if (!surface || !isUnmodifiedLeftClick(event)) return false;

  const link = event.target?.closest?.(surface.linkSelector);
  if (!link) return false;

  const openInNewTab = settings[surface.settingKey] !== false;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (openInNewTab) {
    (navigation.openInNewTab || ((url) => window.open(url, '_blank', 'noopener')))(link.href);
  } else {
    (navigation.openInCurrentTab || ((url) => window.location.assign(url)))(link.href);
  }
  logger.debug(`Opening Bing ${surface.logName} in a ${openInNewTab ? 'new' : 'current'} tab.`, { href: link.href });
  return true;
}

export const searchResultOpening = {
  id: 'search-result-opening',
  name: 'Search result opening behavior',
  description: 'Choose independently whether search, video, and news results open in a new or the current tab.',
  settings: [
    {
      key: 'openInNewTab',
      type: 'toggle',
      label: 'Open general search results in a new tab',
      description: 'Controls links on the general search results tab.',
      defaultValue: true,
      toolbarToggle: {
        routes: ['/search'],
        trueLabel: 'searchResultsNewTab',
        falseLabel: 'searchResultsCurrentTab',
        trueIcon: 'M14 4h6v6M20 4l-9 9M18 13v6H4V5h6',
        falseIcon: 'M4 5h16v14H4zM8 12h8m-3-3 3 3-3 3',
      },
    },
    {
      key: 'openVideoResultsInNewTab',
      type: 'toggle',
      label: 'Open video results in a new tab',
      description: 'Controls video results on the Videos tab.',
      defaultValue: true,
      toolbarToggle: {
        routes: ['/videos'],
        trueLabel: 'videoResultsNewTab',
        falseLabel: 'videoResultsCurrentTab',
        trueIcon: 'M14 4h6v6M20 4l-9 9M18 13v6H4V5h6',
        falseIcon: 'M4 5h16v14H4zM8 12h8m-3-3 3 3-3 3',
      },
    },
    {
      key: 'openNewsResultsInNewTab',
      type: 'toggle',
      label: 'Open news posts in a new tab',
      description: 'Controls news posts on the News tab.',
      defaultValue: true,
      toolbarToggle: {
        routes: ['/news'],
        trueLabel: 'newsResultsNewTab',
        falseLabel: 'newsResultsCurrentTab',
        trueIcon: 'M14 4h6v6M20 4l-9 9M18 13v6H4V5h6',
        falseIcon: 'M4 5h16v14H4zM8 12h8m-3-3 3 3-3 3',
      },
    },
  ],
  matches() {
    return getResultSurface(location.pathname) !== null;
  },
  start({ logger, settings }) {
    const onClick = (event) => handleResultClick(event, location.pathname, settings, logger);
    document.addEventListener('click', onClick, true);
    const surface = getResultSurface(location.pathname);
    logger.info(`Opening Bing ${surface.logName} in a ${settings[surface.settingKey] ? 'new' : 'current'} tab.`);
    return {
      applied: true,
      cleanup() {
        document.removeEventListener('click', onClick, true);
      },
    };
  },
};