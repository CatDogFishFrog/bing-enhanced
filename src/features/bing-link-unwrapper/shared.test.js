import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { createFeatureManager } from '../../core/feature-runner.js';
import { bingLinkUnwrapper } from './feature.js';
import {
  getBingClickDestination,
  getDirectUrlFromBingClickUrl,
  rewriteBingClickLink,
} from './shared.js';

const wikipediaLink = 'https://www.bing.com/ck/a?!&&p=7acbfc4beae521f46007cb17eabc1baf3addc9683aedd9efc7354d76ad48069cJmltdHM9MTc5MDU1MzYwMA&ptn=3&ver=2&hsh=4&fclid=3fe1afb7-55d4-6aa6-0f23-b87954bf6ba5&psq=asd&u=a1aHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQXV0aXNt';
const cdcLink = 'https://www.bing.com/ck/a?!&&p=e613511a10ad760822184c9b70365e008e6228e0ad3af46db5e6244123ab4253JmltdHM9MTc5MDU1MzYwMA&ptn=3&ver=2&hsh=4&fclid=3fe1afb7-55d4-6aa6-0f23-b87954bf6ba5&psq=asd&u=a1aHR0cHM6Ly93d3cuY2RjLmdvdi9hdXRpc20vYWJvdXQvaW5kZXguaHRtbA';
const internalSearchLink = 'https://www.bing.com/ck/a?!&&p=9832e0124ea1b2732a685fb6f7a13d520014291a8551e1727e13ece79bd45dbbJmltdHM9MTc5MDU1MzYwMA&ptn=3&ver=2&hsh=4&fclid=3fe1afb7-55d4-6aa6-0f23-b87954bf6ba5&u=a1L3NlYXJjaD9xPSVkMSU4ZiVkMCViYSslZDAlYjIlZDElOTYlZDAlYjQlZDAlYmElZDElODAlZDAlYjglZDElODIlZDAlYjgrJWQxJTg0JWQwJWIwJWQwJWI5JWQwJWJiK2FzZCZGT1JNPVI1RkQ';
const internalImagesLink = 'https://www.bing.com/ck/a?!&&p=4ff896b06ca7f9d000469d21884cb15bda49ecc137295e40a59a48b8a27ae739JmltdHM9MTc5MDU1MzYwMA&ptn=3&ver=2&hsh=4&fclid=3fe1afb7-55d4-6aa6-0f23-b87954bf6ba5&u=a1L2ltYWdlcy9zZWFyY2g_cT1hc2QmRk9STT1IRFJTQzM';

test('extracts direct destinations from the provided intermediate Bing links', () => {
  assert.equal(
    getDirectUrlFromBingClickUrl(wikipediaLink),
    'https://en.wikipedia.org/wiki/Autism',
  );
  assert.equal(
    getDirectUrlFromBingClickUrl(cdcLink),
    'https://www.cdc.gov/autism/about/index.html',
  );
});

test('decodes Base64URL payloads and permits external HTTP and HTTPS destinations', () => {
  assert.equal(
    getDirectUrlFromBingClickUrl('https://www.bing.com/ck/a?u=a1aHR0cDovL2V4YW1wbGUuY29tL3BhdGg'),
    'http://example.com/path',
  );
  assert.equal(
    getDirectUrlFromBingClickUrl('https://www.bing.com/ck/a?u=a1aHR0cHM6Ly9leGFtcGxlLmNvbS8_YT0xJmI9Mg'),
    'https://example.com/?a=1&b=2',
  );
});

test('rejects unrelated Bing URLs and malformed or ambiguous redirect payloads', () => {
  const invalidLinks = [
    'https://www.bing.com/search?q=test',
    'https://www.bing.com/ck/b?u=a1aHR0cHM6Ly9leGFtcGxlLmNvbQ',
    'http://www.bing.com/ck/a?u=a1aHR0cHM6Ly9leGFtcGxlLmNvbQ',
    'https://bing.com/ck/a?u=a1aHR0cHM6Ly9leGFtcGxlLmNvbQ',
    'https://www.bing.com/ck/a?u=a2aHR0cHM6Ly9leGFtcGxlLmNvbQ',
    'https://www.bing.com/ck/a?u=a1',
    'https://www.bing.com/ck/a?u=a1aHR0cHM6Ly9leGFtcGxlLmNvbQ&u=a1aHR0cHM6Ly9ldmlsLmV4YW1wbGU',
    'https://www.bing.com/ck/a?u=a1////',
    'https://www.bing.com/ck/a?u=a1amF2YXNjcmlwdDphbGVydCgxKQ',
    'https://www.bing.com/ck/a?u=a1aHR0cHM6Ly9iaW5nLmNvbS9zZWFyY2g',
    'https://www.bing.com/ck/a?u=a1aHR0cHM6Ly93d3cuYmluZy5jb20vc2VhcmNo',
    'https://www.bing.com/ck/a?u=a1aHR0cHM6Ly91c2VyOnBhc3N3b3JkQGV4YW1wbGUuY29t',
    'https://www.bing.com/ck/a?u=a1L2xvY2FsL3BhdGg',
    '/ck/a?u=a1aHR0cHM6Ly9leGFtcGxlLmNvbQ',
    'not a URL',
  ];

  for (const link of invalidLinks) {
    assert.equal(getDirectUrlFromBingClickUrl(link), null, link);
  }
});

