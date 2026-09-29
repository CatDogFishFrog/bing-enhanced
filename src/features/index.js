import { searchVideoLinks } from './video-link-rewriter/search.js';
import { tiktokVideoLinks } from './video-link-rewriter/tiktok.js';
import { videoPageLinks } from './video-link-rewriter/videos.js';
import { scopeNavigationCurrentTab } from './scope-navigation/current-tab.js';
import { bingLinkUnwrapper } from './bing-link-unwrapper/feature.js';
import { searchResultOpening } from './search-result-opening/feature.js';

export const features = [
	searchVideoLinks,
	videoPageLinks,
	tiktokVideoLinks,
	scopeNavigationCurrentTab,
	searchResultOpening,
	bingLinkUnwrapper,
];