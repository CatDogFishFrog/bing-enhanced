# Localization

Locale modules are discovered automatically from `src/locales/*_lang.js`. Add a file such as `JP_lang.js` with a default export containing a unique uppercase language code, its display name, and translated strings:

```js
export default {
  code: 'JP',
  name: '日本語',
  strings: {
    settingsLabel: 'Bing Enhanced の設定',
  },
  features: {
    'video-links-search': {
      name: 'Bing 検索の動画リンク',
      description: '...',
      settings: {
        methodOrder: {
          label: '処理方法の順序',
          description: '...',
          options: {
            'dom-post-processing': 'DOM 内の表示済み結果を処理',
          },
        },
      },
    },
  },
};
```

The `strings` and `features` entries may be partial; missing translations fall back to English. The language picker is generated from discovered modules, and the selected language is persisted in Tampermonkey storage. Use existing locale files as the complete key reference.