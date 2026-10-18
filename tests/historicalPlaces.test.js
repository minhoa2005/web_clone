import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../src/history.js';
import { HISTORICAL_PLACES, PLACES, WISHLIST, historicalPins, historicalArcs } from '../src/historicalPlaces.js';
import * as historyMap from '../src/historicalPlaces.js';
import { readFileSync } from 'node:fs';

test('highlight follows the focused marker, never all countries or an implicit Vietnam', () => {
  assert.deepEqual(historyMap.highlightedCountries(WISHLIST, null), []);
  const diplomacy = WISHLIST.find((event) => event.id === 'ngoai-giao-1950');
  assert.deepEqual(historyMap.highlightedCountries(WISHLIST, diplomacy, 'beijing'), ['China']);
  assert.deepEqual(historyMap.highlightedCountries(WISHLIST, diplomacy, 'moscow'), ['Russia']);
  const paris = WISHLIST.find((event) => event.id === 'paris-1973');
  assert.deepEqual(historyMap.highlightedCountries(WISHLIST, paris), ['France']);
  const policy = WISHLIST.find((event) => event.id === 'khoan-100-1981');
  assert.deepEqual(historyMap.highlightedCountries(WISHLIST, policy), []);
});

test('highlight names match the actual globe geography in both eras', () => {
  const geo = JSON.parse(readFileSync(new URL('../public/assets/countries-50m.geojson', import.meta.url)));
  for (const list of [PLACES, WISHLIST]) {
    for (const event of list) {
      for (const country of historyMap.highlightedCountries(list, event)) {
        assert.ok(geo.features.some((feature) => feature.properties.ADMIN === country || feature.properties.NAME === country), country);
      }
    }
  }
});

test('related markers retain their own country and location identity', () => {
  const diplomacy = WISHLIST.find((event) => event.id === 'ngoai-giao-1950');
  const pins = historicalPins(WISHLIST, diplomacy);
  const beijing = pins.find((pin) => pin.city === 'Bắc Kinh');
  assert.equal(beijing.locationId, 'beijing');
  assert.equal(beijing.country, 'Trung Quốc');
  assert.equal(beijing.mapCountry, 'China');
  assert.equal(beijing.id, diplomacy.id);
});

test('location links stay within their event and unlocated events have no focus', () => {
  const diplomacy = WISHLIST.find((event) => event.id === 'ngoai-giao-1950');
  assert.equal(historyMap.eventLocation(diplomacy, 'beijing').lng, 116.4074);
  assert.equal(historyMap.eventLocation(diplomacy, 'geneva').id, 'hanoi');
  assert.equal(historyMap.eventLocation(null, 'hanoi'), null);
  const policy = WISHLIST.find((event) => event.id === 'khoan-100-1981');
  assert.equal(historyMap.eventLocation(policy, 'hanoi'), null);
});

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
