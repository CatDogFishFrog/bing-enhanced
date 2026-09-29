# Bing Enhanced

**Bing Enhanced** is a Tampermonkey userscript that skips Bing's intermediate pages when you follow search results, opens videos directly on YouTube or TikTok, and adds a few navigation settings.

[Українська версія](README.uk.md)

---

## For Users

### Features

- YouTube links in Bing Search and Videos results open directly on YouTube.
- TikTok short-video links on Bing Videos open directly on TikTok.
- Search results go straight to their destination instead of opening an intermediate Bing page first.
- From the main general-search tab, the Videos, Images, Maps, News, and Flights sections open in the current tab instead of a new window.
- Separate settings control whether general search results, videos, and news open in the current or a new tab. The defaults preserve Bing's new-tab behavior.

### Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in Chrome or Edge. These are the browsers currently tested with the script.
2. [Install Bing Enhanced from the latest GitHub Release](https://github.com/CatDogFishFrog/bing-enhanced/releases/latest/download/bing-enhanced.user.js) and confirm the prompt in Tampermonkey.
3. Open Bing Search, Videos, Images, or News. The settings button appears beside the search box.

---

## For Developers

Requires Node.js **22.12 or newer**.

See [Contributing](CONTRIBUTING.md) for commit message and release guidelines.

```sh
npm ci
npm run check
npm run build
```

The installable userscript is generated at `dist/bing-enhanced.user.js`.

```text
src/
  core/       Core runtime
  features/   Independent Bing enhancement modules
  locales/    Localization files
tools/        Standalone development utilities; not part of the userscript build
```

Feature modules are registered in `src/features/index.js`; a module's startup failure should not prevent the others from starting. The settings gear appears beside Bing's search form on search, video, image, and news pages.

The module contract, settings schema, method fallback order, and cleanup requirements are described in [Feature Modules and Settings](docs/feature-modules.md). Keep DOM observers focused on the relevant part of the page.

The settings interface is available in English and Ukrainian. See [Localization](docs/localization.md) to add another language with a single locale file. The debug toggle in the Tampermonkey menu shows its current state; debug mode adds detailed console traces.

The [Bing page environment recorder](tools/bing-environment-recorder.user.js) is installed separately and is not included in the main userscript. Capture scenarios, report structure, privacy considerations, and parsing examples are covered in the [Bing Environment Recorder guide](docs/bing-environment-recorder.md).