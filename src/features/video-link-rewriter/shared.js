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

function stopBingVideoInterception(event) {
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function processVideoLink(link, logger) {
  const metadataNode = link.hasAttribute('vrhm')
    ? link
    : link.querySelector('.vrhdata, [vrhm]');
  const youtubeUrl = getYouTubeUrlFromMetadata(metadataNode?.getAttribute('vrhm'));
  if (!youtubeUrl) return false;

  const previousUrl = link.href;
  const alreadyHandled = link.dataset.bingEnhancedYoutube === youtubeUrl;
  if (alreadyHandled && previousUrl === youtubeUrl) return false;

  link.href = youtubeUrl;
  link.dataset.bingEnhancedYoutube = youtubeUrl;
  link.removeAttribute('h');
  link.removeAttribute('data-dc');

  if (!alreadyHandled) {
    link.addEventListener('click', stopBingVideoInterception, true);
    link.addEventListener('mousedown', stopBingVideoInterception, true);
  }

  logger.debug('Rewrote a Bing video result link.', { previousUrl, youtubeUrl });
  return true;
}

function processAddedNode(node, logger) {
  if (!(node instanceof Element)) return 0;

  let rewritten = 0;
  if (node.matches(VIDEO_LINK_SELECTOR) && processVideoLink(node, logger)) rewritten += 1;
  node.querySelectorAll(VIDEO_LINK_SELECTOR).forEach((link) => {
    if (processVideoLink(link, logger)) rewritten += 1;
  });
  return rewritten;
}

function scanRoot(root, logger) {
  let rewritten = 0;
  if (root instanceof Element && root.matches(VIDEO_LINK_SELECTOR) && processVideoLink(root, logger)) {
    rewritten += 1;
  }
  root.querySelectorAll?.(VIDEO_LINK_SELECTOR).forEach((link) => {
    if (processVideoLink(link, logger)) rewritten += 1;
  });
  return rewritten;
}

export function createPostProcessingMethod({ name, rootSelector }) {
  return {
    name,
    run({ logger }) {
      if (!document.documentElement) {
        throw new Error('documentElement is not available yet.');
      }

      let scope = document.querySelector(rootSelector);
      let rewritten = scope ? scanRoot(scope, logger) : 0;
      const liveObserver = new MutationObserver((mutations) => {
        let addedRewrites = 0;

        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            if (mutation.target instanceof HTMLAnchorElement
              && mutation.target.matches(VIDEO_LINK_SELECTOR)
              && processVideoLink(mutation.target, logger)) {
              addedRewrites += 1;
            }
            continue;
          }

          for (const node of mutation.addedNodes) {
            addedRewrites += processAddedNode(node, logger);
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
        attributeFilter: ['href'],
      };

      if (scope) {
        liveObserver.observe(scope, observerOptions);
      } else {
        const scopeObserver = new MutationObserver(() => {
          scope = document.querySelector(rootSelector);
          if (!scope) return;

          scopeObserver.disconnect();
          rewritten += scanRoot(scope, logger);
          liveObserver.observe(scope, observerOptions);
          logger.info(`Watching ${rootSelector}; rewrote ${rewritten} existing video link(s).`);
        });
        scopeObserver.observe(document.documentElement, { childList: true, subtree: true });

        return {
          applied: true,
          cleanup() {
            scopeObserver.disconnect();
            liveObserver.disconnect();
          },
        };
      }

      logger.info(`Watching ${rootSelector}; rewrote ${rewritten} existing video link(s).`);
      return {
        applied: true,
        cleanup() {
          liveObserver.disconnect();
        },
      };
    },
  };
}