const VIDEO_LINK_SELECTOR = 'a.mc_vtvc_link';

export function getYouTubeUrlFromMetadata(serializedMetadata) {
  if (typeof serializedMetadata !== 'string' || serializedMetadata.length === 0) return null;

  let metadata;
  try {
    metadata = JSON.parse(serializedMetadata);
  } catch {
    return null;
  }
  if (!metadata || typeof metadata !== 'object') return null;

  for (const candidate of [metadata.murl, metadata.pgurl, metadata.purl]) {
    if (typeof candidate !== 'string') continue;

    try {
      const url = new URL(candidate);
      const isYouTubeHost = url.hostname === 'youtu.be'
        || url.hostname === 'youtube.com'
        || url.hostname.endsWith('.youtube.com');
      if (url.protocol === 'https:' && isYouTubeHost) return url.href;
    } catch {
      continue;
    }
  }

  return null;
}

export function getTikTokUrlFromMetadata(serializedMetadata) {
  if (typeof serializedMetadata !== 'string' || serializedMetadata.length === 0) return null;

  let metadata;
  try {
    metadata = JSON.parse(serializedMetadata);
  } catch {
    return null;
  }
  if (!metadata || typeof metadata !== 'object') return null;

  for (const candidate of [metadata.murl, metadata.pgurl]) {
    if (typeof candidate !== 'string') continue;

    try {
      const url = new URL(candidate);
      const isTikTokHost = url.hostname === 'tiktok.com'
        || url.hostname.endsWith('.tiktok.com');
      const isVideoPath = /^\/@[^/]+\/video\/\d+\/?$/.test(url.pathname);
      if (url.protocol === 'https:' && isTikTokHost && isVideoPath) return url.href;
    } catch {
      continue;
    }
  }

  return null;
}

function stopBingVideoInterception(event) {
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function processVideoLink(link, logger, urlResolver, markerKey) {
  const metadataSources = [
    [link.hasAttribute('vrhm') ? link : null, 'vrhm'],
    [link.querySelector('.vrhdata, [vrhm]'), 'vrhm'],
    [link.closest('.mc_vtvc'), 'mmeta'],
  ];
  let targetUrl = null;
  for (const [node, attribute] of metadataSources) {
    targetUrl = urlResolver(node?.getAttribute(attribute));
    if (targetUrl) break;
  }
  if (!targetUrl) {
    const originalUrl = link.querySelector('[ourl]')?.getAttribute('ourl');
    targetUrl = originalUrl
      ? urlResolver(JSON.stringify({ murl: originalUrl }))
      : null;
  }
  if (!targetUrl) return false;

  const previousUrl = link.href;
  const alreadyHandled = link.dataset[markerKey] === targetUrl;
  if (alreadyHandled && previousUrl === targetUrl) return false;

  link.href = targetUrl;
  link.dataset[markerKey] = targetUrl;
  link.removeAttribute('h');
  link.removeAttribute('data-dc');

  if (!alreadyHandled) {
    link.addEventListener('click', stopBingVideoInterception, true);
    link.addEventListener('mousedown', stopBingVideoInterception, true);
  }

  logger.debug('Rewrote a Bing video result link.', { previousUrl, targetUrl });
  return true;
}

function processAddedNode(node, logger, urlResolver, markerKey) {
  if (!(node instanceof Element)) return 0;

  let rewritten = 0;
  const parentLink = node.closest(VIDEO_LINK_SELECTOR);
  if (parentLink && processVideoLink(parentLink, logger, urlResolver, markerKey)) rewritten += 1;
  if (node.matches(VIDEO_LINK_SELECTOR) && processVideoLink(node, logger, urlResolver, markerKey)) rewritten += 1;
  node.querySelectorAll(VIDEO_LINK_SELECTOR).forEach((link) => {
    if (processVideoLink(link, logger, urlResolver, markerKey)) rewritten += 1;
  });
  return rewritten;
}

function scanRoot(root, logger, urlResolver, markerKey) {
  let rewritten = 0;
  if (root instanceof Element && root.matches(VIDEO_LINK_SELECTOR)
    && processVideoLink(root, logger, urlResolver, markerKey)) {
    rewritten += 1;
  }
  root.querySelectorAll?.(VIDEO_LINK_SELECTOR).forEach((link) => {
    if (processVideoLink(link, logger, urlResolver, markerKey)) rewritten += 1;
  });
  return rewritten;
}

export function createPostProcessingMethod({
  name,
  rootSelector,
  urlResolver = getYouTubeUrlFromMetadata,
  markerKey = 'bingEnhancedYoutube',
}) {
  return {
    name,
    run({ logger }) {
      if (!document.documentElement) {
        throw new Error('documentElement is not available yet.');
      }

      let scope = null;
      let rewritten = 0;
      const liveObserver = new MutationObserver((mutations) => {
        let addedRewrites = 0;

        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            const link = mutation.target instanceof HTMLAnchorElement
              ? mutation.target
              : mutation.target instanceof Element
                ? mutation.target.closest(VIDEO_LINK_SELECTOR)
                  || mutation.target.querySelector(VIDEO_LINK_SELECTOR)
                : null;
              if (link?.matches(VIDEO_LINK_SELECTOR)
                && processVideoLink(link, logger, urlResolver, markerKey)) {
              addedRewrites += 1;
            }
            continue;
          }

          for (const node of mutation.addedNodes) {
            addedRewrites += processAddedNode(node, logger, urlResolver, markerKey);
          }
        }

        if (addedRewrites > 0) {
          rewritten += addedRewrites;
          logger.info(`Rewrote ${addedRewrites} new video link(s) on ${location.pathname}.`);
        }
      });

      const observerOptions = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href', 'vrhm', 'mmeta', 'ourl'],
      };

      const scopeObserver = new MutationObserver(() => {
        const nextScope = document.querySelector(rootSelector);
        if (nextScope === scope) return;

        liveObserver.disconnect();
        scope = nextScope;
        if (!scope) return;

        rewritten += scanRoot(scope, logger, urlResolver, markerKey);
        liveObserver.observe(scope, observerOptions);
        logger.info(`Watching ${rootSelector}; rewrote ${rewritten} existing video link(s).`);
      });
      scopeObserver.observe(document.documentElement, { childList: true, subtree: true });
      scope = document.querySelector(rootSelector);
      if (scope) {
        rewritten += scanRoot(scope, logger, urlResolver, markerKey);
        liveObserver.observe(scope, observerOptions);
      }

      logger.info(`Watching ${rootSelector}; rewrote ${rewritten} existing video link(s).`);
      return {
        applied: true,
        cleanup() {
          scopeObserver.disconnect();
          liveObserver.disconnect();
        },
      };
    },
  };
}