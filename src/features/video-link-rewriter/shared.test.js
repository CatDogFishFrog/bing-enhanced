import assert from 'node:assert/strict';
import test from 'node:test';
import { getYouTubeUrlFromMetadata } from './shared.js';

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