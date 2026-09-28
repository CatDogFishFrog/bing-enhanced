import { createPostProcessingMethod } from './shared.js';
import { runMethods } from '../../core/method-runner.js';

export const searchVideoLinks = {
  name: 'Bing search video links',
  matches() {
    return location.pathname === '/search';
  },
  start({ logger }) {
    return runMethods(this.name, [createPostProcessingMethod({
      name: 'Search results DOM post-processing',
      rootSelector: '#b_results',
    })], { logger });
  },
};