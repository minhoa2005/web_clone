import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../src/history.js';
import { HISTORICAL_PLACES, PLACES, WISHLIST, historicalPins, historicalArcs } from '../src/historicalPlaces.js';

test('both original map modes retain every historical event in chronological order', () => {
  assert.deepEqual([...PLACES, ...WISHLIST].map((event) => event.id), EVENTS.map((event) => event.id));
  assert.equal(new Set(HISTORICAL_PLACES.map((event) => event.id)).size, EVENTS.length);
});

test('pins share real geographic sites and policies do not acquire invented coordinates', () => {
  for (const list of [PLACES, WISHLIST]) {
    const pins = historicalPins(list, null);
    assert.equal(new Set(pins.map((pin) => `${pin.lat},${pin.lng}`)).size, pins.length);
    assert.ok(pins.every((pin) => pin.lat !== null && pin.lng !== null));
  }
  const policy = HISTORICAL_PLACES.find((event) => event.id === 'khoan-100-1981');
  assert.equal(policy.lat, null);
  assert.equal(policy.mapCountry, null);
  assert.deepEqual(historicalPins([policy], policy), []);
  assert.deepEqual(historicalArcs(policy), []);
});

test('original gallery slots use local textbook pages and retain editorial annotations', () => {
  for (const event of HISTORICAL_PLACES) {
    assert.deepEqual(event.photos.map((photo) => photo.src), event.pages.map((page) => `assets/sources/page-${page}.webp`));
    assert.equal(event.annotation, EVENTS.find((item) => item.id === event.id).note);
  }
  const paris = HISTORICAL_PLACES.find((event) => event.id === 'paris-1973');
  assert.equal(historicalArcs(paris).length, paris.links.length);
});
