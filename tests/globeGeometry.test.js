import test from 'node:test';
import assert from 'node:assert/strict';
import { countryOutlinePositions } from '../src/globeGeometry.js';

test('batched borders retain polygon and multipolygon rings, including holes', () => {
  const ring = [[0, 0], [90, 0], [0, 90], [0, 0]];
  const features = [
    { geometry: { type: 'Polygon', coordinates: [ring, ring] } },
    { geometry: { type: 'MultiPolygon', coordinates: [[ring], [ring]] } },
  ];
  const points = countryOutlinePositions(features, 100.51);
  assert.equal(points.length, 4 * 3 * 2 * 3);
  for (let i = 0; i < points.length; i += 3) assert.ok(Math.abs(Math.hypot(...points.slice(i, i + 3)) - 100.51) < .001);
  assert.ok(Math.abs(points[2] - 100.51) < .001);
  assert.ok(Math.abs(points[3] - 100.51) < .001);
  assert.ok(Math.abs(points[10] - 100.51) < .001);
});
