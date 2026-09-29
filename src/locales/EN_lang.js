export default {
  code: 'EN',
  name: 'English',
  strings: {
    settingsLabel: 'Bing Enhanced settings',
    searchResultsNewTab: 'Open general search results in a new tab',
    searchResultsCurrentTab: 'Open general search results in the current tab',
    videoResultsNewTab: 'Open video results in a new tab',
    videoResultsCurrentTab: 'Open video results in the current tab',
    newsResultsNewTab: 'Open news posts in a new tab',
    newsResultsCurrentTab: 'Open news posts in the current tab',
    dialogTitle: 'Module settings',
    close: 'Close',
    closeSettings: 'Close settings',
    language: 'Language',
    pending: 'Pending',
    starting: 'Starting',
    running: 'Running',
    disabled: 'Disabled',
    notApplicable: 'Not applicable on this page',
    error: 'Error',
    unknownStatus: 'Unknown status',
    moveUp: 'Move up',
    moveDown: 'Move down',
    unsupportedSetting: 'Unsupported setting type.',
    disableModule: 'Disable module',
    enableModule: 'Enable module',
    disable: 'Disable',
    enable: 'Enable',
    noModules: 'No registered modules.',
    debugMenuOn: 'Debug logging: ON',
    debugMenuOff: 'Debug logging: OFF',
    debugEnabled: 'Debug logging enabled.',
    debugDisabled: 'Debug logging disabled.',
    debugState: 'Debug logging is {state}.',
    on: 'ON',
    off: 'OFF',
  },
  features: {
    'video-links-search': {
      name: 'Bing search video links',
       description: 'When a Bing video result links to YouTube, open it directly on YouTube.',
      settings: {
        methodOrder: {
          label: 'Method order',
          description: 'If more processing methods are added, they will run in this order until one succeeds.',
          options: { 'dom-post-processing': 'Process rendered results in the DOM' },
        },
      },
    },
    'video-links-video-page': {
      name: 'Bing video page links',
       description: 'When a Bing Videos result links to YouTube, open it directly on YouTube.',
      settings: {
        methodOrder: {
          label: 'Method order',
          description: 'If more processing methods are added, they will run in this order until one succeeds.',
          options: { 'dom-post-processing': 'Process rendered results in the DOM' },
        },
      },
    },
    'video-links-tiktok': {
      name: 'Bing TikTok video links',
      description: 'Open Bing TikTok video results directly on TikTok.',
    },
    'scope-navigation-current-tab': {
      name: 'Bing section tabs open in the current tab',
      description: 'From the main general-search tab, open the Videos, Images, Maps, News, and Flights sections in the current tab instead of a new window.',
    },
    'search-result-opening': {
      name: 'Search result opening behavior',
      description: 'Choose independently whether general search results, video results, and news posts open in a new or the current tab.',
      settings: {
        openInNewTab: {
          label: 'Open general search results in a new tab',
          description: 'Controls links on the general search results tab.',
        },
        openVideoResultsInNewTab: {
          label: 'Open video results in a new tab',
          description: 'Controls video results on the Videos tab.',
        },
        openNewsResultsInNewTab: {
          label: 'Open news posts in a new tab',
          description: 'Controls news posts on the News tab.',
        },
      },
    },
    'bing-link-unwrapper': {
      name: 'Direct search-result links',
      description: 'Open all search-result links directly instead of routing through Bing\'s intermediate analytics redirects.',
      settings: {
        replaceExternalLinks: {
          label: 'Replace external links',
          description: 'Replace Bing redirect links that lead to other websites.',
        },
        replaceInternalBingLinks: {
          label: 'Replace internal links',
          description: 'Replace Bing redirect links that lead to another Bing page.',
        },
      },
    },
  },
};