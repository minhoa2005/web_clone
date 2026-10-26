import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../src/history.js';
import { TIMELINE_STATE, nextTimelineState, timelineWindow } from '../src/timeline.js';

test('mobile timeline cycles through collapsed, preview and full states', () => {
  assert.equal(nextTimelineState(TIMELINE_STATE.collapsed), TIMELINE_STATE.preview);
  assert.equal(nextTimelineState(TIMELINE_STATE.preview), TIMELINE_STATE.full);
  assert.equal(nextTimelineState(TIMELINE_STATE.full), TIMELINE_STATE.collapsed);
});

test('mobile timeline keeps the current event and its nearest neighbors visible', () => {
  const middle = timelineWindow(EVENTS, EVENTS[4].id);
  assert.deepEqual(middle.map((event) => event.id), EVENTS.slice(3, 6).map((event) => event.id));
  assert.deepEqual(timelineWindow(EVENTS, EVENTS[0].id).map((event) => event.id), EVENTS.slice(0, 2).map((event) => event.id));
  assert.deepEqual(timelineWindow(EVENTS, 'missing').map((event) => event.id), EVENTS.slice(0, 2).map((event) => event.id));
});
