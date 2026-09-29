# Bing Enhanced

**Bing Enhanced** is a Tampermonkey userscript that makes everyday Bing use better by removing many annoyances and improving the overall experience. You'll find descriptions of its features below.

[Українська версія](README.uk.md)

---

## For Users

### Implemented

- Videos in search results or on the Videos tab open instantly on YouTube, just as they should! The script does not redirect; it replaces the links themselves with the correct ones, so videos open right away.
- TikTok short videos also open directly on TikTok. Their links are replaced too, without a redirect.
- The Videos, Images, Maps, News, and Flights tabs open in the current window when selected from search results.
- Search results and all other internal site links open directly instead of going through intermediate analytics links. All navigation is instant, with no analytics loading!

### Planned

- Add a toggle to choose whether links open in a new window or the current one. By default, Bing always opens them in a new window.
- Improve how images open in the Images tab. The current experience is incredibly inconvenient: the image takes up a tiny part of the screen, making it impossible to inspect, and the navigation is awful...
- Maybe do something with Rewards.
- Maybe change the search-results layout by combining the best ideas from different search engines.

### Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in Chrome or Edge.
2. [Click here to install the userscript](https://github.com/CatDogFishFrog/bing-enhanced/releases/latest/download/bing-enhanced.user.js), then confirm the installation.
3. Done. A settings button will appear to the right of the search box on Bing's search page. Use it to turn features on or off.

---

## For Developers

Requires Node.js **22.12 or newer**.

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