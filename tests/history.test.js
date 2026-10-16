import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { EVENTS, LOCATIONS, PERIODS, readEventHash, searchEvents } from '../src/history.js';

test('chronological journey covers every period with unique, shareable records', () => {
  assert.equal(new Set(EVENTS.map((event) => event.id)).size, EVENTS.length);
  for (let i = 1; i < EVENTS.length; i++) assert.ok(EVENTS[i].year >= EVENTS[i - 1].year);
  for (const period of PERIODS) assert.ok(EVENTS.filter((event) => event.period === period.id).length >= 3);
  assert.equal(EVENTS[0].year, 1911);
  assert.equal(EVENTS.at(-1).year, 2021);
});

test('every published event has usable evidence, not a missing source image', () => {
  for (const event of EVENTS) {
    assert.ok(event.pages.length || event.external?.url, event.id);
    for (const page of event.pages) assert.ok(existsSync(new URL(`../public/assets/sources/page-${page}.webp`, import.meta.url)), `${event.id}: page ${page}`);
    if (event.external) assert.equal(new URL(event.external.url).protocol, 'https:');
  }
});

test('relationships only connect documented places in the selected event', () => {
  for (const event of EVENTS) {
    for (const id of event.places) {
      assert.ok(LOCATIONS[id], `${event.id}: ${id}`);
      assert.ok(Math.abs(LOCATIONS[id].lat) <= 90 && Math.abs(LOCATIONS[id].lng) <= 180);
    }
    for (const pair of event.links || []) {
      assert.equal(pair.length, 2);
      for (const id of pair) assert.ok(event.places.includes(id), `${event.id}: ${id}`);
    }
  }
});

test('Vietnamese search accepts unaccented and accented terms and place names', () => {
  assert.deepEqual(searchEvents('doi moi'), searchEvents('ĐỔI MỚI'));
  assert.ok(searchEvents('dien bien').some((event) => event.id === 'dien-bien-1954'));
  assert.ok(searchEvents('1930').some((event) => event.id === 'hoi-nghi-1930'));
  assert.ok(searchEvents('matxcova').some((event) => event.id === 'lien-xo-1923'));
});

test('period filters and empty results do not silently broaden search', () => {
  assert.ok(searchEvents('', 'formation').every((event) => event.period === 'formation'));
  assert.equal(searchEvents('WTO', 'formation').length, 0);
  assert.equal(searchEvents('no-such-historical-event').length, 0);
  assert.equal(searchEvents('   ').length, EVENTS.length);
});

test('links restore selected records; malformed and unknown links recover safely', () => {
  for (const event of EVENTS) assert.equal(readEventHash(`#event=${encodeURIComponent(event.id)}`), event);
  for (const hash of ['', '#event=unknown', '#event=%E0%A4%A', '#florence']) assert.equal(readEventHash(hash), EVENTS[0]);
});

test('policies without a verified venue remain readable without invented coordinates', () => {
  const policy = EVENTS.find((event) => event.id === 'khoan-100-1981');
  assert.deepEqual(policy.places, []);
  assert.ok(policy.summary && policy.context && policy.significance && policy.pages.length);
});
