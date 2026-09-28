import { createPostProcessingMethod } from './shared.js';
import { orderMethods, runMethods } from '../../core/method-runner.js';

const methods = [{
  id: 'dom-post-processing',
  ...createPostProcessingMethod({
    name: 'Search results DOM post-processing',
    rootSelector: '#b_results',
  }),
}];

export const searchVideoLinks = {
  id: 'video-links-search',
  name: 'Bing search video links',
  description: 'Відкриває підтримувані відеорезультати Bing безпосередньо на YouTube.',
  settings: [{
    key: 'methodOrder',
    type: 'method-order',
    label: 'Порядок методів',
    description: 'Якщо з’являться додаткові способи обробки, вони запускатимуться в заданому порядку до першого успішного.',
    options: [{ value: 'dom-post-processing', label: 'Обробка готових результатів у DOM' }],
    defaultValue: ['dom-post-processing'],
  }],
  matches() {
    return location.pathname === '/search';
  },
  start({ logger, settings }) {
    return runMethods(this.name, orderMethods(methods, settings.methodOrder), { logger });
  },
};