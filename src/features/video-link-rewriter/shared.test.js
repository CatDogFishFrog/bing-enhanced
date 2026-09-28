import assert from 'node:assert/strict';
import test from 'node:test';
import { getTikTokUrlFromMetadata, getYouTubeUrlFromMetadata } from './shared.js';

test('extracts only direct TikTok video URLs from Bing metadata', () => {
  const tiktokUrl = 'https://www.tiktok.com/@lilyandfox/video/7155923526380293377';

  assert.equal(getTikTokUrlFromMetadata(JSON.stringify({ murl: tiktokUrl })), tiktokUrl);
  assert.equal(
    getTikTokUrlFromMetadata(JSON.stringify({ murl: 'https://www.bing.com/video', pgurl: tiktokUrl })),
    tiktokUrl,
  );
  assert.equal(
    getTikTokUrlFromMetadata(JSON.stringify({ murl: 'https://www.tiktok.com/@lilyandfox' })),
    null,
  );
  assert.equal(
    getTikTokUrlFromMetadata(JSON.stringify({ murl: 'https://tiktok.com.attacker.example/@user/video/1' })),
    null,
  );
  assert.equal(
    getTikTokUrlFromMetadata(JSON.stringify({ murl: 'http://www.tiktok.com/@user/video/1' })),
    null,
  );
});

test('extracts a direct YouTube URL from Bing video metadata', () => {
  const metadata = JSON.stringify({
    murl: 'https://www.youtube.com/watch?v=JG673Q83_Mw',
    pgurl: 'https://www.youtube.com/watch?v=JG673Q83_Mw',
  });

  assert.equal(
    getYouTubeUrlFromMetadata(metadata),
    'https://www.youtube.com/watch?v=JG673Q83_Mw',
  );
});

test('tries the next metadata field when a candidate is not a YouTube URL', () => {
  const metadata = JSON.stringify({
    murl: 'https://www.bing.com/videos/riverview/relatedvideo',
    pgurl: 'https://youtu.be/JG673Q83_Mw',
  });

  assert.equal(getYouTubeUrlFromMetadata(metadata), 'https://youtu.be/JG673Q83_Mw');
});

test('rejects malformed metadata and lookalike YouTube domains', () => {
  assert.equal(getYouTubeUrlFromMetadata('{not json'), null);
  assert.equal(getYouTubeUrlFromMetadata('null'), null);
  assert.equal(
    getYouTubeUrlFromMetadata(JSON.stringify({ murl: 'https://youtube.com.attacker.example/watch?v=x' })),
    null,
  );
});