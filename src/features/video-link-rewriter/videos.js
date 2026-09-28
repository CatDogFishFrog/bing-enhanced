import { createPostProcessingMethod } from './shared.js';
import { runMethods } from '../../core/method-runner.js';

export const videoPageLinks = {
  name: 'Bing video page links',
  matches() {
    return location.pathname.startsWith('/videos/');
  },
  start({ logger }) {
    return runMethods(this.name, [createPostProcessingMethod({
      name: 'Video page DOM post-processing',
      rootSelector: '#vm_c',
    })], { logger });
  },
};