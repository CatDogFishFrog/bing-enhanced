export default {
  code: 'UK',
  name: 'Українська',
  strings: {
    settingsLabel: 'Налаштування Bing Enhanced',
    searchResultsNewTab: 'Відкривати результати пошуку в новій вкладці',
    searchResultsCurrentTab: 'Відкривати результати пошуку в поточній вкладці',
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
      name: 'Вкладки Bing у поточному вікні',
      description: 'Відкриває вкладки «Зображення», «Відео», «Карти», «Новини» та «Рейси» в поточному вікні зі сторінки пошуку.',
    },
    'search-result-opening': {
      name: 'Відкриття результатів пошуку',
      description: 'Визначає, чи відкривати результати пошуку Bing у новій або поточній вкладці.',
      settings: {
        openInNewTab: {
          label: 'Відкривати результати пошуку в новій вкладці',
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