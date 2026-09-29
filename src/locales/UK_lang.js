export default {
  code: 'UK',
  name: 'Українська',
  strings: {
    settingsLabel: 'Налаштування Bing Enhanced',
    searchResultsNewTab: 'Відкривати результати загального пошуку в новій вкладці',
    searchResultsCurrentTab: 'Відкривати результати загального пошуку в поточній вкладці',
    videoResultsNewTab: 'Відкривати результати відео в новій вкладці',
    videoResultsCurrentTab: 'Відкривати результати відео в поточній вкладці',
    newsResultsNewTab: 'Відкривати новинні дописи в новій вкладці',
    newsResultsCurrentTab: 'Відкривати новинні дописи в поточній вкладці',
    dialogTitle: 'Налаштування модулів',
    close: 'Закрити',
    closeSettings: 'Закрити налаштування',
    language: 'Мова',
    pending: 'Очікує запуску',
    starting: 'Запускається',
    running: 'Працює',
    disabled: 'Вимкнено',
    notApplicable: 'Не для цієї сторінки',
    error: 'Помилка',
    unknownStatus: 'Невідомий стан',
    moveUp: 'Перемістити вище',
    moveDown: 'Перемістити нижче',
    unsupportedSetting: 'Непідтримуваний тип налаштування.',
    disableModule: 'Вимкнути модуль',
    enableModule: 'Увімкнути модуль',
    disable: 'Вимкнути',
    enable: 'Увімкнути',
    noModules: 'Немає зареєстрованих модулів.',
    debugMenuOn: 'Налагодження: УВІМКНЕНО',
    debugMenuOff: 'Налагодження: ВИМКНЕНО',
    debugEnabled: 'Докладне логування увімкнено.',
    debugDisabled: 'Докладне логування вимкнено.',
    debugState: 'Докладне логування: {state}.',
    on: 'УВІМКНЕНО',
    off: 'ВИМКНЕНО',
  },
  features: {
    'video-links-search': {
      name: 'Відеопосилання в пошуку Bing',
      description: 'Відкриває підтримувані відеорезультати Bing безпосередньо на YouTube.',
      settings: {
        methodOrder: {
          label: 'Порядок методів',
          description: 'Якщо з’являться додаткові способи обробки, вони запускатимуться в заданому порядку до першого успішного.',
          options: { 'dom-post-processing': 'Обробка готових результатів у DOM' },
        },
      },
    },
    'video-links-video-page': {
      name: 'Відеопосилання на сторінці Bing Video',
      description: 'Відкриває підтримувані відеорезультати Bing Video безпосередньо на YouTube.',
      settings: {
        methodOrder: {
          label: 'Порядок методів',
          description: 'Якщо з’являться додаткові способи обробки, вони запускатимуться в заданому порядку до першого успішного.',
          options: { 'dom-post-processing': 'Обробка готових результатів у DOM' },
        },
      },
    },
    'video-links-tiktok': {
      name: 'Відеопосилання TikTok у Bing',
      description: 'Відкриває відеорезультати TikTok у Bing безпосередньо на TikTok.',
    },
    'scope-navigation-current-tab': {
      name: 'Вкладки розділів Bing у поточній вкладці',
      description: 'Перехід з основної вкладки загального пошуку до вкладок «Відео», «Зображення», «Карти», «Новини» та «Рейси» відкриває розділ у цій самій вкладці, а не в новому вікні.',
    },
    'search-result-opening': {
      name: 'Відкриття результатів пошуку',
      description: 'Окремо визначає, чи відкривати результати загального пошуку, відео та новин у новій або поточній вкладці.',
      settings: {
        openInNewTab: {
          label: 'Відкривати результати загального пошуку в новій вкладці',
          description: 'Керує посиланнями на вкладці загального пошуку.',
        },
        openVideoResultsInNewTab: {
          label: 'Відкривати результати відео в новій вкладці',
          description: 'Керує відеорезультатами на вкладці «Відео».',
        },
        openNewsResultsInNewTab: {
          label: 'Відкривати новинні дописи в новій вкладці',
          description: 'Керує новинними дописами на вкладці «Новини».',
        },
      },
    },
    'bing-link-unwrapper': {
      name: 'Прямі посилання на результати пошуку',
      description: 'Відкриває результати пошуку напряму, оминаючи проміжні посилання Bing для аналітики.',
      settings: {
        replaceExternalLinks: {
          label: 'Замінювати зовнішні посилання',
          description: 'Замінювати посилання Bing на інші сайти прямими адресами.',
        },
        replaceInternalBingLinks: {
          label: 'Замінювати внутрішні посилання',
          description: 'Замінювати перенаправлення на інші сторінки Bing прямими адресами.',
        },
      },
    },
  },
};