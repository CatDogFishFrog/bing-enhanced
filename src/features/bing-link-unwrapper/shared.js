const BING_HOST = 'www.bing.com';
const MAX_ENCODED_TARGET_LENGTH = 16_384;

function decodeBase64Url(value) {
  if (!value || value.length > MAX_ENCODED_TARGET_LENGTH || !/^[\w-]+$/.test(value)) return null;
  if (value.length % 4 === 1) return null;

  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
      .padEnd(Math.ceil(value.length / 4) * 4, '=');
    const binary = globalThis.atob(base64);
    const bytes = globalThis.Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new globalThis.TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function getBingClickDestination(href) {
  if (typeof href !== 'string' || href.length > MAX_ENCODED_TARGET_LENGTH * 2) return null;

  let sourceUrl;
  try {
    sourceUrl = new URL(href);
  } catch {
    return null;
  }

  if (sourceUrl.protocol !== 'https:'
    || sourceUrl.hostname !== BING_HOST
    || sourceUrl.pathname !== '/ck/a') return null;

  const encodedTargets = sourceUrl.searchParams.getAll('u');
  if (encodedTargets.length !== 1 || !encodedTargets[0].startsWith('a1')) return null;

  const decodedTarget = decodeBase64Url(encodedTargets[0].slice(2));
  if (!decodedTarget) return null;

  const isRootRelative = decodedTarget.startsWith('/')
    && !decodedTarget.startsWith('//')
    && !decodedTarget.includes('\\');
  let targetUrl;
  try {
    targetUrl = isRootRelative
      ? new URL(decodedTarget, 'https://www.bing.com')
      : new URL(decodedTarget);
  } catch {
    return null;
  }

  const isHttpUrl = targetUrl.protocol === 'https:' || targetUrl.protocol === 'http:';
  const isBingDomain = targetUrl.hostname === 'bing.com' || targetUrl.hostname.endsWith('.bing.com');
  if (!isHttpUrl || !targetUrl.hostname || targetUrl.username || targetUrl.password) return null;

  return {
    url: targetUrl.href,
    type: isBingDomain ? 'internal' : 'external',
  };
}

export function getDirectUrlFromBingClickUrl(href) {
  const destination = getBingClickDestination(href);
  return destination?.type === 'external' ? destination.url : null;
}

export function rewriteBingClickLink(anchor, logger, settings = {}) {
  const previousUrl = anchor.getAttribute('href');
  const destination = getBingClickDestination(previousUrl);
  if (!destination) return false;

  const shouldRewrite = destination.type === 'external'
    ? settings.replaceExternalLinks !== false
    : settings.replaceInternalBingLinks !== false;
  if (!shouldRewrite || previousUrl === destination.url) return false;

  anchor.setAttribute('href', destination.url);
  logger.debug('Replaced an intermediate Bing analytics link with its direct destination.', {
    previousUrl,
    targetUrl: destination.url,
    type: destination.type,
  });
  return true;
}