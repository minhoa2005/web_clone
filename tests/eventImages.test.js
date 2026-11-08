import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { EVENTS } from '../src/history.js';
import { HISTORICAL_PLACES } from '../src/historicalPlaces.js';
import { EVENT_ILLUSTRATIONS, getEventIllustration, getAllEventIllustrations, SUPPORTED_EXTENSIONS, getCandidateImageUrls } from '../src/eventImages.js';

test('every historical event has a dedicated illustration record keyed by exact event id', () => {
  assert.equal(Object.keys(EVENT_ILLUSTRATIONS).length, EVENTS.length);
  assert.equal(EVENTS.length, 36);

  for (const event of EVENTS) {
    const illustration = getEventIllustration(event.id);
    assert.ok(illustration, `Missing illustration mapping for ${event.id}`);
    assert.equal(illustration.id, event.id);
    assert.equal(illustration.fileName, `${event.id}.webp`);
    assert.equal(illustration.src, `assets/events/${event.id}.webp`);
    assert.ok(illustration.title, `Missing title for ${event.id}`);
    assert.ok(illustration.caption, `Missing caption for ${event.id}`);
    assert.ok(illustration.suggestedImage, `Missing image suggestion for ${event.id}`);
    assert.ok(Array.isArray(illustration.candidates));
    assert.equal(illustration.candidates.length, 4);
    assert.deepEqual(illustration.candidates, [
      `assets/events/${event.id}.webp`,
      `assets/events/${event.id}.jpg`,
      `assets/events/${event.id}.jpeg`,
      `assets/events/${event.id}.png`,
    ]);
  }
});

test('supports multiple image file extensions: webp, jpg, jpeg, png', () => {
  assert.deepEqual(SUPPORTED_EXTENSIONS, ['webp', 'jpg', 'jpeg', 'png']);
  const urls = getCandidateImageUrls('hanh-trinh-1911');
  assert.equal(urls[0], 'assets/events/hanh-trinh-1911.webp');
  assert.equal(urls[1], 'assets/events/hanh-trinh-1911.jpg');
  assert.equal(urls[2], 'assets/events/hanh-trinh-1911.jpeg');
  assert.equal(urls[3], 'assets/events/hanh-trinh-1911.png');
});

test('historical places attach illustration metadata to all places', () => {
  for (const place of HISTORICAL_PLACES) {
    assert.ok(place.illustration, `Place missing illustration: ${place.id}`);
    assert.equal(place.illustration.id, place.id);
  }
});

test('event illustrations directory exists in public assets', () => {
  const dirUrl = new URL('../public/assets/events', import.meta.url);
  assert.ok(existsSync(dirUrl), 'Directory public/assets/events must exist');
});

test('getAllEventIllustrations returns all 36 configured illustrations', () => {
  const all = getAllEventIllustrations();
  assert.equal(all.length, 36);
  assert.deepEqual(all.map((item) => item.id), EVENTS.map((item) => item.id));
});
