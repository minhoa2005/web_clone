import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createExperience,
  displayPhase,
  evidenceDocked,
  globeArrived,
  restoreEvent,
  selectEvent,
  skipTransition,
  transitionIsRunning,
} from '../src/experience.js';

test('an unselected experience is an overview that cannot open reading', () => {
  const state = createExperience();
  assert.equal(state.phase, 'overview');
  assert.equal(state.ready, false);
  assert.equal(transitionIsRunning(state), false);
});

test('selection gives immediate feedback and waits for a real completion signal', () => {
  const state = selectEvent(createExperience(), { eventId: 'hoi-nghi-1930', revision: 1, hasEvidence: true });
  assert.equal(state.phase, 'focusing');
  assert.equal(state.ready, false);
  assert.equal(transitionIsRunning(state), true);
  assert.equal(state.eventId, 'hoi-nghi-1930');
});

test('the panel opens on evidence docking, not before', () => {
  const focusing = selectEvent(createExperience(), { eventId: 'hoi-nghi-1930', revision: 1, hasEvidence: true });
  const presenting = globeArrived(focusing, 1);
  assert.equal(presenting.phase, 'presenting-evidence');
  assert.equal(presenting.ready, false);

  const reading = evidenceDocked(presenting, 1);
  assert.equal(reading.phase, 'reading');
  assert.equal(reading.ready, true);
  assert.equal(transitionIsRunning(reading), false);
});

test('events without a source page open reading as soon as the globe arrives', () => {
  const focusing = selectEvent(createExperience(), { eventId: 'wto-2007', revision: 3, hasEvidence: false });
  const reading = globeArrived(focusing, 3);
  assert.equal(reading.phase, 'reading');
  assert.equal(reading.ready, true);
});

test('skipping opens the reading panel from either transition phase', () => {
  const focusing = selectEvent(createExperience(), { eventId: 'dien-bien-1954', revision: 2, hasEvidence: true });
  assert.equal(skipTransition(focusing).phase, 'reading');
  assert.equal(skipTransition(globeArrived(focusing, 2)).ready, true);

  const reading = skipTransition(focusing);
  assert.equal(skipTransition(reading), reading, 'skip is a no-op once reading');
});

test('reduced motion jumps straight to the readable state', () => {
  const state = selectEvent(createExperience(), { eventId: 'doc-lap-1945', revision: 4, hasEvidence: true, reducedMotion: true });
  assert.equal(state.phase, 'reading');
  assert.equal(state.ready, true);
  assert.equal(transitionIsRunning(state), false);
});

test('stale signals from a superseded selection are ignored', () => {
  const first = selectEvent(createExperience(), { eventId: 'hanh-trinh-1911', revision: 1, hasEvidence: true });
  const second = selectEvent(first, { eventId: 'mua-xuan-1975', revision: 2, hasEvidence: true });

  assert.deepEqual(globeArrived(second, 1), second);
  assert.deepEqual(evidenceDocked(second, 1), second);
  assert.equal(globeArrived(second, 2).phase, 'presenting-evidence');
});

test('rapid reselection always ends on the final event', () => {
  let state = createExperience();
  const ids = ['hanh-trinh-1911', 'yeu-sach-1919', 'hoi-nghi-1930', 'dien-bien-1954'];
  ids.forEach((eventId, index) => {
    state = selectEvent(state, { eventId, revision: index + 1, hasEvidence: true });
  });
  assert.equal(state.eventId, 'dien-bien-1954');
  assert.equal(state.revision, 4);
  assert.equal(globeArrived(state, 3), state);
  assert.equal(globeArrived(state, 4).phase, 'presenting-evidence');
});

test('restoring a deep link opens reading immediately', () => {
  const state = restoreEvent({ eventId: 'geneve-1954', revision: 0, hasEvidence: true });
  assert.equal(state.phase, 'reading');
  assert.equal(state.ready, true);
});

test('narrating and complete are derived from the tour without reopening the transition', () => {
  const reading = evidenceDocked(globeArrived(
    selectEvent(createExperience(), { eventId: 'dai-hoi-vi-1986', revision: 5, hasEvidence: true }),
    5,
  ), 5);

  assert.equal(displayPhase(reading, 'playing'), 'narrating');
  assert.equal(displayPhase(reading, 'complete'), 'complete');
  assert.equal(displayPhase(reading, 'idle'), 'reading');
  assert.equal(displayPhase(createExperience(), 'playing'), 'overview');
});
