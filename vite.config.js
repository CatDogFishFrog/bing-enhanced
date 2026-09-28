import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

const packageInfo = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);
const releaseUrl = `${packageInfo.homepage}/releases/latest/download/bing-enhanced.user.js`;

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'Bing Enhanced',
        namespace: 'https://github.com/CatDogFishFrog',
        version: packageInfo.version,
        description: packageInfo.description,
        author: packageInfo.author,
        license: packageInfo.license,
        homepageURL: packageInfo.homepage,
        supportURL: packageInfo.bugs.url,
        updateURL: releaseUrl,
        downloadURL: releaseUrl,
        grant: ['GM_getValue', 'GM_setValue', 'GM_registerMenuCommand', 'GM_unregisterMenuCommand'],
        match: ['https://www.bing.com/*'],
        'run-at': 'document-start',
        noframes: true,
      },
      build: {
        fileName: 'bing-enhanced.user.js',
      },
      server: {
        open: false,
      },
    }),
  ],
});