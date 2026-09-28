# Bing Enhanced

**Bing Enhanced** is a Tampermonkey userscript for improving everyday use of Bing. Its first feature rewrites Bing video-result links to open YouTube directly. The project does not have a published release yet.

[Українська версія](README.uk.md)

## For Users

### Features

The current development build rewrites supported video-result links on Bing search and video pages to open their YouTube URLs directly.

### Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in Chrome or Edge.
2. Download `bing-enhanced.user.js` from [GitHub Releases](https://github.com/CatDogFishFrog/bing-enhanced/releases) when the first release is available.
3. Open the downloaded file and confirm installation in Tampermonkey.

## For Developers

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run check
npm run build
```

The installable userscript is generated at `dist/bing-enhanced.user.js`.

```text
src/
	core/       Shared runtime code
	features/   Independent Bing enhancements
tools/        Standalone development utilities; not part of the release build
```

Feature modules are registered in `src/features/index.js`; a module's startup failure should not prevent other modules from starting. Keep DOM observers focused on the relevant part of the page. See [MEMORY.md](MEMORY.md) for working notes (local only; excluded from Git).

The optional [Bing page environment recorder](tools/bing-environment-recorder.user.js) is installed separately and is not included in the main userscript.