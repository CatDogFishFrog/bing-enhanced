import { createPostProcessingMethod, getTikTokUrlFromMetadata } from './shared.js';

const method = createPostProcessingMethod({
  name: 'TikTok video DOM post-processing',
  rootSelector: '#vm_c',
  urlResolver: getTikTokUrlFromMetadata,
  markerKey: 'bingEnhancedTikTok',
});

export const tiktokVideoLinks = {
  id: 'video-links-tiktok',
  name: 'Bing TikTok video links',
  description: 'Відкриває відеорезультати TikTok у Bing безпосередньо на TikTok.',
  matches() {
    return location.pathname === '/videos' || location.pathname.startsWith('/videos/');
  },
  start({ logger }) {
    return method.run({ logger });
  },
};