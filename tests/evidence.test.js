import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { HISTORICAL_PLACES, eventEvidence } from '../src/historicalPlaces.js';

test('every event resolves to exactly one cited evidence surface', () => {
  for (const place of HISTORICAL_PLACES) {
    const evidence = eventEvidence(place);
    assert.ok(evidence, place.id);
    if (evidence.kind === 'page') {
      assert.ok(Number.isInteger(evidence.page) && evidence.page > 0, place.id);
      assert.ok(existsSync(new URL(`../public/${evidence.src}`, import.meta.url)), `${place.id}: ${evidence.src}`);
    } else {
      assert.equal(evidence.kind, 'external', place.id);
      assert.equal(new URL(evidence.url).protocol, 'https:', place.id);
    }
  }
});

test('textbook events cite the first page of their record', () => {
  const evidence = eventEvidence(HISTORICAL_PLACES.find((place) => place.id === 'hoi-nghi-1930'));
  assert.equal(evidence.kind, 'page');
  assert.equal(evidence.page, 61);
  assert.match(evidence.title, /trang 61/);
});

test('supplement-only events fall back to their external record without a fake page', () => {
  for (const id of ['asean-1995', 'wto-2007']) {
    const evidence = eventEvidence(HISTORICAL_PLACES.find((place) => place.id === id));
    assert.equal(evidence.kind, 'external', id);
    assert.equal(evidence.page, undefined, id);
  }
});

test('events without a page or external record produce no evidence card', () => {
  assert.equal(eventEvidence(null), null);
  assert.equal(eventEvidence({ id: 'no-source', photos: [] }), null);
});