test('classifies external destinations and exact www.bing.com destinations separately', () => {
  const internalTarget = 'https://www.bing.com/images/search?q=test';
  const internalLink = `https://www.bing.com/ck/a?u=a1${Buffer.from(internalTarget).toString('base64url')}`;

  assert.deepEqual(getBingClickDestination(wikipediaLink), {
    url: 'https://en.wikipedia.org/wiki/Autism',
    type: 'external',
  });
  assert.deepEqual(getBingClickDestination(internalLink), {
    url: internalTarget,
    type: 'internal',
  });
  assert.equal(getBingClickDestination(
    `https://www.bing.com/ck/a?u=a1${Buffer.from('https://cn.bing.com/search?q=test').toString('base64url')}`,
  ).type, 'internal');
});

test('resolves root-relative Bing redirect destinations without accepting protocol-relative URLs', () => {
  const searchDestination = getBingClickDestination(internalSearchLink);
  assert.equal(searchDestination.type, 'internal');
  const searchUrl = new URL(searchDestination.url);
  assert.equal(searchUrl.pathname, '/search');
  assert.equal(searchUrl.searchParams.get('FORM'), 'R5FD');
  assert.deepEqual(getBingClickDestination(internalImagesLink), {
    url: 'https://www.bing.com/images/search?q=asd&FORM=HDRSC3',
    type: 'internal',
  });

  const protocolRelative = `https://www.bing.com/ck/a?u=a1${Buffer.from('//evil.example/path').toString('base64url')}`;
  assert.equal(getBingClickDestination(protocolRelative), null);
});

test('rewrites only the destination class enabled in settings', () => {
  const internalTarget = 'https://www.bing.com/images/search?q=test';
  const internalLink = `https://www.bing.com/ck/a?u=a1${Buffer.from(internalTarget).toString('base64url')}`;
  const externalAnchor = createAnchor(wikipediaLink);
  const internalAnchor = createAnchor(internalLink);
  const logger = { debug() {} };

  const internalOnly = {
    replaceExternalLinks: false,
    replaceInternalBingLinks: true,
  };
  assert.equal(rewriteBingClickLink(externalAnchor, logger, internalOnly), false);
  assert.equal(rewriteBingClickLink(internalAnchor, logger, internalOnly), true);
  assert.equal(internalAnchor.href, internalTarget);

  const externalOnly = {
    replaceExternalLinks: true,
    replaceInternalBingLinks: true,
  };
  const externalAnchorWithDefaults = createAnchor(wikipediaLink);
  assert.equal(rewriteBingClickLink(externalAnchorWithDefaults, logger, externalOnly), true);

  const internalAnchorWithDefaults = createAnchor(internalLink);
  assert.equal(rewriteBingClickLink(internalAnchorWithDefaults, logger), true);
  assert.equal(internalAnchorWithDefaults.href, internalTarget);
});

test('new internal-link default supersedes a previously persisted false default', () => {
  const manager = createFeatureManager([bingLinkUnwrapper], {
    logger: { debug() {}, info() {}, warn() {}, error() {} },
    storage: {
      get: () => ({
        'bing-link-unwrapper': {
          enabled: true,
          settings: {
            replaceExternalLinks: false,
            replaceInternalLinks: false,
          },
        },
      }),
      set() {},
    },
  });

  const [featureState] = manager.getFeaturesState();
  assert.equal(featureState.values.replaceExternalLinks, false);
  assert.equal(featureState.values.replaceInternalBingLinks, true);
});

function createAnchor(href) {
  return {
    href,
    getAttribute(name) {
      return name === 'href' ? this.href : null;
    },
    setAttribute(name, value) {
      if (name === 'href') this.href = value;
    },
  };
}