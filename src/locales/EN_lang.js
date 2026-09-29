export default {
  code: 'EN',
  name: 'English',
  strings: {
    settingsLabel: 'Bing Enhanced settings',
    searchResultsNewTab: 'Open search results in a new tab',
    searchResultsCurrentTab: 'Open search results in the current tab',
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
      description: 'Open supported Bing video results directly on YouTube.',
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
      description: 'Open supported Bing Video results directly on YouTube.',
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
      name: 'Bing tabs in the current window',
      description: 'Open the Images, Videos, Maps, News, and Flights tabs in the current window from search results.',
    },
    'search-result-opening': {
      name: 'Search result opening behavior',
      description: 'Choose whether Bing search results open in a new or the current tab.',
      settings: {
        openInNewTab: {
          label: 'Open search results in a new tab',
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