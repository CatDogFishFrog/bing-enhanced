import { rewriteBingClickLink } from './shared.js';

function processNode(node, logger, settings, trackRewrite) {
  if (!(node instanceof Element)) return 0;

  let rewritten = 0;
  if (node.matches('a[href]') && trackRewrite(node, logger, settings)) rewritten += 1;
  for (const anchor of node.querySelectorAll('a[href]')) {
    if (trackRewrite(anchor, logger, settings)) rewritten += 1;
  }
  return rewritten;
}

export const bingLinkUnwrapper = {
  id: 'bing-link-unwrapper',
  name: 'Direct search-result links',
  description: 'Open all search-result links directly instead of routing through Bing\'s intermediate analytics redirects.',
  settings: [
    {
      key: 'replaceExternalLinks',
      type: 'toggle',
      label: 'Replace external links',
      description: 'Replace Bing redirect links that lead to other websites.',
      defaultValue: true,
    },
    {
      key: 'replaceInternalBingLinks',
      type: 'toggle',
      label: 'Replace internal links',
      description: 'Replace Bing redirect links that lead to another Bing page.',
      defaultValue: true,
    },
  ],
  matches() {
    return location.hostname === 'www.bing.com';
  },
  start({ logger, settings }) {
    let rewritten = 0;
    const rewrittenLinks = new Map();
    function trackRewrite(anchor, currentLogger, currentSettings) {
      const originalHref = anchor.getAttribute('href');
      if (!rewriteBingClickLink(anchor, currentLogger, currentSettings)) return false;

      const existing = rewrittenLinks.get(anchor);
      rewrittenLinks.set(anchor, {
        originalHref: existing?.originalHref ?? originalHref,
        rewrittenHref: anchor.getAttribute('href'),
      });
      return true;
    }

    function forgetDetachedLinks(node) {
      if (!(node instanceof Element) || node.isConnected) return;
      if (node.matches('a[href]')) rewrittenLinks.delete(node);
      for (const anchor of node.querySelectorAll('a[href]')) rewrittenLinks.delete(anchor);
    }

    const observer = new MutationObserver((mutations) => {
      try {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            if (trackRewrite(mutation.target, logger, settings)) rewritten += 1;
            continue;
          }
          for (const node of mutation.addedNodes) {
            rewritten += processNode(node, logger, settings, trackRewrite);
          }
          for (const node of mutation.removedNodes) forgetDetachedLinks(node);
        }
      } catch (error) {
        logger.error('Bing redirect link processing failed.', error);
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href'],
    });
    for (const anchor of document.querySelectorAll('a[href]')) {
      if (trackRewrite(anchor, logger, settings)) rewritten += 1;
    }

    logger.info(`Watching Bing links; replaced ${rewritten} existing intermediate analytics link(s).`);
    return {
      applied: true,
      cleanup() {
        observer.disconnect();
        for (const [anchor, original] of rewrittenLinks) {
          if (anchor.getAttribute('href') === original.rewrittenHref) {
            anchor.setAttribute('href', original.originalHref);
          }
        }
        rewrittenLinks.clear();
      },
    };
  },
};