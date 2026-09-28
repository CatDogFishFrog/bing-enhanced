import { searchVideoLinks } from './video-link-rewriter/search.js';
import { tiktokVideoLinks } from './video-link-rewriter/tiktok.js';
import { videoPageLinks } from './video-link-rewriter/videos.js';

export const features = [searchVideoLinks, videoPageLinks, tiktokVideoLinks];