import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../src/history.js';
import { EVENT_ILLUSTRATIONS } from '../src/eventImages.js';
import { IMAGE_METADATA, getImageAspect, getImageDimensions } from '../src/imageMetadata.js';

test('IMAGE_METADATA contains records with valid width, height and aspect ratio', () => {
  const keys = Object.keys(IMAGE_METADATA);
  assert.ok(keys.length >= 200, `Expected at least 200 images indexed, got ${keys.length}`);

  for (const [key, meta] of Object.entries(IMAGE_METADATA)) {
    assert.ok(meta.width > 0, `Width must be > 0 for ${key}`);
    assert.ok(meta.height > 0, `Height must be > 0 for ${key}`);
    assert.ok(meta.aspect > 0, `Aspect must be > 0 for ${key}`);
    assert.ok(!Number.isNaN(meta.aspect), `Aspect cannot be NaN for ${key}`);
    const expectedAspect = Math.round((meta.width / meta.height) * 1000) / 1000;
    assert.equal(meta.aspect, expectedAspect, `Aspect calculation mismatch for ${key}`);
  }
});

test('every published event illustration resolves to its true aspect ratio', () => {
  for (const event of EVENTS) {
    const illustration = EVENT_ILLUSTRATIONS[event.id];
    assert.ok(illustration, `Missing illustration config for ${event.id}`);

    const aspect = getImageAspect(illustration.src);
    assert.ok(aspect > 0.5 && aspect < 2.5, `Aspect ${aspect} out of reasonable range for ${illustration.src}`);

    const dims = getImageDimensions(illustration.src);
    assert.ok(dims, `Dimensions missing for ${illustration.src}`);
    assert.ok(dims.width >= 100, `Width too small for ${illustration.src}`);
    assert.ok(dims.height >= 100, `Height too small for ${illustration.src}`);
  }
});

test('getImageAspect resolves by exact path, relative path, or filename', () => {
  const byExact = getImageAspect('assets/events/hanh-trinh-1911.webp');
  const byRelative = getImageAspect('/assets/events/hanh-trinh-1911.webp');
  const byFilename = getImageAspect('hanh-trinh-1911.webp');

  assert.ok(byExact > 1.5, 'hanh-trinh-1911 is a landscape image (~1.6)');
  assert.equal(byExact, byRelative);
  assert.equal(byExact, byFilename);
});

test('getImageAspect falls back safely for unknown images', () => {
  const fallback = getImageAspect('assets/events/non-existent-image.webp', 1.45);
  assert.equal(fallback, 1.45);
});
