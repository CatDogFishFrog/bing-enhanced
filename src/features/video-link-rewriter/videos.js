import { createPostProcessingMethod } from './shared.js';
import { orderMethods, runMethods } from '../../core/method-runner.js';

const methods = [{
  id: 'dom-post-processing',
  ...createPostProcessingMethod({
    name: 'Video page DOM post-processing',
    rootSelector: '#vm_c',
  }),
}];

export const videoPageLinks = {
  id: 'video-links-video-page',
  name: 'Bing video page links',
  description: 'Відкриває підтримувані відеорезультати Bing Video безпосередньо на YouTube.',
  settings: [{
    key: 'methodOrder',
    type: 'method-order',
    label: 'Порядок методів',
    description: 'Якщо з’являться додаткові способи обробки, вони запускатимуться в заданому порядку до першого успішного.',
    options: [{ value: 'dom-post-processing', label: 'Обробка готових результатів у DOM' }],
    defaultValue: ['dom-post-processing'],
  }],
  matches() {
    return location.pathname === '/videos' || location.pathname.startsWith('/videos/');
  },
  start({ logger, settings }) {
    return runMethods(this.name, orderMethods(methods, settings.methodOrder), { logger });
  },
};